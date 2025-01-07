import { getLessonById } from "@/actions/lessons";
import UpdateLessonPageComponent from "./page-component";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  const lessonData = await getLessonById(id);

  return <UpdateLessonPageComponent initialData={lessonData} />;
}
