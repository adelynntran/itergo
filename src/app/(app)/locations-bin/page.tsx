"use client";

import { useMemo, useState } from "react";
import {
  useBoards,
  useDeleteLocationBinItem,
  useLocationsBin,
  useRestoreLocation,
} from "@/lib/api/hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, MapPin, RotateCcw, Search, Trash2 } from "lucide-react";

export default function LocationsBinPage() {
  const [search, setSearch] = useState("");
  const [targetByItem, setTargetByItem] = useState<Record<string, string>>({});

  const { data: items, isLoading } = useLocationsBin();
  const { data: boards } = useBoards();
  const restoreLocation = useRestoreLocation();
  const deleteItem = useDeleteLocationBinItem();

  const editableBoards = useMemo(
    () => (boards ?? []).filter((b) => b.role === "host" || b.role === "editor"),
    [boards]
  );

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items ?? [];
    return (items ?? []).filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.sourceBoardName?.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const formatRemovedAt = (value: string | Date | null) => {
    if (!value) return "Unknown";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Unknown";
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-full bg-background p-6 lg:p-8">
      <div className="mb-6 rounded-2xl border border-border bg-card/70 p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Saved For Later</p>
        <h1 className="mt-1 font-display text-4xl leading-none text-foreground">Locations Bin</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Removed pins live here so your ideas never disappear. Restore them to any editable plan card when you are ready.
        </p>
        <div className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
          {filteredItems.length} saved {filteredItems.length === 1 ? "location" : "locations"}
        </div>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 border-border bg-card pl-9"
          placeholder="Search name, category, or source plan card..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16">
          <div className="rounded-full bg-primary/10 p-4">
            <Archive className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 font-display text-3xl leading-none text-foreground">No saved locations</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Move a pin to bin from any plan card to keep it for future trips.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const selectedTarget = targetByItem[item.id] ?? "";
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-xl">
                    <div className="mb-1 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="font-display text-2xl leading-none text-foreground">{item.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.city && item.country
                        ? `${item.city}, ${item.country}`
                        : item.address ?? "No address"}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      Removed {formatRemovedAt(item.removedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.category && (
                      <Badge variant="secondary" className="capitalize">
                        {item.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-border bg-background/50">
                      {item.sourceBoardName
                        ? `From ${item.sourceBoardName}`
                        : "Source plan unavailable"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-9 min-w-[220px] rounded-lg border border-border bg-background/80 px-3 text-sm text-foreground"
                    value={selectedTarget}
                    onChange={(e) =>
                      setTargetByItem((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select destination plan card</option>
                    {editableBoards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    disabled={!selectedTarget || restoreLocation.isPending || editableBoards.length === 0}
                    onClick={() =>
                      restoreLocation.mutate({
                        itemId: item.id,
                        targetPlanCardId: selectedTarget,
                      })
                    }
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteItem.isPending}
                    onClick={() => deleteItem.mutate(item.id)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete
                  </Button>
                </div>
                {editableBoards.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    You need editor or host access to at least one plan card to restore this location.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
