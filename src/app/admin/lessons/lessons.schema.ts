import { z } from "zod";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ACCEPTED_PDF_TYPES = ["application/pdf"];

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters long" }),
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
});

export type CreateLessonSchema = z.infer<typeof createLessonSchema>;
