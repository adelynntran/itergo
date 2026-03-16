"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGenerateInvite,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/lib/api/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Check, Crown, Edit3, Eye, UserMinus } from "lucide-react";

interface BoardSettingsSheetProps {
  board: {
    id: string;
    name: string;
    inviteCode: string | null;
    invitePin: string | null;
    members: Array<{
      id: string;
      userId: string;
      role: string;
      user: {
        id: string;
        displayName: string;
        avatarUrl: string | null;
        email: string;
      };
    }>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleIcons: Record<string, React.ReactNode> = {
  host: <Crown className="h-3 w-3" />,
  editor: <Edit3 className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

export function BoardSettingsSheet({
  board,
  open,
  onOpenChange,
}: BoardSettingsSheetProps) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  const currentUserId = session?.user?.id;
  const isHost = board.members.some(
    (m) => m.userId === currentUserId && m.role === "host"
  );

  const generateInvite = useGenerateInvite();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const copyInviteCode = () => {
    if (board.inviteCode) {
      navigator.clipboard.writeText(board.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle>Board Settings</SheetTitle>
          <SheetDescription>
            Manage members and invite settings for &ldquo;{board.name}&rdquo;
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Invite Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Invite Friends</Label>
            {board.inviteCode ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={board.inviteCode}
                    readOnly
                    className="text-center font-mono text-lg tracking-widest"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyInviteCode}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {board.invitePin && (
                  <p className="text-xs text-gray-500">
                    PIN: <span className="font-mono">{board.invitePin}</span>
                  </p>
                )}
                {isHost && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateInvite.mutate(board.id)}
                    disabled={generateInvite.isPending}
                  >
                    Regenerate Code
                  </Button>
                )}
              </div>
            ) : (
              isHost && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateInvite.mutate(board.id)}
                >
                  Generate Invite Code
                </Button>
              )
            )}
          </div>

          <Separator />

          {/* Members Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Members ({board.members.length})
            </Label>
            <div className="space-y-2">
              {board.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border p-2.5"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={member.user.avatarUrl ?? undefined}
                    />
                    <AvatarFallback className="text-xs">
                      {member.user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.user.displayName}
                      {member.userId === currentUserId && (
                        <span className="ml-1 text-xs text-gray-400">
                          (you)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {roleIcons[member.role]}
                      <span className="ml-1">{member.role}</span>
                    </Badge>
                    {isHost &&
                      member.userId !== currentUserId &&
                      member.role !== "host" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title={
                              member.role === "editor"
                                ? "Change to viewer"
                                : "Change to editor"
                            }
                            onClick={() =>
                              updateRole.mutate({
                                boardId: board.id,
                                userId: member.userId,
                                role:
                                  member.role === "editor"
                                    ? "viewer"
                                    : "editor",
                              })
                            }
                          >
                            {member.role === "editor" ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <Edit3 className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-600"
                            title="Remove member"
                            onClick={() =>
                              removeMember.mutate({
                                boardId: board.id,
                                userId: member.userId,
                              })
                            }
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
