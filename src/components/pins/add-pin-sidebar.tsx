"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  MapPin,
  Loader2,
} from "lucide-react";

interface AddPinSidebarProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  text: string;
}

const categories = [
  { value: "food", label: "Food & Drink", emoji: "🍽" },
  { value: "nature", label: "Nature", emoji: "🌿" },
  { value: "culture", label: "Culture", emoji: "🏛" },
  { value: "nightlife", label: "Nightlife", emoji: "🌙" },
  { value: "shopping", label: "Shopping", emoji: "🛍" },
  { value: "accommodation", label: "Stay", emoji: "🏨" },
  { value: "activity", label: "Activity", emoji: "🎯" },
  { value: "other", label: "Other", emoji: "📍" },
];

export function AddPinSidebar({
  boardId,
  open,
  onOpenChange,
}: AddPinSidebarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();

  const createPin = trpc.pins.create.useMutation({
    onSuccess: () => {
      utils.boards.get.invalidate();
      resetForm();
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setQuery("");
    setResults([]);
    setSelectedPlace(null);
    setCategory("");
    setNotes("");
  };

  const searchPlaces = useCallback(
    async (q: string) => {
      if (!q.trim() || q.length < 3) {
        setResults([]);
        return;
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;

      setSearching(true);
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            q
          )}.json?access_token=${token}&types=poi,place,address,locality&limit=5`
        );
        const data = await res.json();
        setResults(data.features ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  // Debounced search
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSelectedPlace(null);
    const timer = setTimeout(() => searchPlaces(value), 400);
    return () => clearTimeout(timer);
  };

  const selectPlace = (result: SearchResult) => {
    setSelectedPlace(result);
    setQuery(result.place_name);
    setResults([]);
  };

  const extractCityCountry = (result: SearchResult) => {
    const ctx = result.context ?? [];
    const city =
      ctx.find((c) => c.id.startsWith("place"))?.text ??
      ctx.find((c) => c.id.startsWith("locality"))?.text;
    const country = ctx.find((c) => c.id.startsWith("country"))?.text;
    return { city, country };
  };

  const handleSubmit = () => {
    if (!selectedPlace) return;

    const { city, country } = extractCityCountry(selectedPlace);

    createPin.mutate({
      boardId,
      name: selectedPlace.text,
      latitude: selectedPlace.center[1],
      longitude: selectedPlace.center[0],
      address: selectedPlace.place_name,
      city: city ?? undefined,
      country: country ?? undefined,
      category: category || undefined,
      notes: notes || undefined,
      placeId: selectedPlace.id,
      sourceType: "search",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle>Add a Place</SheetTitle>
          <SheetDescription>
            Search for a destination to add to your board
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search for a place</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="e.g., Eiffel Tower, Edinburgh Castle"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
                autoFocus
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
              )}
            </div>

            {/* Search Results */}
            {results.length > 0 && !selectedPlace && (
              <div className="rounded-lg border bg-white shadow-lg">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => selectPlace(result)}
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {result.text}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {result.place_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Place */}
            {selectedPlace && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-green-900">
                    {selectedPlace.text}
                  </p>
                  <p className="truncate text-xs text-green-700">
                    {selectedPlace.place_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlace(null);
                    setQuery("");
                  }}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() =>
                    setCategory(category === cat.value ? "" : cat.value)
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat.value
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Why this place? Any tips?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPlace || createPin.isPending}
          >
            {createPin.isPending ? "Adding..." : "Add to Board"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
