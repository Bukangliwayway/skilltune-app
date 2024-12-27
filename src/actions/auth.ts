"use server";

import { createClient } from "@/supabase/server";
import { log } from "console";
import { toast } from "sonner";

export const authenticate = async (email: string, password: string) => {
  const supabase = await createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Error: ", error);
      return false;
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getLatestUsers = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(`Error fetching latest users: ${error.message}`);

  return data.map(
    (user: { id: string; email: string; created_at: string | null }) => ({
      id: user.id,
      email: user.email,
      date: user.created_at,
    })
  );
};
