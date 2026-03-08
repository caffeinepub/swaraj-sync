import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Analytics,
  AutomationTask,
  BufferItem,
  ChatMessage,
  CloudRecord,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Chat ────────────────────────────────────────────────────────────────────

export function useMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// ── Automation ──────────────────────────────────────────────────────────────

export function useTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<AutomationTask[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      payload,
    }: {
      category: string;
      payload: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTask(category, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: bigint;
      status: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTaskStatus(taskId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ── Buffer ──────────────────────────────────────────────────────────────────

export function useBufferQueue() {
  const { actor, isFetching } = useActor();
  return useQuery<BufferItem[]>({
    queryKey: ["buffer"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBufferQueue();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useFlushBuffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.flushBuffer();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["buffer"] });
      void queryClient.invalidateQueries({ queryKey: ["cloud"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// ── Cloud ───────────────────────────────────────────────────────────────────

export function useCloudRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<CloudRecord[]>({
    queryKey: ["cloud"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCloudRecords();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

// ── Analytics ───────────────────────────────────────────────────────────────

export function useAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) {
        return {
          totalTasks: BigInt(0),
          successRate: BigInt(0),
          totalMessages: BigInt(0),
          bufferSize: BigInt(0),
          tasksByCategory: {
            ticket: BigInt(0),
            finance: BigInt(0),
            hotel: BigInt(0),
            food: BigInt(0),
          },
          syncedCount: BigInt(0),
        } satisfies Analytics;
      }
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

// ── Security ─────────────────────────────────────────────────────────────────

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePingExternalService() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("No actor");
      return actor.pingExternalService(url);
    },
  });
}
