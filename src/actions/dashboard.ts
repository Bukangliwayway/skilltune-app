"use server";
import { createClient } from "@/supabase/server";

async function getTotalUsers() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("type", "USER");

  if (error) {
    console.error("Error fetching total users:", error);
    return 0;
  }
  if (error) throw error;

  return count || 0;
}

async function getAverageQuizScore() {
  const supabase = await createClient();

  // Get total attempts
  const { count: totalAttempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true });

  // Get passed attempts
  const { count: passedAttempts, error: passedError } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("is_passed", true);

  if (attemptsError || passedError) throw attemptsError || passedError;

  return {
    attempts: totalAttempts ?? 0,
    pass: passedAttempts ?? 0,
  };
}

async function getActiveUsers() {
  try {
    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("learning_progress")
      .select("user_id", {
        count: "exact",
        head: false,
      })
      .gte("lesson_completed_at", thirtyDaysAgo.toISOString());
    const distinctUserCount = new Set(data?.map((record) => record.user_id))
      .size;

    if (error) throw error;
    return distinctUserCount ?? 0;
  } catch (error) {
    console.error("Error fetching active users:", error);
    return 0;
  }
}

async function getQuizPerformance() {
  const supabase = await createClient();
  // First get all lessons with DISTINCT
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, sequence, title")
    .order("sequence");
  if (lessonsError) throw lessonsError;
  // Get all quiz attempts with their associated quiz_deck_id
  const { data: quizAttempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("quiz_deck_id, is_passed");
  if (attemptsError) throw attemptsError;
  // Get quiz decks with their lesson_id
  const { data: quizDecks, error: decksError } = await supabase
    .from("quiz_decks")
    .select("id, lesson_id");
  if (decksError) throw decksError;
  // Process the data
  const result = (lessons || []).map((lesson) => {
    // Find quiz decks for this lesson
    const lessonQuizDecks = quizDecks.filter(
      (deck) => deck.lesson_id === lesson.id
    );
    // Find attempts for these quiz decks
    const lessonAttempts = quizAttempts.filter((attempt) =>
      lessonQuizDecks.some((deck) => deck.id === attempt.quiz_deck_id)
    );
    // Calculate statistics
    const totalAttempts = lessonAttempts.length;
    const passedAttempts = lessonAttempts.filter(
      (attempt) => attempt.is_passed
    ).length;

    return {
      bardisplay: String(lesson.sequence || ""),
      tooltipdisplayquiz: `${lesson.title}`,
      attempts: totalAttempts as number,
      passed: passedAttempts as number,
    };
  });
  return result;
}

async function getLessonCompletion() {
  const supabase = await createClient();

  // First get all lessons, ordered by sequence
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, sequence, title")
    .order("sequence");
  if (lessonsError) throw lessonsError;

  // Get all completed learning progress entries
  const { data: progress, error: progressError } = await supabase
    .from("learning_progress")
    .select("lesson_id, user_id")
    .not("lesson_completed_at", "is", null); // Only get completed lessons
  if (progressError) throw progressError;

  const { count: totalUsers, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("type", "USER");

  if (error) {
    console.error("Error fetching total users:", error);
    return 0;
  }

  interface LessonCompletionResult {
    lesson: string;
    users: number;
    totalUsers: number;
  }

  // Process the data
  const result = (lessons || []).map((lesson): LessonCompletionResult => {
    // Find all progress entries for this lesson
    const lessonProgress = progress.filter(
      (entry) => entry.lesson_id === lesson.id
    );

    // Count unique users who completed this lesson
    const uniqueUsers = new Set(lessonProgress.map((entry) => entry.user_id))
      .size;

    return {
      lesson: `Lesson ${lesson.sequence || ""}`,
      users: uniqueUsers,
      totalUsers: totalUsers || 0,
    };
  });

  return result;
}

export async function getDashboardData() {
  const totalUsers = await getTotalUsers();
  const averageQuizScore = await getAverageQuizScore();
  const totalActiveUsers = await getActiveUsers();
  const quizPerformance = await getQuizPerformance();
  const lessonCompletion = await getLessonCompletion();

  return {
    totalUsers: totalUsers,
    averageQuizScore: averageQuizScore,
    totalActiveUsers: totalActiveUsers,
    quizPerformance: quizPerformance,
    lessonCompletion: lessonCompletion,
  };
}
