"use client";

import Link from "next/link";
import { MapPin, Users, Crown, Edit3, Eye } from "lucide-react";
import { modeConfig, roleConfig, getOrganicRotation } from "@/lib/scrapbook";

interface BoardCardProps {
  board: {
    id: string;
    name: string;
    description: string | null;
    coverImage: string | null;
    role: string;
    boardMode?: "dream" | "execution" | "travel";
    memberCount: number;
    pinCount: number;
  };
  index?: number;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  disableNavigation?: boolean;
}

const roleIcons: Record<string, React.ReactNode> = {
  host: <Crown className="h-3 w-3" />,
  editor: <Edit3 className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

const CARD_FRAME = "/analog/cards/plan-card-bg-cutout.png";

const TRAVEL_PHOTOS = Array.from(
  { length: 10 },
  (_, i) => `/analog/travel-example/travel-example-${i + 1}.jpg`
);

const MODE_FALLBACK_PHOTOS: Record<"dream" | "execution" | "travel", string[]> = {
  dream: [1, 2, 3, 4, 5].map((n) => TRAVEL_PHOTOS[n - 1]),
  execution: [10, 6, 7].map((n) => TRAVEL_PHOTOS[n - 1]),
  travel: [8, 9].map((n) => TRAVEL_PHOTOS[n - 1]),
};

export function BoardCard({
  board,
  index = 0,
  selectMode,
  isSelected,
  onToggleSelect,
  disableNavigation = false,
}: BoardCardProps) {
  const boardMode = board.boardMode ?? "dream";
  const mode = modeConfig[boardMode] ?? modeConfig.dream;
  const rotation = getOrganicRotation(index);
  const role = roleConfig[board.role];
  // Measured from plan-card-bg-cutout.png (969x1200):
  // Photo cutout: top 12.2%, left 8.6%, right 10.2%, bottom 23.6%
  // Text strip: top 77%, bottom 7%
  const photoInset = "top-[12%] left-[9%] right-[10%] bottom-[24%]";
  const textInset = "top-[77%] bottom-[7%] left-[9%] right-[10%]";

  const modeFallbackSet =
    MODE_FALLBACK_PHOTOS[boardMode] ?? MODE_FALLBACK_PHOTOS.dream;
  const fallbackImage = modeFallbackSet[index % modeFallbackSet.length];

  const content = (
    <div
      className={`plan-card group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
        isSelected ? "ring-2 ring-ink ring-offset-2" : ""
      }`}
      style={rotation}
    >
      {/* The polaroid frame on TOP as overlay */}
      <img
        src={CARD_FRAME}
        alt=""
        className="pointer-events-none relative z-10 block w-full"
        draggable={false}
        loading="lazy"
      />

      {/* Select checkbox */}
      {selectMode && (
        <div className="absolute left-4 top-4 z-20">
          <div className={`checkbox-hand ${isSelected ? "checked" : ""}`} />
        </div>
      )}

      {/* Cover image — behind the frame */}
      <div className={`absolute z-[1] overflow-hidden ${photoInset}`}>
        <img
          src={board.coverImage || fallbackImage}
          alt={board.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
      </div>

      {/* Mode badge */}
      <div
        className={`absolute z-20 right-[12%] top-[15%] rounded-full px-2 py-0.5 text-xs font-medium ${mode.bg} ${mode.text}`}
      >
        {mode.label}
      </div>

      {/* Text info — inside the polaroid bottom strip */}
      <div className={`absolute z-20 flex flex-col justify-center overflow-hidden ${textInset}`}>
        <h3 className="truncate font-handwriting text-base leading-tight text-ink">
          {board.name}
        </h3>
        {board.description && (
          <p className="line-clamp-1 text-[11px] text-ink-light">
            {board.description}
          </p>
        )}
        <div className="mt-0.5 flex items-center justify-between text-[11px] text-ink-light">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {board.pinCount}
            </span>
            <span className="flex items-center gap-0.5">
              <Users className="h-2.5 w-2.5" />
              {board.memberCount}
            </span>
          </div>
          {role && (
            <span
              className={`flex items-center gap-0.5 rounded-full px-1.5 py-px text-[10px] ${role.bg} ${role.text}`}
            >
              {roleIcons[board.role]}
              <span className="capitalize">{board.role}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (selectMode) {
    return <div onClick={onToggleSelect}>{content}</div>;
  }

  if (disableNavigation) {
    return content;
  }

  return <Link href={`/board/${board.id}`}>{content}</Link>;
}
