"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MousePointer, PlusCircle, PlusSquareIcon } from "lucide-react";
import { FC, useCallback, useState } from "react";
import { LessonsResponse } from "./lessons.types";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createLessonSchema, CreateLessonSchema } from "./lessons.schema";
import { v4 as uuid } from "uuid";
import { fileUploadHandler } from "@/actions/lessons";
import { LessonForm } from "./LessonForm";

type Props = {
  lessons: LessonsResponse;
};

const LessonsPageComponent: FC<Props> = ({ lessons }) => {
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<CreateLessonSchema | null>(
    null
  );

  const form = useForm<CreateLessonSchema>({
    resolver: zodResolver(createLessonSchema),
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

  const submitLessonHandler: SubmitHandler<CreateLessonSchema> = async (
    data
  ) => {
    try {
      const { pdf, video } = data;
      let pdfUrl, videoUrl;

      if (pdf) {
        try {
          const uniqueId = uuid();
          // Preserve original file extension
          const originalExt = pdf[0].name.split(".").pop();
          const fileName = `article/article-${uniqueId}.${originalExt}`;

          // Create new file while preserving the original mime type
          const file = new File([pdf[0]], fileName, { type: pdf[0].type });

          const formData = new FormData();
          formData.append("file", file);

          pdfUrl = await fileUploadHandler(formData, "pdf");
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

          videoUrl = await fileUploadHandler(formData, "video");
        } catch (error) {
          console.error("Error uploading video:", error);
          throw error;
        }
      }

      router.refresh();
    } catch (error) {
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
          open={isCreateLessonModalOpen}
          onOpenChange={() =>
            setIsCreateLessonModalOpen(!isCreateLessonModalOpen)
          }
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="font-semibold"
              onClick={() => {
                setCurrentLesson(null);
                setIsCreateLessonModalOpen(true);
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Lesson
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
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
        {lessons.map((lesson) => (
          <div key={lesson.id} className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold">{lesson.title}</h2>
            <p className="mt-2 text-sm">{lesson.description}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default LessonsPageComponent;
