import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { OpenAI } from "openai";
import { DeepgramClient } from "@deepgram/sdk";
import { ProcessRequest, SummarizeRequest, SummarizeResponse } from "@/types";
import { Session } from "next-auth";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY as string);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sessionId = params.id;
  const { transcript: userProvidedTranscript, userNotes, language }: ProcessRequest = await request.json();

  try {
    const recordingSession = await prisma.recording_sessions.findUnique({
      where: { id: sessionId, user_id: session.user.id },
    });

    if (!recordingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    // Allow processing if status is 'recording' (after upload) or 'processing' (if retrying/re-processing)
    if (recordingSession.status !== 'recording' && recordingSession.status !== 'processing') {
      return NextResponse.json({ message: `Session is not in 'recording' or 'processing' status. Current status: ${recordingSession.status}` }, { status: 409 });
    }

    // Update status to 'processing' if it was 'recording'
    if (recordingSession.status === 'recording') {
      await prisma.recording_sessions.update({
        where: { id: sessionId },
        data: { status: 'processing' },
      });
    }

    if (!recordingSession.audio_file_path) {
      return NextResponse.json({ message: "Audio file not found for this session" }, { status: 400 });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("AWS_S3_BUCKET_NAME is not defined");
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: recordingSession.audio_file_path,
    });
    const { Body } = await s3Client.send(getObjectCommand);

    if (!Body) {
      throw new Error("Failed to retrieve audio from S3");
    }

    const audioBuffer = Buffer.from(await Body.transformToByteArray());

    let fullTranscript = userProvidedTranscript;

    if (!userProvidedTranscript || userProvidedTranscript.trim() === "") {
      try {
        // OpenAI Whisper API expects a Blob or File object, not a Buffer directly.
        // We need to convert the Buffer to a Blob/File for the API.
        const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });
        const audioFile = new File([audioBlob], "audio.webm", { type: "audio/webm" });

        const transcription = await openai.audio.transcriptions.create({
          file: audioFile,
          model: "whisper-1",
          language: language,
        });
        fullTranscript = transcription.text;
      } catch (openaiError) {
        console.warn("OpenAI Whisper failed, falling back to Deepgram:", openaiError);
        try {
          const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
            model: "nova-2",
            smart_format: true,
            language: language,
          });
          if (error) throw error;
          fullTranscript = result?.results?.channels[0]?.alternatives[0]?.transcript || "";
        } catch (deepgramError) {
          console.error("Deepgram transcription also failed:", deepgramError);
          throw new Error("Audio transcription failed with both OpenAI and Deepgram.");
        }
      }
    }

    if (!fullTranscript) {
      throw new Error("Transcription failed, no text generated.");
    }

    const summarizeRequest: SummarizeRequest = {
      transcript: fullTranscript,
      userNotes: userNotes || "",
      language: language,
      meetingContext: recordingSession.title,
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const aiSummaryResponse = await fetch(`${baseUrl}/api/ai/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(summarizeRequest),
    });

    if (!aiSummaryResponse.ok) {
      const errorData = await aiSummaryResponse.json();
      throw new Error(`AI summarization failed: ${errorData.message}`);
    }

    const aiOutput: SummarizeResponse = await aiSummaryResponse.json();

    await prisma.recording_sessions.update({
      where: { id: sessionId },
      data: {
        transcript: fullTranscript,
        ai_summary: aiOutput.summary,
        user_notes: userNotes,
        status: "completed",
      },
    });

    const aiOutputsToCreate = [];
    if (aiOutput.summary) {
      aiOutputsToCreate.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        type: "summary",
        content: aiOutput.summary,
      });
    }
    if (aiOutput.keyPoints && aiOutput.keyPoints.length > 0) {
      aiOutputsToCreate.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        type: "key_points",
        content: JSON.stringify(aiOutput.keyPoints),
      });
    }
    if (aiOutput.todos && aiOutput.todos.length > 0) {
      aiOutputsToCreate.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        type: "todos",
        content: JSON.stringify(aiOutput.todos),
      });
    }
    if (aiOutput.decisions && aiOutput.decisions.length > 0) {
      aiOutputsToCreate.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        type: "decisions",
        content: JSON.stringify(aiOutput.decisions),
      });
    }
    if (aiOutput.openIssues && aiOutput.openIssues.length > 0) {
      aiOutputsToCreate.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        type: "open_issues",
        content: JSON.stringify(aiOutput.openIssues),
      });
    }

    if (aiOutputsToCreate.length > 0) {
      await prisma.ai_outputs.createMany({
        data: aiOutputsToCreate.map(output => ({
          ...output,
          confidence_score: output.confidence_score || 0.95, // Mock confidence score, ensure it's defined
          created_at: new Date(),
        })),
      });
    }

    return NextResponse.json(
      { message: "Session processed successfully", transcript: fullTranscript, aiSummary: aiOutput.summary },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing session:", error);
    await prisma.recording_sessions.update({
      where: { id: sessionId },
      data: { status: "failed" },
    });
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}


