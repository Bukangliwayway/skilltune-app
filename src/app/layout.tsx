import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "SkillTuneApp",
  description: "An AdminDashboard to manage the assets of the SkillTuneApp",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div suppressHydrationWarning>{children}</div>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
