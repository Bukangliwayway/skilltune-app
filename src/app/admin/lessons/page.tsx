import { getAllLessons } from "@/actions/lessons";
import React from "react";
import LessonsPageComponent from "./page-component";

export default async function Lessons() {
  const lessons = await getAllLessons();

  return <LessonsPageComponent lessons={lessons} />;
}
