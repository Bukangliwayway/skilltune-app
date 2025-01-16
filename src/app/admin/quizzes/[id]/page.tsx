import { QuizDetailView } from "./page-component";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  return <QuizDetailView params={params} />;
}
