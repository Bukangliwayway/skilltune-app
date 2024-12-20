"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MousePointer, PlusCircle } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { QuizzesResponse } from "./quizzes.types";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createOrUpdateQuizSchema,
  CreateOrUpdateQuizSchema,
} from "./quizzes.schema";
import { v4 as uuid } from "uuid";
import {
  createQuiz,
  deleteQuiz,
  fileUploadHandler,
  updateQuiz,
  updateQuizDeckIdForCards,
} from "@/actions/quizzes";
import { QuizForm } from "./QuizForm";
import { toast } from "sonner";
import { LessonsResponse } from "../lessons/lessons.types";

type Props = {
  quizzes: QuizzesResponse;
  lessons: LessonsResponse;
};

const QuizzesPageComponent: FC<Props> = ({ quizzes, lessons }) => {
  const [openQuizId, setOpenQuizId] = useState<number | null>(null);

  const [currentQuiz, setCurrentQuiz] =
    useState<CreateOrUpdateQuizSchema | null>(null);

  const form = useForm<CreateOrUpdateQuizSchema>({
    resolver: zodResolver(createOrUpdateQuizSchema),
    defaultValues: {
      title: "New Quiz",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium, consectetur!",
      lesson_id: undefined,
      csv: "",
      intent: "create",
    },
  });

  const router = useRouter();

  const deleteQuizHandler = async (id: number): Promise<void> => {
    try {
      if (!id) {
        throw new Error("Quiz ID is required");
      }

      await deleteQuiz(id);
      form.reset();
      router.refresh();
      setOpenQuizId(null);
      toast.success("Quiz deleted successfully");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("Failed to delete lesson");
    }
  };

  const submitQuizHandler = async (data: CreateOrUpdateQuizSchema) => {
    const { title, description, lesson_id, csv, intent = "create", id } = data;
    let csvUrl: string = "";
    if (csv && csv instanceof File) {
      try {
        const uniqueId = uuid();
        // Preserve original file extension
        const originalExt = csv.name.split(".").pop();
        const fileName = `article/article-${uniqueId}.${originalExt}`;

        // Create new file while preserving the original mime type
        const file = new File([csv], fileName, { type: csv.type });

        const formData = new FormData();
        formData.append("file", file);

        const uploadedUrl = await fileUploadHandler(
          formData,
          id ? parseInt(id) : -1
        );
        csvUrl = uploadedUrl?.csvUrl || "";
      } catch (error) {
        console.error("Error uploading PDF:", error);
        throw error;
      }
    }

    try {
      switch (intent) {
        case "create": {
          const quizDeck = await createQuiz({
            title: title,
            description: description,
            lesson_id: Number(lesson_id),
            csvUrl: csvUrl,
          });
          await updateQuizDeckIdForCards(quizDeck.id);
          form.reset();
          router.refresh();
          setOpenQuizId(null);
          toast.success("Quiz created successfully");
          break;
        }
        case "update": {
          if (id) {
            await updateQuiz({
              title: title,
              description: description,
              lesson_id: Number(lesson_id),
              csv_version: csvUrl,
              id,
            });
            form.reset();
            router.refresh();
            setOpenQuizId(null);
            toast.success("Quiz updated successfully");
          }
          break;
        }
      }
    } catch (error) {
      toast.error("Error submitting lesson");
      console.error("Error submitting lesson:", error);
    }
  };

  return (
    <>
      <div className="flex py-4 px-6 justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-base font-semibold">Select a quiz to modify</p>
          <MousePointer className="rotate-90" size={24} />
        </div>
        <Dialog
          open={openQuizId === -1} // Check for -1 instead of null
          onOpenChange={(open: boolean) => {
            setOpenQuizId(open ? -1 : null);
            console.log(openQuizId);
            if (!open) {
              setCurrentQuiz(null);
            }
          }}
          key={-1}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="font-semibold"
              onClick={() => {
                form.reset({
                  title: "New Quiz",
                  description:
                    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium, consectetur!",
                  lesson_id: undefined,
                  csv: undefined,
                  intent: "create",
                  id: undefined,
                });
                setOpenQuizId(-1);
                setCurrentQuiz(null);
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Quiz
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle>Create Quiz</DialogTitle>
            </DialogHeader>
            <QuizForm
              form={form}
              onSubmit={submitQuizHandler}
              defaultValues={currentQuiz}
              lessons={lessons}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz, index) => (
          <Dialog
            open={openQuizId === index}
            onOpenChange={(open: boolean) => {
              setOpenQuizId(open ? index : null);
              if (!open) {
                setCurrentQuiz(null);
              }
            }}
            key={quiz.id}
          >
            <DialogTrigger asChild key={quiz.id}>
              <div
                key={quiz.id}
                className="p-4 border rounded-lg hover:shadow-lg cursor-pointer"
                onClick={() => {
                  form.reset({
                    title: quiz.title,
                    description: quiz.description,
                    lesson_id: quiz.lesson_id,
                    intent: "update",
                    id: quiz.id.toString(),
                    csv: quiz.csv_version,
                  });
                  setCurrentQuiz(null);
                }}
              >
                <h2 className="text-lg font-semibold">{quiz.title}</h2>
                <p className="mt-2 text-sm">{quiz.description}</p>
              </div>
            </DialogTrigger>
            <DialogContent
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
            >
              <DialogHeader>
                <DialogTitle>Update Quiz</DialogTitle>
              </DialogHeader>
              <QuizForm
                form={form}
                onSubmit={submitQuizHandler}
                defaultValues={currentQuiz}
                onDelete={deleteQuizHandler}
                lessons={lessons}
                quiz={quiz}
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </>
  );
};

export default QuizzesPageComponent;
