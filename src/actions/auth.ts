"use server";

import { AuthResponse, UserProfile } from "@/app/auth/auth.types";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export const authenticate = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const supabase = await createClient();

  try {
    // Attempt login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { user: null, error: signInError.message };
    }

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        user: null,
        error: userError?.message || "Authentication failed",
      };
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single<UserProfile>();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        user: null,
        error: "Failed to fetch user profile",
      };
    }

    // Verify admin access
    if (profile.type !== "ADMIN") {
      await supabase.auth.signOut();
      return {
        user: null,
        error: "Access denied: Admin privileges required",
      };
    }

    // Return combined user data
    return {
      user: {
        ...profile,
        email: user.email || profile.email,
      },
      error: null,
    };
  } catch (error) {
    await supabase.auth.signOut();
    return {
      user: null,
      error: "An unexpected error occurred",
    };
  }
};

export const handleSignInWithGoogle = async () => {
  const supabase = await createClient();
  const provider = "google";
  const { data } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo:
        process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL ||
        "http://localhost:3000/auth/callback",
    },
  });

  if (data.url) {
    redirect(data.url);
  }
};
