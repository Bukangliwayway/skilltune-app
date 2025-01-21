export type Quiz = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  lesson_id: number;
  csv_version: string;
};

export type UpdateQuizSchema = {
  id?: string;
  title: string;
  description: string;
  lesson_id: number;
  csv_version: string;
};

export interface QuizDeckDB {
  id: number;
  created_at: string;
  title: string | null;
  description: string | null;
  lesson_id: number | null;
  csv_version: string | null;
}

export type QuizDeckResponse = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  lesson_id: number;
  csv_version?: string;
};

export type QuizzesResponse = Quiz[];

export type QuizCsvRow = {
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctAnswer: string;
  explanation: string;
  itemScore: number;
  sequence: number;
};

export type Choice = {
  choice: string | null;
  created_at: string;
  id: number;
  is_correct: boolean | null;
  quiz_card_id: number | null;
};

export type QuizCard = {
  correct_choice_id: number | null;
  created_at: string;
  explanation: string | null;
  id: number;
  item_score: number | null;
  question: string | null;
  quiz_deck_id: number | null;
  sequence: number | null;
  choices: Choice[];
};

export type QuizDisplay = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  lesson_id: number;
  csv_version: string;
  quiz_cards: QuizCard[];
};

export type FileUploadSuccess = {
  status: "success";
  quizCards: Array<QuizCard>;
  csvUrl: string;
  totalProcessed: number;
};

export type FileUploadError = {
  status: "error";
  error: string;
};

export type FileUploadResponse = FileUploadSuccess | FileUploadError;
