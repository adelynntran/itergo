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
  Camera,
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
      <div className="flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Plan Card</p>
            <h1 className="font-display text-3xl leading-none text-foreground">{board.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {board.description || "Collaborative trip planning"}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2 bg-primary/12 text-primary">
            <Users className="mr-1 h-3 w-3" />
            {board.members.length}
          </Badge>
          <Badge variant="outline" className="hidden border-border bg-card/70 text-xs text-muted-foreground sm:inline-flex">
            Mode: {board.boardMode}
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
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm">
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
              <div className="w-96 border-l border-border bg-card/85 backdrop-blur">
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

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AI Journal Draft</p>
                <p className="font-display text-2xl leading-none text-foreground">From Pins to Memories</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload photos, add quick notes, and generate scrapbook pages per place.
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Camera className="mr-1.5 h-4 w-4" />
                Upload Media
              </Button>
            </div>

            {momentoPins.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
                <p className="font-display text-3xl text-foreground">No memories yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add places in Dream mode now, then return here to build your journal.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {momentoPins.map((pin, i) => (
                  <article
                    key={pin.id}
                    className={`relative rounded-2xl border border-border bg-card p-3 shadow-sm ${
                      i % 4 === 0
                        ? "-rotate-1"
                        : i % 4 === 1
                          ? "rotate-1"
                          : i % 4 === 2
                            ? "rotate-[0.5deg]"
                            : "-rotate-[0.5deg]"
                    }`}
                  >
                    <span
                      className={`absolute -top-2 left-6 h-4 w-16 rounded-sm ${
                        i % 3 === 0
                          ? "bg-[#dcc89f]/75"
                          : i % 3 === 1
                            ? "bg-[#c9d6e1]/75"
                            : "bg-[#d9b9ad]/75"
                      }`}
                    />

                    <div
                      className={`relative min-h-[170px] overflow-hidden rounded-xl border border-border ${
                        i % 2 === 0
                          ? "bg-gradient-to-br from-[#dfcfba] via-[#d5c1a8] to-[#c8b297]"
                          : "bg-gradient-to-br from-[#c7d3df] via-[#b7c7d8] to-[#9fb1c5]"
                      }`}
                    >
                      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_15%,#ffffff,transparent_40%),radial-gradient(circle_at_80%_85%,#fff4de,transparent_45%)]" />
                      <div className="relative flex h-full flex-col justify-between p-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-foreground/70">
                            {pin.city || "Travel"} {pin.country ? `· ${pin.country}` : ""}
                          </p>
                          <p className="mt-1 font-display text-3xl leading-none text-foreground">{pin.name}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-foreground/70">
                          <span>Journal Draft</span>
                          <MapPin className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm italic text-muted-foreground">
                      {pin.notes ? `"${pin.notes}"` : "Add your voice note or caption here, and AI will turn it into a journal story block."}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddPinSidebar boardId={board.id} open={showAddPin} onOpenChange={setShowAddPin} />

      <BoardSettingsSheet board={board} open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
