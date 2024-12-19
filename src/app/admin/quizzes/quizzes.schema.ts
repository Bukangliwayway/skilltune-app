import { title } from "process";
import { z } from "zod";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_CSV_TYPES = [
  // File extensions
  ".csv",
  ".xlsx",
  ".xls",
  ".ods",
  // MIME types
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
];

export const createOrUpdateQuizSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" }),
  lesson_id: z.number().int().min(1, { message: "Quiz ID must be a number" }),
  csv: z
    .any()
    .refine((files) => files?.size || 0 <= MAX_FILE_SIZE, {
      message: "Max file size is 500MB",
    })
    .refine(
      (files) =>
        !files ||
        !(files instanceof File) ||
        ACCEPTED_CSV_TYPES.includes(files?.type),
      "Only .csv files are accepted"
    )
    .optional(),
  intent: z
    .enum(["create", "update"], {
      message: "Intent must be either create or update",
    })
    .optional(),
  id: z.string().optional(),
});

export type CreateOrUpdateQuizSchema = z.infer<typeof createOrUpdateQuizSchema>;

export const createQuizSchemaServer = z.object({
  title: z.string().min(5, {
    message: "Quiz Title is required and must be at least 5 Characters long",
  }),
  description: z.string().min(10, {
    message:
      "Quiz Description is required and must be at least 10 Characters long",
  }),
  lesson_id: z.number().int().min(1, { message: "Quiz ID must be a number" }),
  csvUrl: z.string().min(1, { message: "CSV is required" }),
});

export type CreateQuizSchemaServer = z.infer<typeof createQuizSchemaServer>;
