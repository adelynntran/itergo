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
      <div className="paper-canvas flex min-h-screen items-center justify-center">
        <div className="font-handwriting text-2xl text-ink-light animate-pulse">
          loading your journal...
        </div>
      </div>
    );
  }

  return (
    <div className="paper-canvas flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
