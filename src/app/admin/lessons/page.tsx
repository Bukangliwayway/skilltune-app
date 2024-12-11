import { getAllLessons } from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import { Check, MousePointer, PlusSquareIcon } from "lucide-react";
import React from "react";

export default async function Lessons() {
  const lessons = await getAllLessons();
  console.log(lessons);
  
  return <LessonsPageComponent {lessons}/>
  return (
    <>
      <div className="flex py-4 px-6 justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-base font-semibold">Select a lesson to modify</p>
          <MousePointer className="rotate-90" size={24} />
        </div>
        <Button variant="outline" className="font-semibold">
          <PlusSquareIcon size={24} />
          <p>Lesson</p>
        </Button>
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
}

