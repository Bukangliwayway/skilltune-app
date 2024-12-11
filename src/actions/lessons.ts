'use server';

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

