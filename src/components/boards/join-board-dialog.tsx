"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJoinByCode } from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JoinBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinBoardDialog({ open, onOpenChange }: JoinBoardDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const joinByCode = useJoinByCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) return;
    joinByCode.mutate(code.trim().toUpperCase(), {
      onSuccess: (board) => {
        onOpenChange(false);
        setCode("");
        setError("");
        router.push(`/board/${board.id}`);
      },
      onError: (err) => {
        setError(err.message || "Invalid invite code");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-paper border-paper-kraft">
        <DialogHeader>
          <DialogTitle className="font-handwriting text-2xl text-ink">join a board</DialogTitle>
          <DialogDescription className="text-ink-light">
            enter the invite code from your friend
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code" className="font-handwriting text-base text-ink-medium">invite code</Label>
            <Input
              id="invite-code"
              placeholder="e.g., ABC123"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={6}
              className="border-0 border-b-2 border-dashed border-paper-kraft bg-transparent rounded-none px-1 text-center font-handwriting text-2xl tracking-widest focus-visible:border-ink focus-visible:ring-0"
              required
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
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
              disabled={!code.trim() || joinByCode.isPending}
            >
              {joinByCode.isPending ? "joining..." : "join board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
