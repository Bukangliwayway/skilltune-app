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

export type QuizzesResponse = Quiz[];
