export type Lesson = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  sequence: number;
  pdf_url: string;
  video_url: string;
};

export type UpdateLessonSchema = {
  title: string;
  description: string;
  sequence: number;
  pdf_url: string;
  video_url: string;
  id?: string;
};

export type LessonsResponse = Lesson[];
