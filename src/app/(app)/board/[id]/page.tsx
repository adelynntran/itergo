"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardDetail } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PinMap } from "@/components/pins/pin-map";
import { PinList } from "@/components/pins/pin-list";
import { AddPinSidebar } from "@/components/pins/add-pin-sidebar";
import { BoardSettingsSheet } from "@/components/boards/board-settings-sheet";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  DollarSign,
  GripVertical,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Settings,
  Sparkles,
  Clock,
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
type TravelTab = "today" | "budget";
type ExpenseEntry = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  currency: string;
};

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showPinList, setShowPinList] = useState(true);
  const [showAddPin, setShowAddPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [travelTab, setTravelTab] = useState<TravelTab>("today");

  const { data: board, isLoading } = useBoardDetail(id);

  const boardPins = useMemo<BoardPin[]>(
    () => ((board?.pins ?? []) as BoardPin[]),
    [board?.pins]
  );
  const boardMembers = useMemo<any[]>(
    () => ((board?.members ?? []) as any[]),
    [board?.members]
  );
  const userRole = board?.currentUserRole;
  const canEdit = userRole === "host" || userRole === "editor";

  const dayStops = useMemo<BoardPin[]>(
    () => boardPins.slice(0, 6),
    [boardPins]
  );
  const momentoPins = useMemo<BoardPin[]>(
    () => boardPins.slice(0, 8),
    [boardPins]
  );
  const memberNames = useMemo<string[]>(() => {
    const names = boardMembers
      .map((member: any) => member.user?.name?.trim())
      .filter((name: string | undefined): name is string => Boolean(name));
    return names.length > 0 ? names : ["You"];
  }, [boardMembers]);
  const mockExpenses = useMemo<ExpenseEntry[]>(() => {
    if (dayStops.length === 0) return [];
    return dayStops.slice(0, 4).map((pin, i) => {
      const paidBy = memberNames[i % memberNames.length] ?? "You";
      const splitAmong = i % 2 === 0 ? memberNames : memberNames.slice(0, Math.min(2, memberNames.length));
      return {
        id: pin.id,
        description: pin.name,
        amount: 18 + i * 12,
        paidBy,
        splitAmong: splitAmong.length > 0 ? splitAmong : [paidBy],
        currency: "$",
      };
    });
  }, [dayStops, memberNames]);
  const balances = useMemo(() => {
    const next: Record<string, number> = {};
    memberNames.forEach((name) => {
      next[name] = 0;
    });
    mockExpenses.forEach((exp) => {
      const splitAmount = exp.amount / Math.max(1, exp.splitAmong.length);
      next[exp.paidBy] += exp.amount;
      exp.splitAmong.forEach((name) => {
        next[name] -= splitAmount;
      });
    });
    return next;
  }, [memberNames, mockExpenses]);
  const activeMode: ViewMode =
    board?.boardMode === "execution" || board?.boardMode === "travel"
      ? board.boardMode
      : "dream";

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

  const openPinDirections = (pin: BoardPin) => {
    const query = [pin.name, pin.address, pin.city, pin.country].filter(Boolean).join(", ");
    if (!query) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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

      <div className="flex-1 overflow-hidden">
        {activeMode === "dream" && (
          <div className="flex h-full overflow-hidden">
            <div className="flex-1">
              <PinMap
                pins={board.pins}
                selectedPinId={selectedPinId}
                onPinSelect={setSelectedPinId}
              />
            </div>

            {showPinList && (
              <div className="h-full w-96 overflow-hidden border-l border-border bg-card/85 backdrop-blur">
                <PinList
                  boardId={board.id}
                  pins={board.pins}
                  selectedPinId={selectedPinId}
                  onPinSelect={setSelectedPinId}
                  canEdit={canEdit}
                />
              </div>
            )}

            <div className="absolute left-4 top-[132px] z-20 flex gap-2">
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

        {activeMode === "execution" && (
          <div className="flex h-full flex-col lg:flex-row">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 flex items-start gap-4 rounded-xl border border-[hsl(var(--slate))]/20 bg-[hsl(var(--slate))]/5 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 text-[hsl(var(--slate))]" />
                <div>
                  <p className="text-sm text-foreground">AI can help build your itinerary from Dream pins.</p>
                  <p className="text-xs text-muted-foreground">Best dates by weather and budget, plus day-by-day route suggestions.</p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-3">
                  <Calendar className="h-4 w-4 text-[hsl(var(--slate))]" />
                  <p className="mt-1 text-xs text-muted-foreground">Dates</p>
                  <p className="font-display text-lg leading-none text-foreground">
                    {board.executionStartedAt
                      ? new Date(board.executionStartedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Flexible"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <Clock className="h-4 w-4 text-[hsl(var(--slate))]" />
                  <p className="mt-1 text-xs text-muted-foreground">Duration</p>
                  <p className="font-display text-lg leading-none text-foreground">
                    {Math.max(1, Math.ceil(dayStops.length / 3))} days
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <Users className="h-4 w-4 text-[hsl(var(--slate))]" />
                  <p className="mt-1 text-xs text-muted-foreground">Travelers</p>
                  <p className="font-display text-lg leading-none text-foreground">{memberNames.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <DollarSign className="h-4 w-4 text-[hsl(var(--slate))]" />
                  <p className="mt-1 text-xs text-muted-foreground">Budget</p>
                  <p className="font-display text-lg leading-none text-foreground">
                    ${mockExpenses.reduce((sum, item) => sum + item.amount, 0)}
                  </p>
                </div>
              </div>

              <h2 className="font-display text-3xl text-foreground">Itinerary</h2>
              <p className="mb-4 text-sm text-muted-foreground">Drag to reorder · Click to edit details</p>

              {dayStops.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
                  <p className="font-display text-2xl text-foreground">No stops yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add places in Dream mode, then move your plan card into execution.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayStops.map((pin, i) => (
                    <div key={pin.id} className="timeline-connector pl-6">
                      <div className="absolute left-0 top-5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[hsl(var(--slate))]/30 bg-background">
                        <Check className="h-2.5 w-2.5 text-[hsl(var(--sage))]" />
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                        <GripVertical className="mt-1 h-4 w-4 text-muted-foreground/40" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{String(8 + i * 2).padStart(2, "0")}:00</span>
                            <span>·</span>
                            <span>{i === dayStops.length - 1 ? "2h" : "1.5h"}</span>
                          </div>
                          <p className="mt-1 font-display text-2xl leading-none text-foreground">{pin.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[pin.city, pin.country].filter(Boolean).join(", ") || pin.address || "Location"}
                          </p>
                          {pin.notes && <p className="mt-2 text-xs italic text-muted-foreground">{pin.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden items-center justify-center border-l border-border bg-[hsl(var(--slate))]/6 lg:flex lg:w-[420px] xl:w-[500px]">
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
                  <MapPin className="h-7 w-7 text-[hsl(var(--slate))]" />
                </div>
                <p className="font-display text-2xl leading-none text-foreground">Route Map</p>
                <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                  Your day-by-day route will be plotted here with travel times between stops.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeMode === "travel" && (
          <div className="h-full overflow-y-auto">
            <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
              <div className="flex gap-1 px-6 pt-3">
                <button
                  onClick={() => setTravelTab("today")}
                  className={`rounded-t-lg px-4 py-2.5 text-sm transition-colors ${
                    travelTab === "today"
                      ? "border border-b-0 border-border bg-card text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Today&apos;s Plan
                </button>
                <button
                  onClick={() => setTravelTab("budget")}
                  className={`rounded-t-lg px-4 py-2.5 text-sm transition-colors ${
                    travelTab === "budget"
                      ? "border border-b-0 border-border bg-card text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Budget
                </button>
                <div className="ml-auto py-2">
                  <Badge className="bg-primary/15 text-primary">Coming Soon</Badge>
                </div>
              </div>
            </div>

            {travelTab === "today" ? (
              <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6">
                  <h2 className="font-display text-3xl text-foreground">Day 1</h2>
                  <p className="text-sm text-muted-foreground">{dayStops.length} stops planned</p>
                </div>

                <div className="space-y-3">
                  {dayStops.map((pin, i) => (
                    <div key={pin.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                      <div className="w-10 rounded-full bg-primary/10 px-2 py-1 text-center text-sm text-primary">
                        {String(8 + i * 2).padStart(2, "0")}:00
                      </div>
                      <div className="flex-1">
                        <p className="font-display text-2xl leading-none text-foreground">{pin.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[pin.city, pin.country].filter(Boolean).join(", ") || pin.address || "Location"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Open in Google Maps"
                        onClick={() => openPinDirections(pin)}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-6 w-full"
                  onClick={() => window.alert("Expense logging form is coming soon.")}
                >
                  <DollarSign className="mr-1.5 h-4 w-4" />
                  Quick Log Expense
                </Button>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-3xl text-foreground">Budget</h2>
                    <p className="text-sm text-muted-foreground">
                      Total: ${mockExpenses.reduce((sum, item) => sum + item.amount, 0)}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => window.alert("Add expense is coming soon.")}>
                    Add
                  </Button>
                </div>

                <div className="mb-6 rounded-xl border border-border bg-card p-4">
                  <h3 className="font-display text-lg leading-none text-foreground">Who owes whom</h3>
                  <div className="mt-3 space-y-2">
                    {Object.entries(balances).map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{name}</span>
                        <span className={amount >= 0 ? "text-[hsl(var(--sage))]" : "text-primary"}>
                          {amount >= 0 ? "+" : "-"}${Math.abs(amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {mockExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Paid by {expense.paidBy} · Split {expense.splitAmong.length} ways
                        </p>
                      </div>
                      <span className="text-sm text-foreground">
                        {expense.currency}
                        {expense.amount}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeMode === "momento" && (
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
