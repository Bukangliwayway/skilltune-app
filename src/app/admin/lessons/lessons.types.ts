import { UseFormReturn } from "react-hook-form";

export type Lesson = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  sequence: number;
  pdf_key: string;
  video_key: string;
};

export type UpdateLessonSchema = {
  title: string;
  description: string;
  sequence: number;
  id?: string;
};

export type LessonsResponse = Lesson[];

export type FileItem = {
  key: string;
  filename: string;
};

export type LessonFormData = {
  title: string;
  sequence: number;
  description: string;
  id: string;
};

export type LessonPageComponentProps = {
  initialData?: LessonFormData;
};

export type LessonFormProps = {
  form: UseFormReturn<LessonFormData>;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onVideoUpload: (key: string, name: string) => void;
  onPDFUpload: (key: string, name: string) => void;
  onVideoDelete: (key: string) => Promise<void>;
  onPDFDelete: (key: string) => Promise<void>;
  onFileDownload: (url: string, filename: string) => void;
  pdfFile: FileItem | null;
  videoFile: FileItem | null;
  isSubmitting: boolean;
};

export type FileSectionProps = {
  id: string;
  label: string;
  type: "PDF" | "Videos";
  file: FileItem | null;
  onUpload: (key: string, name: string) => void;
  onDelete: (key: string) => Promise<void>;
  onDownload: (url: string, filename: string) => void;
};
