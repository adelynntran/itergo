import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  dreamBoards,
  boardMembers,
  pins,
  pinVotes,
  comments,
  commentReactions,
  pinMedia,
  locationsBin,
} from "@/server/db/schema";

export type User = InferSelectModel<typeof users>;
export type DreamBoard = InferSelectModel<typeof dreamBoards>;
export type BoardMember = InferSelectModel<typeof boardMembers>;
export type Pin = InferSelectModel<typeof pins>;
export type PinVote = InferSelectModel<typeof pinVotes>;
export type Comment = InferSelectModel<typeof comments>;
export type CommentReaction = InferSelectModel<typeof commentReactions>;
export type PinMedia = InferSelectModel<typeof pinMedia>;
export type LocationBinItem = InferSelectModel<typeof locationsBin>;

export type BoardRole = "host" | "editor" | "viewer";
export type VoteType = "upvote" | "heart" | "must_do";
export type PinCategory =
  | "food"
  | "nature"
  | "culture"
  | "nightlife"
  | "shopping"
  | "accommodation"
  | "activity"
  | "transport"
  | "other";
