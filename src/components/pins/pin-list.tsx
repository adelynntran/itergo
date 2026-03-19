"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { PinCard } from "@/components/pins/pin-card";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Pin {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  notes: string | null;
  media?: Array<{
    id: string;
    url: string;
    thumbnail: string | null;
  }>;
  addedByUser: { displayName: string; avatarUrl: string | null } | null;
  votes: Array<{ voteType: string; userId: string }>;
  comments: Array<unknown>;
  createdAt: Date | null;
}

interface PinListProps {
  boardId: string;
  pins: Pin[];
  selectedPinId: string | null;
  onPinSelect: (id: string | null) => void;
  canEdit: boolean;
}

const categories = [
  "all",
  "food",
  "nature",
  "culture",
  "nightlife",
  "shopping",
  "accommodation",
  "activity",
  "other",
];

export function PinList({
  boardId,
  pins,
  selectedPinId,
  onPinSelect,
  canEdit,
}: PinListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "most_voted" | "name">(
    "recent"
  );

  let filtered = pins.filter((pin) => {
    const matchesSearch =
      !search ||
      pin.name.toLowerCase().includes(search.toLowerCase()) ||
      pin.city?.toLowerCase().includes(search.toLowerCase()) ||
      pin.country?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" || pin.category === category;
    return matchesSearch && matchesCategory;
  });

  // Sort
  if (sortBy === "most_voted") {
    filtered = [...filtered].sort(
      (a, b) => b.votes.length - a.votes.length
    );
  } else if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }
  // "recent" is the default order from API

  return (
    <div className="flex h-full flex-col">
      {/* Search & Filter Header */}
      <div className="space-y-2 border-b p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  category === cat
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("most_voted")}>
                Most Voted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Name A-Z
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pin List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {pins.length === 0
                ? "No places added yet"
                : "No places match your filters"}
            </p>
          ) : (
            filtered.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                boardId={boardId}
                isSelected={pin.id === selectedPinId}
                canEdit={canEdit}
                onClick={() => onPinSelect(pin.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer: count */}
      <div className="border-t px-3 py-2 text-xs text-gray-500">
        {filtered.length} of {pins.length} places
      </div>
    </div>
  );
}
