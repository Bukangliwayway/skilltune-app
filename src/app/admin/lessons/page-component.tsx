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
import { MousePointer, PlusCircle, PlusSquareIcon } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { LessonsResponse } from "./lessons.types";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createOrUpdateLessonSchema,
  CreateOrUpdateLessonSchema,
} from "./lessons.schema";
import { v4 as uuid } from "uuid";
import {
  createLesson,
  deleteLesson,
  fileUploadHandler,
  updateLesson,
} from "@/actions/lessons";
import { LessonForm } from "./LessonForm";
import { toast } from "sonner";

type Props = {
  lessons: LessonsResponse;
};

const LessonsPageComponent: FC<Props> = ({ lessons }) => {
  const [openLessonId, setOpenLessonId] = useState<number | null>(null);

  const [currentLesson, setCurrentLesson] =
    useState<CreateOrUpdateLessonSchema | null>(null);

  const form = useForm<CreateOrUpdateLessonSchema>({
    resolver: zodResolver(createOrUpdateLessonSchema),
    defaultValues: {
      title: "New Lesson",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium, consectetur!",
      sequence: 1,
      pdf: undefined,
      video: undefined,
    },
  });

  const router = useRouter();

  const deleteLessonHandler = async (id: number): Promise<void> => {
    try {
      if (!id) {
        throw new Error("Lesson ID is required");
      }

      await deleteLesson(id);
      router.refresh();
      toast.success("Lesson deleted successfully");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("Failed to delete lesson");
    }
  };

  const submitLessonHandler = async (data: CreateOrUpdateLessonSchema) => {
    const {
      title,
      description,
      sequence,
      pdf,
      video,
      intent = "create",
      id,
    } = data;
    let pdfUrl: string = "",
      videoUrl: string = "";

    if (pdf) {
      try {
        const uniqueId = uuid();
        // Preserve original file extension
        const originalExt = pdf.name.split(".").pop();
        const fileName = `article/article-${uniqueId}.${originalExt}`;

        // Create new file while preserving the original mime type
        const file = new File([pdf], fileName, { type: pdf.type });

        const formData = new FormData();
        formData.append("file", file);

        const uploadedUrl = await fileUploadHandler(formData, "pdf");
        pdfUrl = uploadedUrl || "";
      } catch (error) {
        console.error("Error uploading PDF:", error);
        throw error;
      }
    }

    if (video) {
      try {
        const uniqueId = uuid();
        // Preserve original file extension
        const originalExt = video.name.split(".").pop();
        const fileName = `video/video-${uniqueId}.${originalExt}`;

        // Create new file while preserving the original mime type
        const file = new File([video], fileName, { type: video.type });

        const formData = new FormData();
        formData.append("file", file);

        const uploadedUrl = await fileUploadHandler(formData, "video");
        videoUrl = uploadedUrl || "";
      } catch (error) {
        toast.error("Error uploading name");
        console.error("Error uploading video:", error);
        throw error;
      }
    }

    try {
      switch (intent) {
        case "create": {
          await createLesson({
            title: title,
            description: description,
            sequence: Number(sequence),
            pdfUrl: pdfUrl,
            videoUrl: videoUrl,
          });
          form.reset();
          router.refresh();
          setOpenLessonId(null);
          toast.success("Lesson created successfully");
          break;
        }
        case "update": {
          if (id) {
            await updateLesson({
              title: title,
              description: description,
              sequence: Number(sequence),
              pdf_url: pdfUrl,
              video_url: videoUrl,
              id,
            });
            form.reset();
            router.refresh();
            setOpenLessonId(null);
            toast.success("Lesson updated successfully");
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
          <p className="text-base font-semibold">Select a lesson to modify</p>
          <MousePointer className="rotate-90" size={24} />
        </div>
        <Dialog
          open={openLessonId === -1}
          onOpenChange={(open: boolean) => {
            setOpenLessonId(open ? -1 : null);
            if (!open) {
              setCurrentLesson(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="font-semibold"
              onClick={() => {
                setCurrentLesson(null);
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Lesson
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle>Create Lesson</DialogTitle>
            </DialogHeader>
            <LessonForm
              form={form}
              onSubmit={submitLessonHandler}
              defaultValues={currentLesson}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons
          .sort((a, b) => a.sequence - b.sequence) // Sort by sequence
          .map((lesson, index) => (
            <Dialog
              open={openLessonId === index}
              onOpenChange={(open: boolean) => {
                setOpenLessonId(open ? index : null);
                if (!open) {
                  setCurrentLesson(null);
                }
              }}
              key={lesson.id}
            >
              <DialogTrigger asChild key={lesson.id}>
                <div
                  key={lesson.id}
                  className="p-4 border rounded-lg hover:shadow-lg cursor-pointer"
                  onClick={() => {
                    form.reset({
                      title: lesson.title,
                      description: lesson.description,
                      sequence: lesson.sequence,
                      intent: "update",
                      id: lesson.id.toString(),
                      pdf: undefined,
                      video: undefined,
                    });
                    setCurrentLesson(null);
                  }}
                >
                  <h2 className="text-lg font-semibold">{lesson.title}</h2>
                  <p className="mt-2 text-sm">{lesson.description}</p>
                </div>
              </DialogTrigger>
              <DialogContent
                onInteractOutside={(e) => {
                  e.preventDefault();
                }}
              >
                <DialogHeader>
                  <DialogTitle>Create Lesson</DialogTitle>
                </DialogHeader>
                <LessonForm
                  form={form}
                  onSubmit={submitLessonHandler}
                  defaultValues={currentLesson}
                  onDelete={deleteLessonHandler}
                />
              </DialogContent>
            </Dialog>
          ))}
      </div>
    </>
  );
};

export default LessonsPageComponent;
