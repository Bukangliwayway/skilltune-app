"use server";

import { CreateQuizSchemaServer } from "@/app/admin/quizzes/quizzes.schema";
import {
  QuizzesResponse,
  UpdateQuizSchema,
} from "@/app/admin/quizzes/quizzes.types";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export const getAllQuizzes = async (): Promise<QuizzesResponse> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_decks")
    .select("*")
    .returns<QuizzesResponse>();

  if (error) throw new Error(`Error fetching categories: ${error.message}`);
  return data || [];
};

export const createQuiz = async ({
  title,
  description,
  lesson_id,
  csvUrl,
}: CreateQuizSchemaServer) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("quiz_decks").insert({
    title,
    description,
    lesson_id,
    csv_version: csvUrl,
  });

  if (error) throw new Error(`Error creating category: ${error.message}`);

  revalidatePath("/admin/quizzes");
  return data;
};

export const deleteQuiz = async (id: Number) => {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_decks").delete().match({ id });

  if (error) {
    throw new Error(`Error deleting Quiz: ${error.message}`);
  }

  revalidatePath("/admin/quizzes");
};

export const fileUploadHandler = async (formData: FormData) => {
  const supabase = await createClient();
  if (!formData) return;
  if(!(formData instanceof FormData)) throw new Error("Expected a FormData object");

  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) throw new Error("Expected a file");

  // Validate file type
  const ACCEPTED_CSV_TYPES = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
  ];

  if (!ACCEPTED_CSV_TYPES.includes(fileEntry.type)) {
    throw new Error("Invalid file format. Only PDF is accepted ");
  }

  const fileName = `${"csv"}-${Date.now()}-${fileEntry.name}`;

  try {
    const { data, error } = await supabase.storage
      .from("skilltuneapp-bucket")
      .upload(fileName, fileEntry, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(`Error uploading csv:`, error);
      throw new Error(`Error uploading csv`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("skilltuneapp-bucket").getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading csv:`, error);
    throw new Error(`Error uploading csv`);
  }
};

export const updateQuiz = async ({
  id,
  title,
  description,
  lesson_id,
  csv_version,
}: UpdateQuizSchema) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_decks")
    .update({
      title,
      description,
      lesson_id,
      csv_version,
    })
    .match({ id });

  if (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }

  revalidatePath("/admin/quizzes");

  return data;
};
