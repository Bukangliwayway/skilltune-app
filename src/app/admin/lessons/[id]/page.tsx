import { getLessonById } from "@/actions/lessons";
import UpdateLessonPageComponent from "./page-component";

export default async function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  const lessonData = await getLessonById(params.id);
  console.log(lessonData);

  return <UpdateLessonPageComponent initialData={lessonData} />;
}
