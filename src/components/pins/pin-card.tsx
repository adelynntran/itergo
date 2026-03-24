"use client";

import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/votes/vote-buttons";
import { useDeletePin } from "@/lib/api/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, MessageCircle, User, MoreVertical, Trash2, Archive } from "lucide-react";
import { categoryConfig, getTapeColor } from "@/lib/scrapbook";

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
  index?: number;
  isSelected: boolean;
  canEdit: boolean;
  onClick: () => void;
}

export function PinCard({
  pin,
  boardId,
  index = 0,
  isSelected,
  canEdit,
  onClick,
}: PinCardProps) {
  const location = [pin.city, pin.country].filter(Boolean).join(", ");
  const deletePin = useDeletePin();
  const category = pin.category ? categoryConfig[pin.category] ?? categoryConfig.other : null;
  const tapeColor = getTapeColor(index);

  return (
    <div
      onClick={onClick}
      className={`masking-tape group relative cursor-pointer bg-paper p-3 pt-5 transition-all ${
        isSelected
          ? "ring-2 ring-ink shadow-md"
          : "shadow-sm hover:shadow-md"
      }`}
    >
      {/* Override tape color */}
      <style>{`.masking-tape::before { background: var(--tape-${["peach", "pink", "mint", "yellow"][index % 4]}) !important; }`}</style>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {category && (
              <span className="text-sm">{category.emoji}</span>
            )}
            <h3 className="truncate font-handwriting text-base text-ink">
              {pin.name}
            </h3>
          </div>
          {location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-light">
              <MapPin className="h-3 w-3" />
              {location}
            </p>
          )}
          {pin.address && !location && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-light">
              <MapPin className="h-3 w-3" />
              {pin.address}
            </p>
          )}
        </div>
        {category && (
          <span className="tag-label shrink-0 text-[10px] font-medium text-ink-medium">
            {category.label}
          </span>
        )}
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-light hover:bg-paper-aged hover:text-ink"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  deletePin.mutate({
                    pinId: pin.id,
                    boardId,
                    action: "move_to_bin",
                  });
                }}
              >
                <Archive className="mr-2 h-4 w-4" />
                Move to Bin
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePin.mutate({
                    pinId: pin.id,
                    boardId,
                    action: "delete",
                  });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {pin.notes && (
        <p className="mt-1.5 line-clamp-2 text-xs text-ink-medium">
          {pin.notes}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between border-t border-dashed border-paper-kraft pt-2">
        <VoteButtons pinId={pin.id} boardId={boardId} votes={pin.votes} compact />
        <div className="flex items-center gap-3 text-xs text-ink-light">
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
