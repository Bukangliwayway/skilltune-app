"use server";

import { CreateQuizSchemaServer } from "@/app/admin/quizzes/quizzes.schema";
import {
  FileUploadResponse,
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

function preprocessCSVRow(row: string[]): string[] {
  // Find indices where we need to merge split explanation
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

  // If we found split parts, merge them
  if (startIndex !== -1 && endIndex !== -1) {
    const mergedExplanation = row.slice(startIndex, endIndex + 1).join(", ");
    const cleanedExplanation = mergedExplanation.replace(/^"|"$/g, "");

    // Create new row with merged explanation
    const newRow = [
      ...row.slice(0, startIndex),
      cleanedExplanation,
      ...row.slice(endIndex + 1),
    ];
    return newRow;
  }

  return row;
}

const validateQuizRow = (row: string[], headers?: string[]): QuizCsvRow => {
  // Validate headers if provided
  if (headers) {
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
    const missingHeaders = EXPECTED_HEADERS.filter(
      (expected) => !normalizedHeaders.includes(expected)
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }
  }

  // Check row length
  if (row.length !== 9) {
    console.log("Actual columns:", row.length);
    console.log("Row content:", row);
    throw new Error("Invalid CSV format: Must have exactly 9 columns");
  }

  // Validate question
  if (!row[0]?.trim()) {
    throw new Error("Question cannot be empty");
  }

  // Validate choices
  for (let i = 1; i <= 4; i++) {
    if (!row[i]?.trim()) {
      throw new Error(`Choice ${String.fromCharCode(64 + i)} cannot be empty`);
    }
  }

  // Validate correct answer
  const correctAnswer = row[5]?.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(correctAnswer)) {
    throw new Error("Correct answer must be A, B, C, or D");
  }

  // // Validate explanation
  // if (!row[6]?.trim()) {
  //   throw new Error("Explanation cannot be empty");
  // }

  // Validate item score
  const itemScore = parseFloat(row[7]);
  if (itemScore <= 0) {
    throw new Error("Item score must be a positive number");
  }

  // Validate sequence
  const sequence = parseInt(row[8]);
  if (sequence < 0) {
    throw new Error("Sequence must be a positive integer");
  }

  return {
    question: row[0].trim(),
    choiceA: row[1].trim(),
    choiceB: row[2].trim(),
    choiceC: row[3].trim(),
    choiceD: row[4].trim(),
    correctAnswer,
    explanation: row[6]?.trim() || "",
    itemScore: parseFloat(row[7]) > 0 ? parseFloat(row[7]) : 1,
    sequence:
      !isNaN(parseInt(row[8])) && parseInt(row[8]) > 0 ? parseInt(row[8]) : 1,
  };
};

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

export const fileUploadHandler = async (
  formData: FormData,
  quiz_deck_id: number | null
): Promise<FileUploadResponse> => {
  const supabase = await createClient();
  if (!formData) return { status: "error", error: "No file provided" };
  if (!(formData instanceof FormData)) {
    return {
      status: "error",
      error: "Expected a FormData object",
    };
  }
  const ACCEPTED_CSV_TYPES = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
  ];
  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return {
      status: "error",
      error: "Expected a file",
    };
  }

  if (!ACCEPTED_CSV_TYPES.includes(fileEntry.type)) {
    return {
      status: "error",
      error: "Invalid file format. Only CSV is accepted",
    };
  }

  if (quiz_deck_id !== null) {
    // First get all quiz_cards for this deck
    const { data: quizCards, error: fetchError } = await supabase
      .from("quiz_cards")
      .select("id")
      .eq("quiz_deck_id", quiz_deck_id);

    if (fetchError) throw fetchError;

    if (quizCards && quizCards.length > 0) {
      const cardIds = quizCards.map((card) => card.id);

      // Delete associated choices first
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

  try {
    const text = await fileEntry.text();
    // Split by newline and filter empty rows
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

    const headers = rows[0].map((header) => header.toLowerCase());
    const questions = rows.slice(1);
    const createdQuizCards = [];

    // Validate headers first
    for (const question of questions) {
      try {
        const processedRow = preprocessCSVRow(question);
        const validatedData = validateQuizRow(processedRow, headers);
        const { data: quizCard, error: quizError } = await supabase
          .from("quiz_cards")
          .insert({
            question: validatedData.question,
            explanation: validatedData.explanation,
            item_score: validatedData.itemScore,
            quiz_deck_id: quiz_deck_id || null,
            sequence: validatedData.sequence,
          })
          .select()
          .single();

        if (quizError) throw quizError;

        // Create choices array
        const choices = [
          {
            choice: validatedData.choiceA,
            is_correct: validatedData.correctAnswer === "A",
          },
          {
            choice: validatedData.choiceB,
            is_correct: validatedData.correctAnswer === "B",
          },
          {
            choice: validatedData.choiceC,
            is_correct: validatedData.correctAnswer === "C",
          },
          {
            choice: validatedData.choiceD,
            is_correct: validatedData.correctAnswer === "D",
          },
        ];

        const { data: choicesData, error: choicesError } = await supabase
          .from("choices")
          .insert(
            choices.map((choice) => ({
              quiz_card_id: quizCard.id,
              choice: choice.choice,
              is_correct: choice.is_correct,
            }))
          )
          .select();

        if (choicesError) throw choicesError;

        // Find the correct choice ID
        const correctChoice = choicesData.find((choice) => choice.is_correct);
        if (!correctChoice) {
          return {
            status: "error",
            error: "No correct choice found",
          };
        }

        // Update quiz card with correct_choice_id
        const { error: updateError } = await supabase
          .from("quiz_cards")
          .update({ correct_choice_id: correctChoice.id })
          .eq("id", quizCard.id);

        if (updateError) throw updateError;

        createdQuizCards.push({
          ...quizCard,
          choices: choicesData,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          status: "error",
          error: `Error processing row: ${errorMessage}`,
        };
      }
    }

    // Store the CSV file
    const fileName = `quiz-${Date.now()}-${fileEntry.name}`;
    const { data: fileData, error: fileError } = await supabase.storage
      .from("skilltuneapp-bucket")
      .upload(fileName, fileEntry, {
        cacheControl: "3600",
        upsert: false,
      });

    if (fileError) throw fileError;

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("skilltuneapp-bucket")
      .getPublicUrl(fileData.path);

    return {
      status: "success",
      quizCards: createdQuizCards,
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
