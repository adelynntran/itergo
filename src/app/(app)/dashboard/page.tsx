"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { BoardCard } from "@/components/boards/board-card";
import { CreateBoardDialog } from "@/components/boards/create-board-dialog";
import { JoinBoardDialog } from "@/components/boards/join-board-dialog";
import { Plus, CheckSquare, Trash2, UserPlus } from "lucide-react";

export default function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: boards, isLoading } = trpc.boards.list.useQuery();
  const utils = trpc.useUtils();

  const deleteBoard = trpc.boards.delete.useMutation({
    onSuccess: () => {
      utils.boards.list.invalidate();
      setSelected(new Set());
      setSelectMode(false);
    },
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    selected.forEach((id) => deleteBoard.mutate({ boardId: id }));
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dream Boards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Collect travel inspiration with your friends
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                disabled={selected.size === 0}
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
          )}
        </div>
      </div>

      {/* Board Grid */}
      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
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
            No dream boards yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first board to start collecting travel ideas
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
