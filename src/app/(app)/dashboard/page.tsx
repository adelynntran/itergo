"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useBoards,
  useDeleteBoard,
  useUpdateBoardMode,
} from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { BoardCard } from "@/components/boards/board-card";
import { CreateBoardDialog } from "@/components/boards/create-board-dialog";
import { JoinBoardDialog } from "@/components/boards/join-board-dialog";
import { MomentoBookshelf } from "@/components/momento/bookshelf";
import type { BoardMode } from "@/types";
import {
  Plus,
  CheckSquare,
  Trash2,
  UserPlus,
  Sparkles,
  GitMerge,
  Cloud,
  Plane,
  BookOpen,
} from "lucide-react";

const MODE_TABS: { mode: BoardMode; label: string; icon: typeof Cloud }[] = [
  { mode: "dream", label: "Dream", icon: Cloud },
  { mode: "execution", label: "Execution", icon: Sparkles },
  { mode: "travel", label: "Travel", icon: Plane },
  { mode: "momento", label: "Momento", icon: BookOpen },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeMode = (searchParams.get("mode") as BoardMode) || "dream";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: boards, isLoading } = useBoards();

  const deleteBoard = useDeleteBoard();
  const updateBoardMode = useUpdateBoardMode();

  const setMode = (mode: BoardMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    router.push(`/dashboard?${params.toString()}`);
    setSelectMode(false);
    setSelected(new Set());
  };

  const filteredBoards = useMemo(() => {
    if (!boards) return [];
    return boards.filter((board: any) => {
      const boardMode = board.boardMode ?? "dream";
      return boardMode === activeMode;
    });
  }, [boards, activeMode]);

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Cards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Collect travel inspiration with your friends
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
                Merge (Coming Soon)
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
          ) : activeMode !== "momento" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsJoinOpen(true)}
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Join Board
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectMode(true)}
              >
                <CheckSquare className="mr-1.5 h-4 w-4" />
                Select
              </Button>
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                New Board
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="mb-6 flex items-center justify-center">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm">
          {MODE_TABS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeMode === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeMode === "momento" ? (
        <MomentoBookshelf
          boards={filteredBoards}
          onGhostClick={() =>
            window.alert(
              "Complete a trip in Travel mode to create a Momento book!"
            )
          }
        />
      ) : filteredBoards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBoards.map((board: any) => (
            <BoardCard
              key={board.id}
              board={board}
              selectMode={selectMode}
              isSelected={selected.has(board.id)}
              onToggleSelect={() => toggleSelect(board.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-16">
          <div className="rounded-full bg-indigo-50 p-4">
            <Plus className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No plan cards yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first plan card to start collecting travel ideas
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsJoinOpen(true)}
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Join a Board
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Board
            </Button>
          </div>
        </div>
      )}

      <CreateBoardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <JoinBoardDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </div>
  );
}
