// In page.tsx
import { QuizDetailView } from "./page-component";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: Props) {
  return <QuizDetailView params={params} />;
}

// Change the type for generateMetadata parameters
type GenerateMetadataProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
  searchParams,
}: GenerateMetadataProps): Promise<Metadata> {
  return {
    title: `Quiz ${params.id}`,
  };
}
