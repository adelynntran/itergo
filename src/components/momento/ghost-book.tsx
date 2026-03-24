"use client";

import { Plus } from "lucide-react";

interface GhostBookProps {
  onClick: () => void;
}

export function GhostBook({ onClick }: GhostBookProps) {
  return (
    <div
      className="book-ghost"
      style={{ width: "56px", height: "220px" }}
      onClick={onClick}
      title="Complete a trip to add it to your shelf"
    >
      <Plus
        className="h-5 w-5 rotate-0"
        style={{
          writingMode: "horizontal-tb",
          color: "oklch(0.5 0.03 55)",
        }}
      />
    </div>
  );
}
