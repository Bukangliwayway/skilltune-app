import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
}

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
    </div>
  );
}
