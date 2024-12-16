"use server";

import { CreateLessonSchemaServer } from "@/app/admin/lessons/lessons.schema";
import {
  LessonsResponse,
  UpdateLessonSchema,
} from "@/app/admin/lessons/lessons.types";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

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
