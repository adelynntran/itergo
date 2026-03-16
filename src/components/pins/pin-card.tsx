"use client";

import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/votes/vote-buttons";
import { MapPin, MessageCircle, User } from "lucide-react";

interface PinCardProps {
  pin: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    country: string | null;
    category: string | null;
    notes: string | null;
    addedByUser: { displayName: string; avatarUrl: string | null } | null;
    votes: Array<{ voteType: string; userId: string }>;
    comments: Array<unknown>;
  };
  boardId: string;
  isSelected: boolean;
  onClick: () => void;
}

const categoryEmoji: Record<string, string> = {
  food: "🍽",
  nature: "🌿",
  culture: "🏛",
  nightlife: "🌙",
  shopping: "🛍",
  accommodation: "🏨",
  activity: "🎯",
  transport: "🚗",
  other: "📍",
};

export function PinCard({ pin, boardId, isSelected, onClick }: PinCardProps) {
  const location = [pin.city, pin.country].filter(Boolean).join(", ");

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 transition-all ${
        isSelected
          ? "border-indigo-300 bg-indigo-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {pin.category && (
              <span className="text-sm">
                {categoryEmoji[pin.category] ?? "📍"}
              </span>
            )}
            <h3 className="truncate text-sm font-medium text-gray-900">
              {pin.name}
            </h3>
          </div>
          {location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          )}
          {pin.address && !location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {pin.address}
            </p>
          )}
        </div>
        {pin.category && (
          <Badge variant="secondary" className="shrink-0 text-xs capitalize">
            {pin.category}
          </Badge>
        )}
      </div>

      {pin.notes && (
        <p className="mt-1.5 line-clamp-2 text-xs text-gray-600">
          {pin.notes}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <VoteButtons pinId={pin.id} boardId={boardId} votes={pin.votes} compact />
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {pin.comments.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageCircle className="h-3 w-3" />
              {pin.comments.length}
            </span>
          )}
          {pin.addedByUser && (
            <span className="flex items-center gap-0.5">
              <User className="h-3 w-3" />
              {pin.addedByUser.displayName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
