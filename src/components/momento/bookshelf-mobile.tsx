"use client";

import { useRouter } from "next/navigation";
import { Plus, MapPin, Calendar } from "lucide-react";

interface BookshelfMobileProps {
  boards: Array<{
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
  }>;
  onGhostClick: () => void;
}

export function BookshelfMobile({
  boards,
  onGhostClick,
}: BookshelfMobileProps) {
  const router = useRouter();

  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-none">
      {boards.map((board) => {
        const coverUrl =
          board.coverImage ??
          board.pins.find((p) => p.media && p.media.length > 0)?.media?.[0]
            ?.thumbnail ??
          board.pins.find((p) => p.media && p.media.length > 0)?.media?.[0]
            ?.url ??
          null;

        const date = board.momentoStartedAt ?? board.createdAt;
        const dateLabel = date
          ? new Date(date).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "";

        const cities = [
          ...new Set(board.pins.map((p) => p.city).filter(Boolean)),
        ].slice(0, 2);

        return (
          <div
            key={board.id}
            className="flex-shrink-0 snap-center cursor-pointer w-44"
            onClick={() => router.push(`/board/${board.id}`)}
          >
            {/* Book cover */}
            <div className="relative h-56 w-full overflow-hidden rounded-lg shadow-md">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={board.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.10 55) 0%, oklch(0.45 0.08 30) 100%)",
                  }}
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-display text-sm font-semibold text-white leading-tight">
                  {board.name}
                </h3>
                {dateLabel && (
                  <div className="mt-1 flex items-center gap-1 text-white/70">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">{dateLabel}</span>
                  </div>
                )}
                {cities.length > 0 && (
                  <div className="mt-0.5 flex items-center gap-1 text-white/70">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{cities.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Ghost card */}
      <div
        className="flex h-56 w-44 flex-shrink-0 snap-center cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300/50"
        onClick={onGhostClick}
      >
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <Plus className="h-6 w-6" />
          <span className="text-xs">New Memory</span>
        </div>
      </div>
    </div>
  );
}
