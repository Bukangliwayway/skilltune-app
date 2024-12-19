import { getAllLessons } from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import React from "react";
import QuizzesPageComponent from "./page-component";
import { getAllQuizzes } from "@/actions/quizzes";

export default async function Lessons() {
  const lessons = await getAllLessons();
  const quizzes = await getAllQuizzes();

  return <QuizzesPageComponent quizzes={quizzes} lessons={lessons} />;
}
