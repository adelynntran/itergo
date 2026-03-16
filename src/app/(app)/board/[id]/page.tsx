"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardDetail } from "@/lib/api/hooks";
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
} from "lucide-react";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showPinList, setShowPinList] = useState(true);
  const [showAddPin, setShowAddPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const { data: board, isLoading } = useBoardDetail(id);

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

  const userRole = board.members.find(
    (m: any) => m.userId === board.createdBy
  )?.role;
  const canEdit = userRole === "host" || userRole === "editor";

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
            <h1 className="text-lg font-semibold text-gray-900">
              {board.name}
            </h1>
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
