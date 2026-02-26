import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // Correct path to authOptions
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.id;
    const formData = await req.formData();
    const audioBlob = formData.get("audioBlob") as Blob | null;
    const userNotes = formData.get("userNotes") as string | null;

    if (!audioBlob) {
      return NextResponse.json(
        { message: "Missing audioBlob in form data" },
        { status: 400 }
      );
    }

    const existingSession = await prisma.recordingSession.findUnique({
      where: { id: sessionId, userId: session.user.id },
    });

    if (!existingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    // Generate a unique file name for S3
    const fileExtension = audioBlob.type.split("/")[1] || "webm"; // Default to webm if type is not clear
    const fileName = `audio/${session.user.id}/${sessionId}-${Date.now()}.${fileExtension}`;

    // Upload audio to S3
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: audioBlob.type,
      ACL: "private", // Ensure private access
    });

    await s3Client.send(uploadCommand);

    // Update session with audio file path and user notes
    const updatedSession = await prisma.recordingSession.update({
      where: { id: sessionId },
      data: {
        audio_file_path: fileName,
        user_notes: userNotes,
        status: "processing", // Change status to processing after upload
      },
    });

    return NextResponse.json(
      {
        message: "Audio uploaded successfully",
        session: updatedSession,
        audioPath: fileName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading audio:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


