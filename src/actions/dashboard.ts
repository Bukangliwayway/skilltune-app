"use server";
import { createClient } from "@/supabase/server";

async function getTotalUsers() {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

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

// async function getActiveUsers() {
//   const supabase = await createClient();

//   // Get date from 30 days ago
//   const now = new Date();
//   const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString();

//   const { count, error } = await supabase
//     .from("learning_progress")
//     .select("user_id", {
//       count: "exact",
//       head: true,
//     })
//     .gte("lesson_completed_at", thirtyDaysAgo)
//     .eq("lesson_completed", 1);

//   if (error) throw error;

//   return count ?? 0;
// }

// async function getQuizPerformance() {
//   const supabase = await createClient();

//   const { data, error } = await supabase
//     .from("quiz_attempts")
//     .select(
//       `
//       count(*) as attempts,
//       sum(case when is_passed = true then 1 else 0 end) as passed,
//       quiz_decks (
//         lessons (
//           sequence,
//           title
//         )
//       )
//     `
//     )
//     .not("quiz_deck_id", "is", null)
//     .order("quiz_decks.lessons.sequence");

//   if (error) throw error;

//   // Type assertion to handle the query result
//   const typedData = data as unknown as Array<{
//     attempts: number;
//     passed: number;
//     quiz_decks?: {
//       lessons?: {
//         sequence: number;
//         title: string;
//       };
//     };
//   }>;

//   return (typedData || []).map((item) => ({
//     bardisplay: String(item.quiz_decks?.lessons?.sequence || ""),
//     tooltipdisplayquiz: `Quiz ${item.quiz_decks?.lessons?.sequence || ""}`,
//     attempts: Number(item.attempts) || 0,
//     passed: Number(item.passed) || 0,
//   }));
// }

// async function getLessonCompletion() {
//   const supabase = await createClient();

//   const { data, error } = await supabase
//     .from("learning_progress")
//     .select(
//       `
//       count:count(distinct user_id),
//       lessons (
//         sequence,
//         title
//       )
//     `
//     )
//     .eq("lesson_completed", 1)
//     .not("lesson_completed_at", "is", null)
//     .order("lessons.sequence");

//   if (error) throw error;

//   interface LessonData {
//     count: number;
//     lessons?: {
//       sequence: number;
//       title: string;
//     };
//   }

//   interface LessonCompletionResult {
//     lesson: string;
//     users: number;
//   }

//   // Type assertion for the query result
//   return ((data as unknown as LessonData[]) || []).map(
//     (item): LessonCompletionResult => ({
//       lesson: `Lesson ${item.lessons?.sequence || ""}`,
//       users: Number(item.count) || 0,
//     })
//   );
// }

export async function getDashboardData() {
  const totalUsers = await getTotalUsers();
  const averageQuizScore = await getAverageQuizScore();
  console.log(totalUsers, averageQuizScore);

  return {
    totalUsers: totalUsers,
    averageQuizScore: averageQuizScore,
    // totalActiveUsers: await getActiveUsers(),
    // quizPerformance: await getQuizPerformance(),
    // lessonCompletion: await getLessonCompletion(),
  };
}
