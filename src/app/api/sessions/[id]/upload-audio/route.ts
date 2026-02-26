import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Session } from "next-auth";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sessionId = params.id;
  const formData = await request.formData();
  const audioBlob = formData.get("audioBlob") as Blob | null;
  const userNotes = formData.get("userNotes") as string | null;

  if (!audioBlob) {
    return NextResponse.json({ message: "Audio file is required" }, { status: 400 });
  }

  try {
    const recordingSession = await prisma.recording_sessions.findUnique({
      where: { id: sessionId, user_id: session.user.id },
    });

    if (!recordingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("AWS_S3_BUCKET_NAME is not defined");
    }

    const fileExtension = audioBlob.type.split("/")[1] || "webm";
    const fileName = `audio/${session.user.id}/${sessionId}.${fileExtension}`;

    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: audioBlob.type,
    });

    await s3Client.send(uploadCommand);

    await prisma.recording_sessions.update({
      where: { id: sessionId },
      data: {
        audio_file_path: fileName,
        user_notes: userNotes,
        status: "processing",
      },
    });

    return NextResponse.json(
      { message: "Audio uploaded successfully", filePath: fileName },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading audio:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

