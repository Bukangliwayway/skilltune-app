"use server";

import { LessonsResponse } from "@/app/admin/lessons/lessons.types";
import { createClient } from "@/supabase/server";

export const getAllLessons = async (): Promise<LessonsResponse> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .returns<LessonsResponse>();

  if (error) throw new Error(`Error fetching categories: ${error.message}`);
  return data || [];
};

export const fileUploadHandler = async (
  formData: FormData,
  fileType: "pdf" | "video"
) => {
  const supabase = await createClient();
  if (!formData) return;

  const fileEntry = formData.get("file");
  console.log("File entry:", fileEntry);

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
