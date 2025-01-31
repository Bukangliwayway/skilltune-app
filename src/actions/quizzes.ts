"use server";

import { CreateQuizSchemaServer } from "@/app/admin/quizzes/quizzes.schema";
import {
  FileUploadResponse,
  ProcessedQuizRow,
  QuizCsvRow,
  QuizDeckResponse,
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
}: CreateQuizSchemaServer): Promise<QuizDeckResponse> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_decks")
    .insert({
      title,
      description,
      lesson_id,
      csv_version: csvUrl,
    })
    .select() // Add select to return inserted row
    .single(); // Ensure single row is returned

  if (error) throw new Error(`Error creating quiz deck: ${error.message}`);
  if (!data) throw new Error("Failed to create quiz deck: No data returned");

  const response: QuizDeckResponse = {
    id: data.id,
    title: data.title || "", // Convert null to empty string
    description: data.description || "",
    lesson_id: data.lesson_id || 0,
    created_at: data.created_at,
    csv_version: data.csv_version || undefined,
  };
  revalidatePath("/admin/quizzes");
  return response;
};

export const deleteQuiz = async (id: number) => {
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_decks").delete().match({ id });

  if (error) {
    throw new Error(`Error deleting Quiz: ${error.message}`);
  }

  revalidatePath("/admin/quizzes");
};

export const getQuizById = async (id: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_decks")
    .select(
      `
    *,
    quiz_cards(
      *,
      choices(*)
    )
  `
    )
    .eq("id", id);

  if (error) {
    throw new Error(`Error deleting Quiz: ${error.message}`);
  }

  return data;
};

const EXPECTED_HEADERS = [
  "question",
  "choice a",
  "choice b",
  "choice c",
  "choice d",
  "correct answer",
  "explanation",
  "item score",
  "sequence",
];

export const updateQuizDeckIdForCards = async (newQuizDeckId: number) => {
  const supabase = await createClient();

  // First get all cards with temporary id (-1)
  const { data: cardsToUpdate, error: fetchError } = await supabase
    .from("quiz_cards")
    .select()
    .is("quiz_deck_id", null);

  if (fetchError) throw fetchError;
  if (!cardsToUpdate || cardsToUpdate.length === 0) return;

  // Update cards with new quiz_deck_id
  const { data: updatedCards, error: updateError } = await supabase
    .from("quiz_cards")
    .update({ quiz_deck_id: newQuizDeckId })
    .is("quiz_deck_id", null)
    .select();

  if (updateError) throw updateError;

  return updatedCards;
};

export async function preprocessCSVRow(row: string[]): Promise<string[]> {
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < row.length; i++) {
    if (row[i].startsWith('"') && !row[i].endsWith('"')) {
      startIndex = i;
    }
    if (startIndex !== -1 && row[i].endsWith('"')) {
      endIndex = i;
      break;
    }
  }

  if (startIndex !== -1 && endIndex !== -1) {
    const mergedExplanation = row.slice(startIndex, endIndex + 1).join(", ");
    const cleanedExplanation = mergedExplanation.replace(/^"|"$/g, "");
    return [
      ...row.slice(0, startIndex),
      cleanedExplanation,
      ...row.slice(endIndex + 1),
    ];
  }

  return row;
}

export async function validateQuizRow(
  row: string[],
  headers?: string[]
): Promise<ProcessedQuizRow> {
  // Basic validation checks
  if (row.length !== 9) {
    throw new Error("Invalid CSV format: Must have exactly 9 columns");
  }

  if (headers) {
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
    const missingHeaders = EXPECTED_HEADERS.filter(
      (expected) => !normalizedHeaders.includes(expected)
    );
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }
  }

  const correctAnswer = row[5]?.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(correctAnswer)) {
    throw new Error("Correct answer must be A, B, C, or D");
  }

  return {
    quizCard: {
      question: row[0].trim(),
      explanation: row[6]?.trim() || "",
      item_score: parseFloat(row[7]) > 0 ? parseFloat(row[7]) : 1,
      quiz_deck_id: null, // Will be set in the main function
      sequence:
        !isNaN(parseInt(row[8])) && parseInt(row[8]) > 0 ? parseInt(row[8]) : 1,
    },
    choices: [
      { choice: row[1].trim(), is_correct: correctAnswer === "A" },
      { choice: row[2].trim(), is_correct: correctAnswer === "B" },
      { choice: row[3].trim(), is_correct: correctAnswer === "C" },
      { choice: row[4].trim(), is_correct: correctAnswer === "D" },
    ],
  };
}
export const fileUploadHandler = async (
  formData: FormData,
  quiz_deck_id: number | null
): Promise<FileUploadResponse> => {
  const supabase = await createClient();
  if (!formData) return { status: "error", error: "No file provided" };

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return { status: "error", error: "Expected a file" };
  }

  try {
    // Parse and validate CSV data
    const text = await fileEntry.text();
    const rows = text
      .split(/\r?\n/)
      .map((row) => row.trim())
      .filter((row) => row.length > 0)
      .map((row) => row.split(",").map((cell) => cell.trim()));

    if (rows.length < 2) {
      return {
        status: "error",
        error: "CSV must contain headers and at least one data row",
      };
    }

    const headers = rows[0];
    const questions = rows.slice(1);

    // Process and validate all rows before making any changes
    const processedRows = await Promise.all(
      questions.map(async (row) => {
        const processedRow = await preprocessCSVRow(row);
        return await validateQuizRow(processedRow, headers);
      })
    );

    // If updating existing quiz deck, delete old data in batch
    if (quiz_deck_id !== null) {
      const { data: existingCards, error: fetchError } = await supabase
        .from("quiz_cards")
        .select("id")
        .eq("quiz_deck_id", quiz_deck_id);

      if (fetchError) throw fetchError;

      if (existingCards && existingCards.length > 0) {
        const cardIds = existingCards.map((card) => card.id);

        // Delete choices first (foreign key constraint)
        const { error: choicesDeleteError } = await supabase
          .from("choices")
          .delete()
          .in("quiz_card_id", cardIds);

        if (choicesDeleteError) throw choicesDeleteError;

        // Then delete quiz cards
        const { error: cardsDeleteError } = await supabase
          .from("quiz_cards")
          .delete()
          .eq("quiz_deck_id", quiz_deck_id);

        if (cardsDeleteError) throw cardsDeleteError;
      }
    }

    // Prepare quiz cards for batch insertion
    const quizCards = processedRows.map((row) => ({
      ...row.quizCard,
      quiz_deck_id,
    }));

    // Batch insert quiz cards
    const { data: insertedCards, error: quizError } = await supabase
      .from("quiz_cards")
      .insert(quizCards)
      .select();

    if (quizError) throw quizError;
    const createdQuizCards = insertedCards;

    // Prepare all choices for batch insertion
    const allChoices = createdQuizCards.flatMap((quizCard, index) =>
      processedRows[index].choices.map((choice) => ({
        ...choice,
        quiz_card_id: quizCard.id,
      }))
    );

    // Batch insert choices
    const { data: insertedChoices, error: choicesError } = await supabase
      .from("choices")
      .insert(allChoices)
      .select();

    if (choicesError) throw choicesError;
    const createdChoices = insertedChoices;

    // Batch update correct_choice_ids
    const updates = createdQuizCards.map((quizCard) => {
      const cardChoices = createdChoices.filter(
        (choice) => choice.quiz_card_id === quizCard.id
      );
      const correctChoice = cardChoices.find((choice) => choice.is_correct);
      return {
        id: quizCard.id,
        correct_choice_id: correctChoice?.id,
      };
    });

    const { error: updateError } = await supabase
      .from("quiz_cards")
      .upsert(updates);

    if (updateError) throw updateError;

    // Calculate and update total score for quiz deck
    if (quiz_deck_id) {
      const totalScore = quizCards.reduce(
        (sum, card) => sum + (card.item_score || 1),
        0
      );

      const { error: scoreError } = await supabase
        .from("quiz_decks")
        .update({ total_items: totalScore })
        .eq("id", quiz_deck_id);

      if (scoreError) throw scoreError;
    }

    // Store the CSV file
    const fileName = `quiz-${Date.now()}-${fileEntry.name}`;
    const { data: uploadedFile, error: fileError } = await supabase.storage
      .from("skilltuneapp-bucket")
      .upload(fileName, fileEntry, {
        cacheControl: "3600",
        upsert: false,
      });

    if (fileError) throw fileError;
    const fileData = uploadedFile;

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("skilltuneapp-bucket")
      .getPublicUrl(fileData.path);

    return {
      status: "success",
      quizCards: createdQuizCards.map((card, index) => ({
        ...card,
        choices: createdChoices.filter(
          (choice) => choice.quiz_card_id === card.id
        ),
      })),
      csvUrl: publicUrl,
      totalProcessed: createdQuizCards.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status: "error",
      error: `Error processing CSV: ${errorMessage}`,
    };
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
