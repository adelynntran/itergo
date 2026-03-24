"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBoard } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({
  open,
  onOpenChange,
}: CreateBoardDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const createBoard = useCreateBoard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createBoard.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: (board) => {
          onOpenChange(false);
          setName("");
          setDescription("");
          router.push(`/board/${board.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-paper border-paper-kraft">
        <DialogHeader>
          <DialogTitle className="font-handwriting text-2xl text-ink">new board</DialogTitle>
          <DialogDescription className="text-ink-light">
            start a new board to collect ideas with friends
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name" className="font-handwriting text-base text-ink-medium">name</Label>
            <Input
              id="board-name"
              placeholder="e.g., Scotland 2026, ramen crawl"
              className="border-0 border-b-2 border-dashed border-paper-kraft bg-transparent rounded-none px-1 focus-visible:border-ink focus-visible:ring-0"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="board-desc" className="font-handwriting text-base text-ink-medium">description (optional)</Label>
            <Textarea
              id="board-desc"
              placeholder="what's the vibe?"
              className="border-dashed border-paper-kraft bg-transparent focus-visible:border-ink focus-visible:ring-0"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-dashed"
              onClick={() => onOpenChange(false)}
            >
              cancel
            </Button>
            <Button
              type="submit"
              className="kraft-paper text-ink border-none"
              disabled={!name.trim() || createBoard.isPending}
            >
              {createBoard.isPending ? "creating..." : "create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
