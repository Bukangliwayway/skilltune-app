"use server";

import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { CreateLessonSchemaServer } from "@/app/admin/lessons/lessons.schema";
import {
  LessonsResponse,
  UpdateLessonSchema,
} from "@/app/admin/lessons/lessons.types";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";
import { getUploadParams } from "./s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getAllLessons = async (): Promise<LessonsResponse> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .returns<LessonsResponse>();

  if (error) throw new Error(`Error fetching categories: ${error.message}`);
  return data || [];
};

export const createLesson = async ({
  title,
  description,
  sequence,
  pdfUrl,
  videoUrl,
}: CreateLessonSchemaServer) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("lessons").insert({
    title,
    description,
    sequence,
    pdf_url: pdfUrl,
    video_url: videoUrl,
  });

  if (error) throw new Error(`Error creating category: ${error.message}`);

  revalidatePath("/admin/lessons");
  return data;
};

export const deleteLesson = async (id: Number) => {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().match({ id });

  if (error) {
    throw new Error(`Error deleting Lesson: ${error.message}`);
  }

  revalidatePath("/admin/lessons");
};

export const fileUploadHandler = async (
  formData: FormData,
  fileType: "pdf" | "video"
) => {
  const supabase = await createClient();
  if (!formData) return;

  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) throw new Error("Expected a file");

  // Validate file type
  const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];
  const ACCEPTED_PDF_TYPES = ["application/pdf"];

  if (fileType === "video" && !ACCEPTED_VIDEO_TYPES.includes(fileEntry.type)) {
    throw new Error(
      "Invalid video format. Only MP4 and WebM are accepted" + fileEntry.type
    );
  }

  if (fileType === "pdf" && !ACCEPTED_PDF_TYPES.includes(fileEntry.type)) {
    throw new Error("Invalid file format. Only PDF is accepted ");
  }

  const fileName = `${fileType}-${Date.now()}-${fileEntry.name}`;

  try {
    const { data, error } = await supabase.storage
      .from("skilltuneapp-bucket")
      .upload(fileName, fileEntry, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(`Error uploading ${fileType}:`, error);
      throw new Error(`Error uploading ${fileType}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("skilltuneapp-bucket").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${fileType}:`, error);
    throw new Error(`Error uploading ${fileType}`);
  }
};

export const updateLesson = async ({
  title,
  description,
  sequence,
  pdf_url,
  video_url,
  id,
}: UpdateLessonSchema) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .update({
      title,
      description,
      sequence,
      pdf_url,
      video_url,
    })
    .match({ id });

  if (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }

  revalidatePath("/admin/lessons");

  return data;
};

const uploadConfig = {
  maxSizeBytes: 500 * 1024 * 1024, // 500MB
};

export async function getS3UploadParams(
  filename: string,
  contentType: string,
  sizeBytes: number
) {
  // Validate file size
  if (sizeBytes > uploadConfig.maxSizeBytes) {
    throw new Error(
      `File size exceeds the maximum limit of ${
        uploadConfig.maxSizeBytes / (1024 * 1024)
      }MB`
    );
  }

  // If validation passes, proceed with getting upload params
  const response = await getUploadParams({ filename, contentType });

  return response;
}


const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function createMultipartUpload(
  filename: string,
  contentType: string
) {
  "use server";

  const key = `uploads/${Date.now()}-${filename}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const { UploadId } = await s3Client.send(command);
    return {
      uploadId: UploadId,
      key,
    };
  } catch (error) {
    console.error("Error creating multipart upload:", error);
    throw new Error("Failed to create multipart upload");
  }
}



export async function prepareUploadPart(
  key: string,
  uploadId: string,
  partNumber: number
) {
  "use server";

  const command = new UploadPartCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    url: signedUrl,
    method: "PUT",
  };
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { ETag: string; PartNumber: number }[]
) {
  "use server";

  const command = new CompleteMultipartUploadCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts,
    },
  });

  await s3Client.send(command);
  return { location: key };
}

export async function abortMultipartUpload(key: string, uploadId: string) {
  "use server";

  const command = new AbortMultipartUploadCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
  });

  await s3Client.send(command);
}