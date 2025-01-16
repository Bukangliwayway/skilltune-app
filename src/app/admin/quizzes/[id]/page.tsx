import { QuizDetailView } from "./page-component";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: Props) {
  return <QuizDetailView params={params} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Quiz ${params.id}`,
  };
}
