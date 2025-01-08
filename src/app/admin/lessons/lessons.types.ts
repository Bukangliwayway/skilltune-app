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
  download_url: string;
};

export type LessonFormData = {
  title: string;
  sequence: number;
  description: string;
  id: string;
  pdf_key: string;
  video_key: string;
  pdf_filename: string;
  video_filename: string;
  pdf_download_url: string;
  video_download_url: string;
};

export type LessonPageComponentProps = {
  initialData?: LessonFormData;
};

export type LessonFormProps = {
  form: UseFormReturn<LessonFormData>;
  onSubmit: (data: LessonFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onVideoUpload: (key: string, name: string, download_url: string) => void;
  onPDFUpload: (key: string, name: string, download_url: string) => void;
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
  type: "PDF" | "video";
  file: FileItem | null;
  onUpload: (key: string, name: string, download_url: string) => void;
  onDelete: (key: string) => Promise<void>;
  onDownload: (url: string, filename: string) => void;
  isSubmitting: boolean;
};
