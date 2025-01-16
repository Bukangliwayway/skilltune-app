import { QuizDetailView } from "./page-component";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <QuizDetailView params={{ id }} />;
}
