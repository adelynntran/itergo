"use client";

import { useEffect, useMemo, useState } from "react";
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

const LOGO_IMAGES = [
  "/analog/itergo-logo/_ (4)-jukebox-bg-removed.png",
  "/analog/itergo-logo/_ (5)-jukebox-bg-removed.png",
  "/analog/itergo-logo/_ (6)-jukebox-bg-removed.png",
];

function LogoCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LOGO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="itergo-logo-wrap">
      {LOGO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="itergo logo"
          data-active={i === index ? "true" : "false"}
          style={{ display: i === index ? "block" : "none" }}
          draggable={false}
        />
      ))}
    </div>
  );
}

type DemoBoard = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  role: string;
  boardMode: "dream" | "execution" | "travel";
  memberCount: number;
  pinCount: number;
  isExample: true;
};

const TARGET_EXAMPLE_COUNTS: Record<"dream" | "execution" | "travel", number> = {
  dream: 5,
  execution: 3,
  travel: 2,
};

const MODE_EXAMPLE_BOARDS: Record<"dream" | "execution" | "travel", Omit<DemoBoard, "id" | "isExample" | "boardMode">[]> = {
  dream: [
    { name: "Kyoto + Osaka 2027 Dream", description: "Photo spots + food ideas", coverImage: "/analog/travel-example/travel-example-1.jpg", role: "host", memberCount: 1, pinCount: 4 },
    { name: "Seoul Spring Dream", description: "Cafe streets + design stores", coverImage: "/analog/travel-example/travel-example-2.jpg", role: "host", memberCount: 2, pinCount: 6 },
    { name: "Bali Slow Days", description: "Beach, journals, and sunsets", coverImage: "/analog/travel-example/travel-example-3.jpg", role: "editor", memberCount: 3, pinCount: 7 },
    { name: "Taipei Night Eats", description: "Night markets + hidden alleys", coverImage: "/analog/travel-example/travel-example-4.jpg", role: "viewer", memberCount: 2, pinCount: 5 },
    { name: "Scotland Cozy Route", description: "Highlands + rainy bookstores", coverImage: "/analog/travel-example/travel-example-5.jpg", role: "host", memberCount: 4, pinCount: 8 },
  ],
  execution: [
    { name: "Vietnam 2027", description: "Locked route + booking checklist", coverImage: "/analog/travel-example/travel-example-10.jpg", role: "host", memberCount: 1, pinCount: 2 },
    { name: "Tokyo Plan Sprint", description: "Daily blocks and reservations", coverImage: "/analog/travel-example/travel-example-6.jpg", role: "editor", memberCount: 3, pinCount: 9 },
    { name: "Lisbon Budget Plan", description: "Transit + neighborhood timing", coverImage: "/analog/travel-example/travel-example-7.jpg", role: "viewer", memberCount: 2, pinCount: 5 },
  ],
  travel: [
    { name: "Live in Kyoto", description: "Walking log + realtime edits", coverImage: "/analog/travel-example/travel-example-8.jpg", role: "host", memberCount: 2, pinCount: 6 },
    { name: "Osaka Right Now", description: "Today's route + moments", coverImage: "/analog/travel-example/travel-example-9.jpg", role: "editor", memberCount: 2, pinCount: 4 },
  ],
};

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

  const boardsWithExamples = useMemo(() => {
    const realBoards = (boards ?? []) as any[];
    const withExamples: any[] = [...realBoards];

    (["dream", "execution", "travel"] as const).forEach((mode) => {
      const realCount = realBoards.filter(
        (board) => (board.boardMode ?? "dream") === mode
      ).length;

      const needed = Math.max(0, TARGET_EXAMPLE_COUNTS[mode] - realCount);
      if (needed === 0) return;

      const demos: DemoBoard[] = MODE_EXAMPLE_BOARDS[mode]
        .slice(0, needed)
        .map((demo, idx) => ({
          ...demo,
          id: `example-${mode}-${idx + 1}`,
          boardMode: mode,
          isExample: true,
        }));

      withExamples.push(...demos);
    });

    return withExamples;
  }, [boards]);

  const setMode = (mode: BoardMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    router.push(`/dashboard?${params.toString()}`);
    setSelectMode(false);
    setSelected(new Set());
  };

  const filteredBoards = useMemo(() => {
    return boardsWithExamples.filter((board: any) => {
      const boardMode = board.boardMode ?? "dream";
      return boardMode === activeMode;
    });
  }, [boardsWithExamples, activeMode]);

  const toggleSelect = (id: string) => {
    if (id.startsWith("example-")) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    selected.forEach((id) =>
      id.startsWith("example-")
        ? null
        :
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
      id.startsWith("example-")
        ? null
        :
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
    <div className="analog-dashboard-canvas relative min-h-full">
      <LogoCycler />

      {/* Header area — on the fabric, above the notebook */}
      <div className="px-7 pt-7 lg:px-9 lg:pt-9">
        <div className="mb-6 flex items-start justify-end gap-2">
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

      {/* Mode Tabs — on the fabric */}
      <div className="mb-6 flex items-center justify-center">
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
      </div>

      {/* Notebook container — plan cards sit on the notebook page */}
      <div className="notebook-page-container mx-auto max-w-6xl px-4 pb-10">
        <div className="notebook-page relative rounded-sm p-6 lg:p-10">
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
                  disableNavigation={String(board.id).startsWith("example-")}
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
        </div>
      </div>

      <CreateBoardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <JoinBoardDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </div>
  );
}
