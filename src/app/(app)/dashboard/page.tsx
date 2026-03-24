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
import { modeConfig } from "@/lib/scrapbook";
import type { BoardMode } from "@/types";
import {
  Plus,
  CheckSquare,
  Trash2,
  UserPlus,
  Sparkles,
  GitMerge,
} from "lucide-react";

const MODE_TABS: { mode: BoardMode; label: string }[] = [
  { mode: "dream", label: "dream" },
  { mode: "execution", label: "execution" },
  { mode: "travel", label: "live" },
  { mode: "momento", label: "momento" },
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

  const mode = modeConfig[activeMode] ?? modeConfig.dream;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="font-handwriting text-2xl text-ink-light animate-pulse">
          flipping through pages...
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 lg:p-9">
      {/* Header — sticky note style */}
      <div className="mb-8 flex items-start justify-between">
        <div className="sticky-note inline-block px-6 py-4">
          <h1 className="font-handwriting text-4xl text-ink">
            my plans
          </h1>
          <p className="mt-1 font-handwriting text-lg text-ink-medium">
            collect, plan, go, remember
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <Button
                variant="secondary"
                size="default"
                disabled={selected.size === 0 || updateBoardMode.isPending}
                onClick={handleMoveToExecution}
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Move to Execution ({selected.size})
              </Button>
              <Button
                variant="outline"
                size="default"
                disabled={selected.size === 0}
                onClick={() => window.alert("Merge Plan Cards is coming soon.")}
              >
                <GitMerge className="mr-1.5 h-4 w-4" />
                Merge
              </Button>
              <Button
                variant="destructive"
                size="default"
                disabled={selected.size === 0 || deleteBoard.isPending}
                onClick={handleDeleteSelected}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete ({selected.size})
              </Button>
              <Button
                variant="outline"
                size="default"
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
                size="default"
                className="border-dashed"
                onClick={() => setIsJoinOpen(true)}
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Join Board
              </Button>
              <Button
                variant="outline"
                size="default"
                className="border-dashed"
                onClick={() => setSelectMode(true)}
              >
                <CheckSquare className="mr-1.5 h-4 w-4" />
                Select
              </Button>
              <Button
                size="default"
                className="kraft-paper text-ink border-none font-medium"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New Board
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="mb-8 flex items-center justify-center">
        <div className="flex items-center gap-1 rounded-2xl bg-paper p-1.5 shadow-sm">
          {MODE_TABS.map(({ mode: tabMode, label }) => {
            const isActive = activeMode === tabMode;
            const tabConfig = modeConfig[tabMode];
            return (
              <button
                key={tabMode}
                onClick={() => setMode(tabMode)}
                className={`rounded-xl px-6 py-2.5 font-handwriting text-xl transition-all ${
                  isActive
                    ? `${tabConfig.bg} ${tabConfig.text} shadow-sm`
                    : "text-ink-light hover:text-ink hover:bg-paper-aged/50"
                }`}
              >
                {label}
              </button>
            );
          })}
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBoards.map((board: any, i: number) => (
            <BoardCard
              key={board.id}
              board={board}
              index={i}
              selectMode={selectMode}
              isSelected={selected.has(board.id)}
              onToggleSelect={() => toggleSelect(board.id)}
            />
          ))}
        </div>
      ) : (
        <div className="lined-paper torn-paper mx-auto flex max-w-md flex-col items-center justify-center px-8 py-16">
          <span className="font-handwriting text-4xl text-ink-light">{mode.label}</span>
          <h3 className="mt-4 font-handwriting text-2xl text-ink">
            nothing here yet
          </h3>
          <p className="mt-2 text-center text-base text-ink-light">
            {activeMode === "dream"
              ? "Start a new board and dump all your ideas!"
              : activeMode === "execution"
                ? "Move boards from Dream to start planning"
                : "Activate Live mode on an execution board to go!"}
          </p>
          {activeMode === "dream" && (
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                size="default"
                className="border-dashed"
                onClick={() => setIsJoinOpen(true)}
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                Join a Board
              </Button>
              <Button
                size="default"
                className="kraft-paper text-ink border-none"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New Board
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateBoardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <JoinBoardDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </div>
  );
}
