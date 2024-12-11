import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MousePointer, PlusCircle, PlusSquareIcon } from "lucide-react";
import { FC, useState } from "react";
import { LessonsResponse } from "./lessons.types";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createLessonSchema, CreateLessonSchema } from "./lessons.schema";
import { v4 as uuid } from "uuid";
import { pdfUploadHandler } from "@/actions/lessons";

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
    const {
      title,
      description,
      sequence,
      pdf,
      video,
      intent = "create",
    } = data;

    const handlePdfUpload = async () => {
      const uniqueId = uuid();
      const fileName = `category/category-${uniqueId}`;
      const file = new File([data.pdf[0]], fileName);
      const formData = new FormData();
      formData.append("file", file);

      return pdfUploadHandler(formData);
    };
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
            <Button>
              <PlusSquareIcon size={24} />
              <p>Lesson</p>
            </Button>
            <Button
              size="sm"
              //   className="h-8 gap-1"
              variant="outline"
              className="font-semibold"
              onClick={() => {
                setCurrentLesson(null);
                setIsCreateLessonModalOpen(true);
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Lesson
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
