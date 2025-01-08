"use client";
import { Button } from "@/components/ui/button";
import { MousePointer, PlusCircle } from "lucide-react";
import { FC, useState } from "react";
import { Lesson, LessonsResponse } from "./lessons.types";
import { redirect, useRouter } from "next/navigation";
import { createNewLesson } from "@/actions/lessons";

type Props = {
  lessons: LessonsResponse;
};

const LessonsPageComponent: FC<Props> = ({ lessons }) => {
  const [isCreating, setisCreating] = useState(false);
  return (
    <>
      <div className="flex py-4 px-6 justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-base font-semibold">Select a lesson to modify</p>
          <MousePointer className="rotate-90" size={24} />
        </div>
        <Button
          size="sm"
          disabled={isCreating}
          variant="outline"
          onClick={async (e) => {
            e.preventDefault();
            setisCreating(true);
            await createNewLesson();
            setisCreating(false);
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            New Lesson
          </span>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {lessons
          .sort((a, b) => a.sequence - b.sequence)
          .map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 border rounded-lg hover:shadow-lg cursor-pointer"
              onClick={() => {
                redirect(`/admin/lessons/${lesson.id}`);
              }}
            >
              <h2 className="text-lg font-semibold">{lesson.title}</h2>
              <p className="mt-2 text-sm">{lesson.description}</p>
            </div>
          ))}
      </div>
    </>
  );
};

export default LessonsPageComponent;
