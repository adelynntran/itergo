"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardDetail, useUpdateBoardMode } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PinMap } from "@/components/pins/pin-map";
import { PinList } from "@/components/pins/pin-list";
import { AddPinSidebar } from "@/components/pins/add-pin-sidebar";
import { BoardSettingsSheet } from "@/components/boards/board-settings-sheet";
import {
  ArrowLeft,
  BookOpen,
  Cloud,
  Compass,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

type ViewMode = "dream" | "execution" | "travel" | "momento";
type BoardPin = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  notes: string | null;
};

const modeMeta: Record<ViewMode, { label: string; icon: React.ElementType; activeClass: string }> = {
  dream: {
    label: "Dream",
    icon: Cloud,
    activeClass: "bg-[hsl(var(--olive))]/15 text-[hsl(var(--olive))]",
  },
  execution: {
    label: "Execution",
    icon: MapIcon,
    activeClass: "bg-[hsl(var(--slate))]/15 text-[hsl(var(--slate))]",
  },
  travel: {
    label: "Travel",
    icon: Compass,
    activeClass: "bg-primary/15 text-primary",
  },
  momento: {
    label: "Momento",
    icon: BookOpen,
    activeClass: "bg-[hsl(var(--plum))]/15 text-[hsl(var(--plum))]",
  },
};

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showPinList, setShowPinList] = useState(true);
  const [showAddPin, setShowAddPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("dream");

  const { data: board, isLoading } = useBoardDetail(id);
  const updateBoardMode = useUpdateBoardMode();

  useEffect(() => {
    if (!board) return;
    if (board.boardMode === "execution" || board.boardMode === "travel") {
      setViewMode(board.boardMode);
    } else {
      setViewMode("dream");
    }
  }, [board]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

  const userRole = board.currentUserRole;
  const canEdit = userRole === "host" || userRole === "editor";

  const dayStops = useMemo<BoardPin[]>(
    () => (board.pins as BoardPin[]).slice(0, 6),
    [board.pins]
  );
  const momentoPins = useMemo<BoardPin[]>(
    () => (board.pins as BoardPin[]).slice(0, 8),
    [board.pins]
  );

  const changeMode = (nextMode: ViewMode) => {
    if (nextMode === "execution") {
      if (board.boardMode !== "execution" && canEdit) {
        updateBoardMode.mutate(
          { boardId: board.id, boardMode: "execution" },
          { onSuccess: () => setViewMode("execution") }
        );
      } else {
        setViewMode("execution");
      }
      return;
    }

    if (nextMode === "travel") {
      setViewMode("travel");
      return;
    }

    setViewMode(nextMode);
  };

  return (
    <div className="flex h-screen flex-col bg-background paper-texture">
      <div className="flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-3xl leading-none text-foreground">{board.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {board.description || "Collaborative trip planning"}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Users className="mr-1 h-3 w-3" />
            {board.members.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex justify-center border-b border-border px-4 py-3">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {(Object.keys(modeMeta) as ViewMode[]).map((mode) => {
            const Icon = modeMeta[mode].icon;
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => changeMode(mode)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all ${
                  active
                    ? `${modeMeta[mode].activeClass} shadow-sm`
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{modeMeta[mode].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === "dream" && (
          <div className="flex h-full overflow-hidden">
            <div className="flex-1">
              <PinMap
                pins={board.pins}
                selectedPinId={selectedPinId}
                onPinSelect={setSelectedPinId}
              />
            </div>

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

            <div className="absolute right-4 top-[132px] z-20 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPinList(!showPinList)}
                title={showPinList ? "Hide pin list" : "Show pin list"}
              >
                {showPinList ? <MapIcon className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              {canEdit && (
                <Button size="sm" onClick={() => setShowAddPin(true)}>
                  Add Place
                </Button>
              )}
            </div>
          </div>
        )}

        {viewMode === "execution" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="mb-6 flex items-start gap-4 rounded-xl border border-[hsl(var(--slate))]/20 bg-[hsl(var(--slate))]/5 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 text-[hsl(var(--slate))]" />
              <div>
                <p className="text-sm text-foreground">AI can help build your itinerary from Dream pins.</p>
                <p className="text-xs text-muted-foreground">Best dates by weather and budget, plus day-by-day route suggestions.</p>
              </div>
            </div>

            <h2 className="font-display text-3xl text-foreground">Execution Plan</h2>
            <p className="mb-4 text-sm text-muted-foreground">Day 1 draft itinerary from selected pins</p>

            <div className="space-y-3">
              {dayStops.map((pin, i) => (
                <div key={pin.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{String(8 + i * 2).padStart(2, "0")}:00</span>
                    <span>·</span>
                    <span>{i === dayStops.length - 1 ? "2h" : "1.5h"}</span>
                  </div>
                  <p className="mt-1 font-display text-2xl leading-none text-foreground">{pin.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{[pin.city, pin.country].filter(Boolean).join(", ") || pin.address || "Location"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "travel" && (
          <div className="mx-auto h-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-3xl text-foreground">Travel Day</h2>
                <p className="text-sm text-muted-foreground">Ready-to-go route checklist</p>
              </div>
              <Badge className="bg-primary/15 text-primary">Coming Soon</Badge>
            </div>

            <div className="space-y-3">
              {dayStops.map((pin, i) => (
                <div key={pin.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="w-10 rounded-full bg-primary/10 px-2 py-1 text-center text-sm text-primary">
                    {String(8 + i * 2).padStart(2, "0")}:00
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-2xl leading-none text-foreground">{pin.name}</p>
                    <p className="text-xs text-muted-foreground">{[pin.city, pin.country].filter(Boolean).join(", ") || pin.address || "Location"}</p>
                  </div>
                  <Button variant="outline" size="icon" title="Open in maps">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === "momento" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-3xl text-foreground">Momento</h2>
                <p className="text-sm text-muted-foreground">Turn your trip into a journal scrapbook.</p>
              </div>
              <Badge className="bg-[hsl(var(--plum))]/15 text-[hsl(var(--plum))]">Concept</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {momentoPins.map((pin, i) => (
                <div
                  key={pin.id}
                  className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-br p-4 ${
                    i % 2 === 0 ? "from-[#d9c9b5] to-[#cbb297]" : "from-[#c5d1de] to-[#a7b6c8]"
                  } ${i % 3 === 0 ? "md:row-span-2 min-h-[220px]" : "min-h-[140px]"}`}
                >
                  <p className="text-xs uppercase tracking-wide text-foreground/60">memory</p>
                  <p className="mt-2 font-display text-2xl leading-none text-foreground">{pin.name}</p>
                  <p className="mt-1 text-xs text-foreground/70">{pin.notes || "Add notes and photos to generate journal pages."}</p>
                  <MapPin className="absolute bottom-3 right-3 h-4 w-4 text-foreground/50" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddPinSidebar boardId={board.id} open={showAddPin} onOpenChange={setShowAddPin} />

      <BoardSettingsSheet board={board} open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
