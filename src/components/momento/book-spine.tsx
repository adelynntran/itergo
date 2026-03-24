"use client";

import { useRouter } from "next/navigation";

// Warm book color palette
const SPINE_COLORS = [
  "oklch(0.55 0.12 25)",   // warm rust
  "oklch(0.45 0.08 150)",  // sage green
  "oklch(0.40 0.10 260)",  // dusty blue
  "oklch(0.50 0.14 330)",  // plum
  "oklch(0.55 0.10 55)",   // amber
  "oklch(0.42 0.06 30)",   // chocolate
  "oklch(0.50 0.09 180)",  // teal
  "oklch(0.48 0.12 15)",   // terracotta
];

const TEXT_COLORS: Record<string, string> = {
  "oklch(0.55 0.12 25)": "oklch(0.95 0.02 25)",
  "oklch(0.45 0.08 150)": "oklch(0.95 0.01 150)",
  "oklch(0.40 0.10 260)": "oklch(0.92 0.02 260)",
  "oklch(0.50 0.14 330)": "oklch(0.95 0.02 330)",
  "oklch(0.55 0.10 55)": "oklch(0.18 0.03 55)",
  "oklch(0.42 0.06 30)": "oklch(0.92 0.02 30)",
  "oklch(0.50 0.09 180)": "oklch(0.95 0.01 180)",
  "oklch(0.48 0.12 15)": "oklch(0.95 0.02 15)",
};

function getSpineColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return SPINE_COLORS[Math.abs(hash) % SPINE_COLORS.length];
}

function getSpineWidth(pinCount: number): number {
  if (pinCount <= 3) return 52;
  if (pinCount <= 6) return 60;
  if (pinCount <= 10) return 68;
  return 78;
}

interface BookSpineProps {
  board: {
    id: string;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    momentoStartedAt?: string | null;
    createdAt?: string | null;
    pins: Array<{ media?: Array<{ url: string; thumbnail?: string | null }> }>;
  };
}

export function BookSpine({ board }: BookSpineProps) {
  const router = useRouter();
  const color = getSpineColor(board.id);
  const textColor = TEXT_COLORS[color] ?? "oklch(0.95 0.02 30)";
  const width = getSpineWidth(board.pins.length);

  const date = board.momentoStartedAt ?? board.createdAt;
  const dateLabel = date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  // Find the first pin media to use as cover peek
  const coverUrl =
    board.coverImage ??
    board.pins.find((p) => p.media && p.media.length > 0)?.media?.[0]
      ?.thumbnail ??
    board.pins.find((p) => p.media && p.media.length > 0)?.media?.[0]?.url ??
    null;

  return (
    <div
      className="book-spine"
      style={{
        backgroundColor: color,
        color: textColor,
        width: `${width}px`,
        height: "220px",
      }}
      onClick={() => router.push(`/board/${board.id}`)}
      title={board.name}
    >
      {coverUrl && (
        <img
          src={coverUrl}
          alt={board.name}
          className="book-cover-peek"
          loading="lazy"
        />
      )}
      <span className="book-spine-title">{board.name}</span>
      {dateLabel && <span className="book-spine-meta">{dateLabel}</span>}
    </div>
  );
}
