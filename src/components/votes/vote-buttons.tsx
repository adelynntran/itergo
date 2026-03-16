"use client";

import { useSession } from "next-auth/react";
import { useVote } from "@/lib/api/hooks";
import { ThumbsUp, Heart, Star } from "lucide-react";

interface VoteButtonsProps {
  pinId: string;
  boardId: string;
  votes: Array<{ voteType: string; userId: string }>;
  compact?: boolean;
}

const voteConfig = [
  {
    type: "upvote" as const,
    icon: ThumbsUp,
    activeColor: "text-blue-600",
    hoverColor: "hover:text-blue-500",
  },
  {
    type: "heart" as const,
    icon: Heart,
    activeColor: "text-red-500",
    hoverColor: "hover:text-red-400",
  },
  {
    type: "must_do" as const,
    icon: Star,
    activeColor: "text-amber-500",
    hoverColor: "hover:text-amber-400",
  },
];

export function VoteButtons({ pinId, boardId, votes, compact }: VoteButtonsProps) {
  const { data: session } = useSession();

  const voteMutation = useVote();

  const userId = session?.user?.id;

  return (
    <div className="flex items-center gap-1">
      {voteConfig.map(({ type, icon: Icon, activeColor, hoverColor }) => {
        const count = votes.filter((v) => v.voteType === type).length;
        const hasVoted = userId
          ? votes.some((v) => v.voteType === type && v.userId === userId)
          : false;

        return (
          <button
            key={type}
            onClick={(e) => {
              e.stopPropagation();
              voteMutation.mutate({ pinId, voteType: type, boardId });
            }}
            disabled={voteMutation.isPending}
            className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs transition-colors ${
              hasVoted
                ? `${activeColor} bg-opacity-10`
                : `text-gray-400 ${hoverColor}`
            } ${compact ? "" : "px-2 py-1"}`}
            title={type.replace("_", " ")}
          >
            <Icon
              className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} ${
                hasVoted ? "fill-current" : ""
              }`}
            />
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
