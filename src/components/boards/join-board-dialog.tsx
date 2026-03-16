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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Dream Board</DialogTitle>
          <DialogDescription>
            Enter the invite code shared by your friend
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              placeholder="e.g., ABC123"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={6}
              className="text-center text-lg tracking-widest"
              required
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!code.trim() || joinByCode.isPending}
            >
              {joinByCode.isPending ? "Joining..." : "Join Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
