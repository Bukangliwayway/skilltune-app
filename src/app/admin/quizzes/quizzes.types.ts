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
