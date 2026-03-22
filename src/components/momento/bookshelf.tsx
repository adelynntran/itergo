"use client";

import { useMemo } from "react";
import { BookshelfRow } from "./bookshelf-row";
import { BookshelfMobile } from "./bookshelf-mobile";
import { BookOpen } from "lucide-react";

const BOOKS_PER_SHELF = 8;

interface Board {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  momentoStartedAt?: string | null;
  createdAt?: string | null;
  pins: Array<{
    city?: string | null;
    media?: Array<{ url: string; thumbnail?: string | null }>;
  }>;
}

interface MomentoBookshelfProps {
  boards: Board[];
  onGhostClick: () => void;
}

export function MomentoBookshelf({
  boards,
  onGhostClick,
}: MomentoBookshelfProps) {
  // Split boards into shelf rows
  const shelves = useMemo(() => {
    const rows: Board[][] = [];
    for (let i = 0; i < boards.length; i += BOOKS_PER_SHELF) {
      rows.push(boards.slice(i, i + BOOKS_PER_SHELF));
    }
    // Always have at least one row (for the ghost book)
    if (rows.length === 0) rows.push([]);
    return rows;
  }, [boards]);

  return (
    <div className="bookshelf-container rounded-xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3 px-6">
        <BookOpen
          className="h-6 w-6"
          style={{ color: "oklch(0.45 0.06 55)" }}
        />
        <div>
          <h2
            className="font-display text-xl font-semibold"
            style={{ color: "oklch(0.3 0.04 50)" }}
          >
            Your Travel Books
          </h2>
          <p className="text-sm" style={{ color: "oklch(0.5 0.03 50)" }}>
            {boards.length === 0
              ? "Complete a trip to start your collection"
              : `${boards.length} ${boards.length === 1 ? "book" : "books"} on your shelf`}
          </p>
        </div>
      </div>

      {/* Desktop: Bookshelf rows */}
      <div className="hidden sm:block space-y-10">
        {shelves.map((shelfBoards, i) => (
          <BookshelfRow
            key={i}
            boards={shelfBoards}
            showGhost={i === shelves.length - 1}
            onGhostClick={onGhostClick}
          />
        ))}
      </div>

      {/* Mobile: Horizontal scroll cards */}
      <div className="sm:hidden">
        <BookshelfMobile boards={boards} onGhostClick={onGhostClick} />
      </div>
    </div>
  );
}
