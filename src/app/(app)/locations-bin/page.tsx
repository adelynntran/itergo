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
import { Archive, RotateCcw, Trash2 } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Locations Bin</h1>
        <p className="mt-1 text-sm text-gray-500">
          Saved places removed from plan cards. Restore them anytime.
        </p>
      </div>

      <div className="mb-4 max-w-md">
        <Input
          placeholder="Search by location, category, or source plan card..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-16">
          <div className="rounded-full bg-indigo-50 p-4">
            <Archive className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No saved locations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Move a pin to bin from any plan card to keep it for future trips.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const selectedTarget = targetByItem[item.id] ?? "";
            return (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.city && item.country
                        ? `${item.city}, ${item.country}`
                        : item.address ?? "No address"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.category && (
                      <Badge variant="secondary" className="capitalize">
                        {item.category}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {item.sourceBoardName
                        ? `From ${item.sourceBoardName}`
                        : "Source plan unavailable"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-9 min-w-[220px] rounded-md border border-gray-300 bg-white px-3 text-sm"
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
                    disabled={!selectedTarget || restoreLocation.isPending}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
