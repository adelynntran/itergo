"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="paper-texture flex min-h-screen bg-background">
      <AppSidebar />
      <main className="relative flex-1 overflow-auto">{children}</main>
    </div>
  );
}
