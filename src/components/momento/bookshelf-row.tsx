"use client";

import { BookSpine } from "./book-spine";
import { GhostBook } from "./ghost-book";

interface BookshelfRowProps {
  boards: Array<{
    id: string;
    name: string;
    description?: string | null;
    coverImage?: string | null;
    momentoStartedAt?: string | null;
    createdAt?: string | null;
    pins: Array<{ media?: Array<{ url: string; thumbnail?: string | null }> }>;
  }>;
  showGhost?: boolean;
  onGhostClick: () => void;
}

export function BookshelfRow({
  boards,
  showGhost = false,
  onGhostClick,
}: BookshelfRowProps) {
  return (
    <div className="bookshelf-shelf">
      {boards.map((board) => (
        <BookSpine key={board.id} board={board} />
      ))}
      {showGhost && <GhostBook onClick={onGhostClick} />}
    </div>
  );
}
