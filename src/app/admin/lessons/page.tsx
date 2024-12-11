import { getAllLessons } from "@/actions/lessons";
import React from "react";

export default async function Lessons() {
  const lessons = await getAllLessons();
  console.log(lessons);
  
  return (
    <>
      <div className="p-4">
        <p>Welcome to the lessons page</p>
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

