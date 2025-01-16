import { z } from "zod";

export const CreateLessonSchemaServer = z.object({
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
});

export const UpdateLessonFormSchema = z.object({
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
  id: z.string(),
});

export type UpdateLessonFormSchema = z.infer<typeof UpdateLessonFormSchema>;

export type CreateLessonSchemaServer = z.infer<typeof CreateLessonSchemaServer>;
