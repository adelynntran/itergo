"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardDetail, useUpdateBoardMode } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PinMap } from "@/components/pins/pin-map";
import { PinList } from "@/components/pins/pin-list";
import { AddPinSidebar } from "@/components/pins/add-pin-sidebar";
import { BoardSettingsSheet } from "@/components/boards/board-settings-sheet";
import {
  Plus,
  List,
  Map as MapIcon,
  ArrowLeft,
  Settings,
  Users,
  Cloud,
  Sparkles,
  Plane,
  BookOpen,
  Check,
} from "lucide-react";

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Board not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentMode = board.boardMode ?? "dream";
  const userRole = board.currentUserRole;
  const canEdit = userRole === "host" || userRole === "editor";

  // Momento mode: show the book interior
  if (currentMode === "momento") {
    return (
      <div className="flex h-screen flex-col">
        {/* Momento Header */}
        <div className="flex items-center justify-between border-b bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard?mode=momento")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-display text-lg font-semibold text-gray-900">
                {board.name}
              </h1>
              {board.description && (
                <p className="text-xs text-gray-500">{board.description}</p>
              )}
            </div>
            <Badge
              variant="secondary"
              className="ml-2 bg-amber-100 text-amber-800"
            >
              <BookOpen className="mr-1 h-3 w-3" />
              Momento
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Momento Content — Scrapbook placeholder */}
        <div className="flex-1 overflow-y-auto bg-amber-50/30 p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-gray-800">
                {board.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {board.pins.length} places visited
              </p>
            </div>

            {/* Scrapbook grid of pins as memory cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {board.pins.map((pin: any, i: number) => {
                const rotation = ((i % 5) - 2) * 1.2;
                const coverUrl =
                  pin.media?.[0]?.thumbnail ?? pin.media?.[0]?.url ?? null;
                const tapeColors = [
                  "bg-amber-200/70",
                  "bg-sky-200/70",
                  "bg-rose-200/70",
                  "bg-lime-200/70",
                  "bg-violet-200/70",
                ];

                return (
                  <div
                    key={pin.id}
                    className="rounded-lg bg-white p-4 shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* Decorative tape strip */}
                    <div
                      className={`mx-auto -mt-6 mb-3 h-3 w-12 rounded-sm ${tapeColors[i % tapeColors.length]}`}
                    />
                    {coverUrl && (
                      <img
                        src={coverUrl}
                        alt={pin.name}
                        className="mb-3 h-36 w-full rounded object-cover"
                        loading="lazy"
                      />
                    )}
                    <h3 className="font-display text-sm font-semibold text-gray-800">
                      {pin.name}
                    </h3>
                    {pin.city && (
                      <p className="text-xs text-gray-500">{pin.city}</p>
                    )}
                    {pin.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-gray-600 italic">
                        {pin.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {board.pins.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm">
                  No memories yet. Content creation coming soon!
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
      <div className="flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{board.name}</h1>
            {board.description && (
              <p className="text-xs text-gray-500">{board.description}</p>
            )}
          </div>
          <Badge variant="secondary" className="ml-2">
            <Users className="mr-1 h-3 w-3" />
            {board.members.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-md border bg-gray-50 p-1 sm:flex">
            <Button
              variant={currentMode === "dream" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              disabled
            >
              <Cloud className="mr-1 h-3 w-3" />
              Dream
            </Button>
            <Button
              variant={currentMode === "execution" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              disabled={
                !canEdit ||
                currentMode !== "dream" ||
                updateBoardMode.isPending
              }
              onClick={() =>
                updateBoardMode.mutate({
                  boardId: board.id,
                  boardMode: "execution",
                })
              }
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Execution
            </Button>
            <Button
              variant={currentMode === "travel" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              disabled={
                !canEdit ||
                currentMode !== "execution" ||
                updateBoardMode.isPending
              }
              onClick={() =>
                updateBoardMode.mutate({
                  boardId: board.id,
                  boardMode: "travel",
                })
              }
            >
              <Plane className="mr-1 h-3 w-3" />
              Travel
            </Button>
          </div>

          {/* Complete Trip button — only in travel mode */}
          {currentMode === "travel" && canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
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
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setShowAddPin(true)}>
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
          <div className="w-96 border-l bg-white">
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
