import { QuizDetailView } from "./page-component";

export default function Page({ params }: { params: { id: string } }) {
  return <QuizDetailView params={params} />;
}
