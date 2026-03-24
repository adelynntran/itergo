"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardDetail, useUpdateBoardMode } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { PinMap } from "@/components/pins/pin-map";
import { PinList } from "@/components/pins/pin-list";
import { AddPinSidebar } from "@/components/pins/add-pin-sidebar";
import { BoardSettingsSheet } from "@/components/boards/board-settings-sheet";
import { modeConfig } from "@/lib/scrapbook";
import {
  Plus,
  List,
  Map as MapIcon,
  ArrowLeft,
  Settings,
  Users,
  BookOpen,
  Check,
} from "lucide-react";

type MomentoPin = {
  id: string;
  name: string;
  city?: string | null;
  notes?: string | null;
  media?: Array<{
    thumbnail?: string | null;
    url?: string | null;
  }>;
};

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showPinList, setShowPinList] = useState(true);
  const [showAddPin, setShowAddPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const { data: board, isLoading } = useBoardDetail(id);
  const updateBoardMode = useUpdateBoardMode();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="font-handwriting text-2xl text-ink-light animate-pulse">
          opening your board...
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="font-handwriting text-xl text-ink-light">board not found</p>
        <Button variant="outline" className="border-dashed" onClick={() => router.push("/dashboard")}>
          back to dashboard
        </Button>
      </div>
    );
  }

  const currentMode = (board.boardMode ?? "dream") as keyof typeof modeConfig;
  const mode = modeConfig[currentMode] ?? modeConfig.dream;
  const userRole = board.currentUserRole;
  const canEdit = userRole === "host" || userRole === "editor";

  // Momento mode: show the book interior
  if (currentMode === "momento") {
    return (
      <div className="flex h-screen flex-col">
        {/* Momento Header */}
        <div className="flex items-center justify-between border-b border-dashed border-paper-kraft bg-paper px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-ink-light hover:bg-paper-aged"
              onClick={() => router.push("/dashboard?mode=momento")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-handwriting text-xl text-ink">
                {board.name}
              </h1>
              {board.description && (
                <p className="text-xs text-ink-light">{board.description}</p>
              )}
            </div>
            <span className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${mode.bg} ${mode.text}`}>
              {mode.label}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-ink-light hover:bg-paper-aged"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Momento Content — Scrapbook */}
        <div className="paper-canvas flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-semibold text-ink">
                {board.name}
              </h2>
              <p className="mt-1 text-sm text-ink-light">
                {board.pins.length} places visited
              </p>
            </div>

            {/* Scrapbook grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {board.pins.map((pin: MomentoPin, i: number) => {
                const rotation = ((i % 5) - 2) * 1.2;
                const coverUrl =
                  pin.media?.[0]?.thumbnail ?? pin.media?.[0]?.url ?? null;

                return (
                  <div
                    key={pin.id}
                    className="masking-tape bg-paper p-4 pt-6 shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt={pin.name}
                        className="mb-3 h-36 w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <h3 className="font-handwriting text-lg text-ink">
                      {pin.name}
                    </h3>
                    {pin.city && (
                      <p className="text-xs text-ink-light">{pin.city}</p>
                    )}
                    {pin.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-ink-medium italic">
                        {pin.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {board.pins.length === 0 && (
              <div className="lined-paper torn-paper mx-auto max-w-sm py-16 text-center">
                <BookOpen className="mx-auto h-12 w-12 mb-3 text-ink-light opacity-40" />
                <p className="font-handwriting text-lg text-ink-light">
                  no memories yet...
                </p>
                <p className="mt-1 text-sm text-ink-light">
                  content creation coming soon!
                </p>
              </div>
            )}
          </div>
        </div>

        <BoardSettingsSheet
          board={board}
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </div>
    );
  }

  // Normal mode (dream/execution/travel)
  return (
    <div className="flex h-screen flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between border-b border-dashed border-paper-kraft bg-paper px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-ink-light hover:bg-paper-aged"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-handwriting text-xl text-ink">{board.name}</h1>
            {board.description && (
              <p className="text-xs text-ink-light">{board.description}</p>
            )}
          </div>
          <span className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${mode.bg} ${mode.text}`}>
            {mode.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-ink-light">
            <Users className="h-3 w-3" />
            {board.members.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Complete Trip button */}
          {currentMode === "travel" && canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="border-dashed border-momento text-momento-text hover:bg-momento-light"
              disabled={updateBoardMode.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    "Complete this trip and create a Momento book? This will move the board to your bookshelf."
                  )
                ) {
                  updateBoardMode.mutate({
                    boardId: board.id,
                    boardMode: "momento",
                  });
                }
              }}
            >
              <Check className="mr-1 h-3 w-3" />
              Complete Trip
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-ink-light hover:bg-paper-aged"
            onClick={() => setShowPinList(!showPinList)}
            title={showPinList ? "Hide pin list" : "Show pin list"}
          >
            {showPinList ? (
              <MapIcon className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-ink-light hover:bg-paper-aged"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button
              size="sm"
              className="kraft-paper text-ink border-none"
              onClick={() => setShowAddPin(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Place
            </Button>
          )}
        </div>
      </div>

      {/* Main Content: Map + Pin List */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <PinMap
            pins={board.pins}
            selectedPinId={selectedPinId}
            onPinSelect={setSelectedPinId}
          />
        </div>

        {/* Pin List Panel */}
        {showPinList && (
          <div className="w-96 border-l border-dashed border-paper-kraft bg-paper">
            <PinList
              boardId={board.id}
              pins={board.pins}
              selectedPinId={selectedPinId}
              onPinSelect={setSelectedPinId}
              canEdit={canEdit}
            />
          </div>
        )}
      </div>

      {/* Add Pin Sidebar */}
      <AddPinSidebar
        boardId={board.id}
        open={showAddPin}
        onOpenChange={setShowAddPin}
      />

      {/* Board Settings Sheet */}
      <BoardSettingsSheet
        board={board}
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
