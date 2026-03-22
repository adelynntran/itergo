"use client";

import { Plus } from "lucide-react";

interface GhostBookProps {
  onClick: () => void;
}

export function GhostBook({ onClick }: GhostBookProps) {
  return (
    <div
      className="book-ghost"
      style={{ width: "48px", height: "190px" }}
      onClick={onClick}
      title="Complete a trip to add it to your shelf"
    >
      <Plus
        className="h-4 w-4 rotate-0"
        style={{
          writingMode: "horizontal-tb",
          color: "oklch(0.5 0.03 55)",
        }}
      />
    </div>
  );
}
