import { title } from "process";
import { z } from "zod";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ACCEPTED_PDF_TYPES = ["application/pdf"];

export const createOrUpdateLessonSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" }),
  sequence: z
    .number()
    .int()
    .min(1, { message: "Sequence must be a positive number" }),
  pdf: z
    .any()
    .refine((files) => files?.size || 0 <= MAX_FILE_SIZE, {
      message: "Max file size is 500MB",
    })
    .refine(
      (files) => ACCEPTED_PDF_TYPES.includes(files?.type),
      "Only .pdf files are accepted"
    )
    .optional(),
  video: z
    .any()
    .refine((files) => files?.size || 0 <= MAX_FILE_SIZE, {
      message: "Max file size is 500MB",
    })
    .refine(
      (files) => ACCEPTED_VIDEO_TYPES.includes(files?.type),
      "Only .mp4 and .webm files are accepted"
    )
    .optional(),
  intent: z
    .enum(["create", "update"], {
      message: "Intent must be either create or update",
    })
    .optional(),
  id: z.string().optional(),
});

export type CreateOrUpdateLessonSchema = z.infer<
  typeof createOrUpdateLessonSchema
>;

export const createLessonSchemaServer = z.object({
  title: z.string().min(5, {
    message: "Lesson Title is required and must be at least 5 Characters long",
  }),
  description: z.string().min(10, {
    message:
      "Lesson Description is required and must be at least 10 Characters long",
  }),
  sequence: z
    .number()
    .int()
    .min(1, { message: "Sequence must be a positive number" }),
  pdfUrl: z.string().min(1, { message: "Lesson PDF is required" }),
  videoUrl: z.string().min(1, { message: "Lesson Video is required" }),
});

export type CreateLessonSchemaServer = z.infer<typeof createLessonSchemaServer>;
