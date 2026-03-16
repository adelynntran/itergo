import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  jsonb,
  unique,
  primaryKey,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// USERS & AUTH
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  interestTags: text("interest_tags").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  boardMembers: many(boardMembers),
  pins: many(pins),
  pinVotes: many(pinVotes),
  comments: many(comments),
}));

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: bigint("expires_at", { mode: "number" }),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [unique().on(table.provider, table.providerAccountId)]
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").unique().notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

// ============================================================
// DREAM BOARDS
// ============================================================

export const dreamBoards = pgTable("dream_boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  visibility: text("visibility").notNull().default("group"),
  inviteCode: text("invite_code").unique(),
  invitePin: text("invite_pin"),
  status: text("status").notNull().default("active"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const dreamBoardsRelations = relations(dreamBoards, ({ one, many }) => ({
  creator: one(users, {
    fields: [dreamBoards.createdBy],
    references: [users.id],
  }),
  members: many(boardMembers),
  pins: many(pins),
}));

export const boardMembers = pgTable(
  "board_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => dreamBoards.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("viewer"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.boardId, table.userId)]
);

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  board: one(dreamBoards, {
    fields: [boardMembers.boardId],
    references: [dreamBoards.id],
  }),
  user: one(users, {
    fields: [boardMembers.userId],
    references: [users.id],
  }),
}));

// ============================================================
// PINS (PLACES)
// ============================================================

export const pins = pgTable("pins", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => dreamBoards.id, { onDelete: "cascade" }),
  addedBy: uuid("added_by")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  placeId: text("place_id"),
  category: text("category"),
  notes: text("notes"),
  sourceType: text("source_type").default("search"),
  sourceUrl: text("source_url"),
  sourceMeta: jsonb("source_meta").default({}),
  aiExtracted: boolean("ai_extracted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const pinsRelations = relations(pins, ({ one, many }) => ({
  board: one(dreamBoards, {
    fields: [pins.boardId],
    references: [dreamBoards.id],
  }),
  addedByUser: one(users, { fields: [pins.addedBy], references: [users.id] }),
  media: many(pinMedia),
  votes: many(pinVotes),
  comments: many(comments),
}));

export const pinMedia = pgTable("pin_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  pinId: uuid("pin_id")
    .notNull()
    .references(() => pins.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  url: text("url").notNull(),
  thumbnail: text("thumbnail"),
  caption: text("caption"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const pinMediaRelations = relations(pinMedia, ({ one }) => ({
  pin: one(pins, { fields: [pinMedia.pinId], references: [pins.id] }),
}));

// ============================================================
// VOTES, REACTIONS & COMMENTS
// ============================================================

export const pinVotes = pgTable(
  "pin_votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pinId: uuid("pin_id")
      .notNull()
      .references(() => pins.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    voteType: text("vote_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.pinId, table.userId, table.voteType)]
);

export const pinVotesRelations = relations(pinVotes, ({ one }) => ({
  pin: one(pins, { fields: [pinVotes.pinId], references: [pins.id] }),
  user: one(users, { fields: [pinVotes.userId], references: [users.id] }),
}));

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  pinId: uuid("pin_id")
    .notNull()
    .references(() => pins.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  parentId: uuid("parent_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  pin: one(pins, { fields: [comments.pinId], references: [pins.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, { relationName: "replies" }),
  reactions: many(commentReactions),
}));

export const commentReactions = pgTable(
  "comment_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.commentId, table.userId, table.emoji)]
);

export const commentReactionsRelations = relations(
  commentReactions,
  ({ one }) => ({
    comment: one(comments, {
      fields: [commentReactions.commentId],
      references: [comments.id],
    }),
    user: one(users, {
      fields: [commentReactions.userId],
      references: [users.id],
    }),
  })
);
