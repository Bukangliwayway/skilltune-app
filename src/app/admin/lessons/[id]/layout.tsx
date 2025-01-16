import { Suspense } from "react";
import { LoadingOverlay } from "@/components/loadingOverlay";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingOverlay isLoading={true} />}>
      {children}
    </Suspense>
  );
}
