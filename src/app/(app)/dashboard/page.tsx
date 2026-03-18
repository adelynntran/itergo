"use client";

import { useMemo, useState } from "react";
import {
  useBoards,
  useDeleteBoard,
  useUpdateBoardMode,
} from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { BoardCard } from "@/components/boards/board-card";
import { CreateBoardDialog } from "@/components/boards/create-board-dialog";
import { JoinBoardDialog } from "@/components/boards/join-board-dialog";
import {
  Plus,
  CheckSquare,
  Trash2,
  UserPlus,
  Sparkles,
  GitMerge,
  Search,
  Archive,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const { data: boards, isLoading } = useBoards();
  const deleteBoard = useDeleteBoard();
  const updateBoardMode = useUpdateBoardMode();

  const filteredBoards = useMemo(() => {
    if (!boards) return [];
    const q = search.trim().toLowerCase();
    if (!q) return boards;
    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(q) ||
        board.description?.toLowerCase().includes(q)
    );
  }, [boards, search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    selected.forEach((id) =>
      deleteBoard.mutate(id, {
        onSuccess: () => {
          setSelected(new Set());
          setSelectMode(false);
        },
      })
    );
  };

  const handleMoveToExecution = () => {
    selected.forEach((id) =>
      updateBoardMode.mutate(
        {
          boardId: id,
          boardMode: "execution",
        },
        {
          onSuccess: () => {
            setSelected(new Set());
            setSelectMode(false);
          },
        }
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-full bg-background">
      <div className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
          <div className="space-y-0.5">
            <h1 className="font-display text-3xl tracking-wide text-foreground">itergo</h1>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Your plan cards</p>
          </div>
          <Link href="/locations-bin">
            <Button variant="outline" size="sm">
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              Location Bin
            </Button>
          </Link>
        </div>
      </div>

      <div className="animate-page-fade mx-auto max-w-6xl p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-foreground">Your Trips</h2>
            <p className="text-sm text-muted-foreground">
              {boards?.length ?? 0} plans - where to next?
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selected.size === 0 || updateBoardMode.isPending}
                  onClick={handleMoveToExecution}
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Move to Execution ({selected.size})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selected.size === 0}
                  onClick={() => window.alert("Merge Plan Cards is coming soon.")}
                >
                  <GitMerge className="mr-1.5 h-4 w-4" />
                  Merge (Soon)
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selected.size === 0 || deleteBoard.isPending}
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete ({selected.size})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectMode(false);
                    setSelected(new Set());
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsJoinOpen(true)}>
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Join
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectMode(true)}>
                  <CheckSquare className="mr-1.5 h-4 w-4" />
                  Select
                </Button>
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Trip
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                selectMode={selectMode}
                isSelected={selected.has(board.id)}
                onToggleSelect={() => toggleSelect(board.id)}
              />
            ))}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/40 transition-all hover:border-primary/50 hover:shadow-sm"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-display text-lg text-foreground">Start a new trip</p>
              <p className="text-xs text-muted-foreground">Dream something up</p>
            </button>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border py-16 text-center">
            <p className="font-display text-2xl text-foreground">No trips found</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first plan card</p>
          </div>
        )}

        <div className="mt-10 rounded-xl border border-border bg-card p-5">
          <span className="rounded-full bg-[hsl(var(--olive))]/15 px-2.5 py-1 text-xs text-[hsl(var(--olive))]">
            Coming Soon
          </span>
          <h3 className="mt-2 font-display text-lg text-foreground">Merge & Execute</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select multiple Dream boards and combine them into one execution plan.
          </p>
        </div>
      </div>

      <CreateBoardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <JoinBoardDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </div>
  );
}
