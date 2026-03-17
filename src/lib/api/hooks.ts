"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { LocationBinItem } from "@/types";

// ============ Query Keys ============

export const queryKeys = {
  boards: ["boards"] as const,
  board: (id: string) => ["boards", id] as const,
  boardPins: (boardId: string) => ["boards", boardId, "pins"] as const,
  pinComments: (pinId: string) => ["pins", pinId, "comments"] as const,
  locationsBin: ["locations-bin"] as const,
};

// ============ Board Hooks ============

export function useBoards() {
  return useQuery({
    queryKey: queryKeys.boards,
    queryFn: () => apiFetch<any[]>("/api/boards"),
  });
}

export function useBoardDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.board(id),
    queryFn: () => apiFetch<any>(`/api/boards/${id}`),
    enabled: !!id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiFetch<any>("/api/boards", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) =>
      apiFetch<void>(`/api/boards/${boardId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
  });
}

export function useUpdateBoardMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      boardMode,
    }: {
      boardId: string;
      boardMode: "dream" | "execution" | "travel";
    }) =>
      apiFetch<{ id: string; boardMode: string }>(`/api/boards/${boardId}`, {
        method: "PATCH",
        body: JSON.stringify({ boardMode }),
      }),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    },
  });
}

export function useJoinByCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      apiFetch<any>("/api/boards/join", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
  });
}

export function useGenerateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) =>
      apiFetch<{ code: string; pin: string }>(`/api/boards/${boardId}/invite`, {
        method: "POST",
      }),
    onSuccess: (_, boardId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      userId,
      role,
    }: {
      boardId: string;
      userId: string;
      role: "editor" | "viewer";
    }) =>
      apiFetch<void>(`/api/boards/${boardId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ boardId, userId }: { boardId: string; userId: string }) =>
      apiFetch<void>(`/api/boards/${boardId}/members/${userId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    },
  });
}

// ============ Pin Hooks ============

export function useCreatePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      ...data
    }: {
      boardId: string;
      name: string;
      latitude?: number;
      longitude?: number;
      address?: string;
      city?: string;
      country?: string;
      category?: string;
      notes?: string;
      placeId?: string;
      sourceType?: string;
    }) =>
      apiFetch<any>(`/api/boards/${boardId}/pins`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    },
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pinId,
      voteType,
    }: {
      pinId: string;
      voteType: "upvote" | "heart" | "must_do";
      boardId: string; // for cache invalidation
    }) =>
      apiFetch<{ action: "added" | "removed" }>(`/api/pins/${pinId}/vote`, {
        method: "POST",
        body: JSON.stringify({ voteType }),
      }),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
    },
  });
}

export function useDeletePin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pinId,
      action,
    }: {
      pinId: string;
      boardId: string;
      action: "delete" | "move_to_bin";
    }) =>
      apiFetch<void>(`/api/pins/${pinId}`, {
        method: "DELETE",
        body: JSON.stringify({ action }),
      }),
    onSuccess: (_, { boardId, action }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.board(boardId) });
      if (action === "move_to_bin") {
        queryClient.invalidateQueries({ queryKey: queryKeys.locationsBin });
      }
    },
  });
}

export function useLocationsBin() {
  return useQuery({
    queryKey: queryKeys.locationsBin,
    queryFn: () => apiFetch<LocationBinItem[]>("/api/locations-bin"),
  });
}

export function useRestoreLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      targetPlanCardId,
    }: {
      itemId: string;
      targetPlanCardId: string;
    }) =>
      apiFetch<{ id: string }>(`/api/locations-bin/${itemId}/restore`, {
        method: "POST",
        body: JSON.stringify({ targetPlanCardId }),
      }),
    onSuccess: (_, { targetPlanCardId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locationsBin });
      queryClient.invalidateQueries({
        queryKey: queryKeys.board(targetPlanCardId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
  });
}

export function useDeleteLocationBinItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch<void>(`/api/locations-bin/${itemId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locationsBin });
    },
  });
}
