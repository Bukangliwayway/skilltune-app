import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateOrUpdateQuizSchema } from "./quizzes.schema";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LessonsResponse } from "../lessons/lessons.types";
import { Quiz } from "./quizzes.types";
import { toast } from "sonner";

type QuizFormProps = {
  form: UseFormReturn<CreateOrUpdateQuizSchema>;
  onSubmit: (data: CreateOrUpdateQuizSchema) => void;
  defaultValues: CreateOrUpdateQuizSchema | null;
  onDelete?: (id: number) => Promise<void>;
  lessons: LessonsResponse;
  quiz?: Quiz;
};

export const QuizForm = ({
  form,
  onSubmit,
  defaultValues,
  onDelete,
  lessons,
  quiz,
}: QuizFormProps) => {
  const isSubmitting = form.formState.isSubmitting;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleDelete = async () => {
    const id = parseInt(form.getValues("id") || "0");
    if (onDelete && !isNaN(id)) {
      try {
        await onDelete(id);
        setIsDeleteModalOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error deleting lesson"
        );
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-[2]">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lesson_id"
            render={({ field }) => (
              <FormItem className="flex-[2]">
                <FormLabel>Lesson</FormLabel>
                <select
                  className="w-full px-3 py-1.5 border rounded-md"
                  disabled={isSubmitting}
                  {...form.register("lesson_id", {
                    valueAsNumber: true,
                  })}
                >
                  <option value="">Select Lesson</option>
                  {lessons?.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[100px] resize-none rounded-md border border-input bg-background px-3 py-2"
                  disabled={isSubmitting}
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          {quiz?.csv_version ? (
            <FormItem className="flex flex-col flex-[1]">
              <FormLabel>Download Quiz Deck</FormLabel>
              <FormControl className="flex items-center justify-center h-full">
                <Button
                  className="w-full h-10 bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    window.open(quiz.csv_version, "_blank");
                  }}
                  type="button"
                >
                  Download CSV
                </Button>
              </FormControl>
            </FormItem>
          ) : (
            <FormItem className="flex flex-col flex-[1]">
              <FormLabel>Download Quiz Deck</FormLabel>
              <FormControl className="flex items-center justify-center h-full">
                <Button
                  className="w-full h-10 bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/skilltuneapp-bucket/skilltuneapp%20default%20assets/quiz_template.csv`,
                      "_blank"
                    );
                  }}
                  type="button"
                >
                  Download Template
                </Button>
              </FormControl>
            </FormItem>
          )}
          <FormField
            control={form.control}
            name="csv"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem className="flex-[2]">
                <FormLabel className="block mb-2">Update CSV</FormLabel>
                <FormControl className="h-full">
                  <Input
                    type="file"
                    accept=".csv, .xlsx, .xls, .ods, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.oasis.opendocument.spreadsheet, text/csv"
                    disabled={isSubmitting}
                    onChange={(e) => onChange(e.target.files?.[0])}
                    {...field}
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
          <Button
            disabled={isSubmitting}
            type="submit"
            className={
              form.getValues("intent") === "update" ? "w-1/2" : "w-full"
            }
          >
            {form.getValues("intent") === "update" ? "Update" : "Submit"}
          </Button>

          {form.getValues("intent") === "update" && (
            <>
              <Button
                type="button"
                variant="destructive"
                className="w-1/2"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>

              <Dialog
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Quiz</DialogTitle>
                  </DialogHeader>
                  <p>
                    Are you sure you want to delete {form.getValues("title")}?
                  </p>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      type="button"
                    >
                      {isSubmitting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};
