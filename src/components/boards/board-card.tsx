"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock } from "lucide-react";

interface BoardCardProps {
  board: {
    id: string;
    name: string;
    description: string | null;
    role: string;
    boardMode?: "dream" | "execution" | "travel";
    memberCount: number;
    pinCount: number;
    pins?: Array<{
      id: string;
      name: string;
      category: string | null;
      media?: Array<{
        id: string;
        url: string;
        thumbnail: string | null;
      }>;
    }>;
  };
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const modeColors: Record<string, string> = {
  dream: "bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))]",
  execution: "bg-[hsl(var(--slate))]/15 text-[hsl(var(--slate))]",
  travel: "bg-primary/15 text-primary",
};

const categoryEmoji: Record<string, string> = {
  food: "🍽",
  nature: "🌿",
  culture: "🏛",
  nightlife: "🌙",
  shopping: "🛍",
  accommodation: "🏨",
  activity: "⚡",
  transport: "🚗",
  other: "📍",
};

const coverGradients = [
  "from-[#d3c8b7] to-[#c6b89f]",
  "from-[#d1bdad] to-[#bc9a87]",
  "from-[#c8d0db] to-[#aeb9c7]",
  "from-[#d9cec0] to-[#bfa78d]",
];

export function BoardCard({ board, selectMode, isSelected, onToggleSelect }: BoardCardProps) {
  const boardMode = board.boardMode ?? "dream";
  const coverItems = board.pins?.slice(0, 4) ?? [];

  const content = (
    <Card
      className={`group overflow-hidden border border-border bg-card p-0 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="relative h-44 overflow-hidden bg-accent">
        {coverItems.length > 0 ? (
          <div className="grid h-full grid-cols-2 grid-rows-2">
            {coverItems.map((pin, i) => (
              <div key={pin.id} className={`relative overflow-hidden bg-gradient-to-br ${coverGradients[i % coverGradients.length]} p-2`}>
                {pin.media?.[0]?.url ? (
                  <img
                    src={pin.media[0].thumbnail ?? pin.media[0].url}
                    alt={pin.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <>
                    <span className="absolute right-2 top-2 text-sm">
                      {pin.category ? categoryEmoji[pin.category] ?? "📍" : "📍"}
                    </span>
                    <p className="line-clamp-2 text-xs font-medium text-foreground/80">
                      {pin.name}
                    </p>
                  </>
                )}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - coverItems.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={`flex items-center justify-center bg-gradient-to-br ${coverGradients[(coverItems.length + i) % coverGradients.length]}`}
              >
                <MapPin className="h-4 w-4 text-foreground/40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-accent via-card to-muted">
            <span className="text-3xl">🌍</span>
            <p className="mt-2 text-xs text-muted-foreground">No pins yet</p>
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge variant="secondary" className={`text-xs capitalize ${modeColors[boardMode] ?? ""}`}>
            {boardMode}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize bg-background/70 backdrop-blur-sm">
            {board.role}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-3 px-4 py-4">
        <div>
          <h3 className="font-display text-lg leading-none text-foreground transition-colors group-hover:text-primary">
            {board.name}
          </h3>
          {board.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{board.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {board.pinCount}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {board.memberCount}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Active
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
