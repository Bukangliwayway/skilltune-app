import { LoadingOverlay } from "@/components/loadingOverlay";
import { Header } from "@/components/ui/header";
import { RenderMounted } from "@/components/ui/render-mounted";
import { createClient } from "@/supabase/server";
import { ReactNode, Suspense } from "react";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();

  if (authData?.user) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (error || !data) {
      console.log("Error fetching user data", error);
      return;
    }

    // if (data.type === ADMIN) return redirect("/");
  }
  return (
    <RenderMounted>
      <Header />
      <main className="min-h-[calc(100svh-128px)] py-3">
        <Suspense fallback={<LoadingOverlay isLoading={true} />}>
          {children}
        </Suspense>
      </main>
    </RenderMounted>
  );
}
