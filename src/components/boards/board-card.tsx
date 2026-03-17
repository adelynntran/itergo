"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Crown, Edit3, Eye } from "lucide-react";

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
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const roleIcons: Record<string, React.ReactNode> = {
  host: <Crown className="h-3 w-3" />,
  editor: <Edit3 className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

const roleColors: Record<string, string> = {
  host: "bg-amber-100 text-amber-700",
  editor: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-700",
};

const modeColors: Record<string, string> = {
  dream: "bg-indigo-100 text-indigo-700",
  execution: "bg-emerald-100 text-emerald-700",
  travel: "bg-orange-100 text-orange-700",
};

export function BoardCard({
  board,
  selectMode,
  isSelected,
  onToggleSelect,
}: BoardCardProps) {
  const boardMode = board.boardMode ?? "dream";

  const content = (
    <Card
      className={`group cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-indigo-600" : ""
      }`}
    >
      {/* Cover image placeholder */}
      <div className="relative h-32 rounded-t-lg bg-gradient-to-br from-indigo-400 to-purple-500">
        {selectMode && (
          <div className="absolute left-3 top-3">
            <div
              className={`h-5 w-5 rounded border-2 ${
                isSelected
                  ? "border-indigo-600 bg-indigo-600"
                  : "border-white bg-white/30"
              } flex items-center justify-center`}
            >
              {isSelected && (
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <Badge
            variant="secondary"
            className={`text-xs ${modeColors[boardMode] ?? ""}`}
          >
            {boardMode}
          </Badge>
          <Badge
            variant="secondary"
            className={`text-xs ${roleColors[board.role] ?? ""}`}
          >
            {roleIcons[board.role]}
            <span className="ml-1 capitalize">{board.role}</span>
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base">{board.name}</CardTitle>
        {board.description && (
          <CardDescription className="line-clamp-2 text-xs">
            {board.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {board.pinCount} {board.pinCount === 1 ? "pin" : "pins"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {board.memberCount} {board.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (selectMode) {
    return <div onClick={onToggleSelect}>{content}</div>;
  }

  return <Link href={`/board/${board.id}`}>{content}</Link>;
}
