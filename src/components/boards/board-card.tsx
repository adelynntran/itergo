"use client";

import Link from "next/link";
import { MapPin, Users, Crown, Edit3, Eye } from "lucide-react";
import { modeConfig, roleConfig, getOrganicRotation, getTapeColor } from "@/lib/scrapbook";

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
}

const roleIcons: Record<string, React.ReactNode> = {
  host: <Crown className="h-3 w-3" />,
  editor: <Edit3 className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

export function BoardCard({
  board,
  index = 0,
  selectMode,
  isSelected,
  onToggleSelect,
}: BoardCardProps) {
  const boardMode = board.boardMode ?? "dream";
  const mode = modeConfig[boardMode] ?? modeConfig.dream;
  const tapeColor = getTapeColor(index);
  const rotation = getOrganicRotation(index);
  const role = roleConfig[board.role];

  const content = (
    <div
      className={`group relative cursor-pointer bg-paper p-3 pb-12 transition-all duration-300 polaroid-shadow hover:-translate-y-1 ${
        isSelected ? "ring-2 ring-ink" : ""
      }`}
      style={rotation}
    >
      {/* Tape strips */}
      <div
        className={`absolute -top-3 left-[15%] z-10 h-5 w-10 ${tapeColor} rotate-[-5deg] opacity-80`}
      />
      <div
        className={`absolute -top-3 right-[15%] z-10 h-5 w-10 ${getTapeColor(index + 2)} rotate-[3deg] opacity-80`}
      />

      {/* Select checkbox */}
      {selectMode && (
        <div className="absolute left-4 top-4 z-20">
          <div
            className={`checkbox-hand ${isSelected ? "checked" : ""}`}
          />
        </div>
      )}

      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-aged">
        {board.coverImage ? (
          <img
            src={board.coverImage}
            alt={board.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-paper-aged to-paper-kraft">
            <span className="font-handwriting text-3xl text-ink-light">{mode.label}</span>
          </div>
        )}
        {/* Mode badge */}
        <div
          className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-sm font-medium ${mode.bg} ${mode.text}`}
        >
          {mode.label}
        </div>
      </div>

      {/* Polaroid bottom area */}
      <div className="mt-3.5 px-1">
        <h3 className="truncate font-handwriting text-xl text-ink">
          {board.name}
        </h3>
        {board.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-light">
            {board.description}
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between text-sm text-ink-light">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {board.pinCount}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {board.memberCount}
            </span>
          </div>
          {role && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${role.bg} ${role.text}`}
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

  return <Link href={`/board/${board.id}`}>{content}</Link>;
}
