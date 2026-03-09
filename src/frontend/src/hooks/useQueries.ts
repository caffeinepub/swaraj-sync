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
import { useInternetIdentity } from "./useInternetIdentity";

// ── Chat ────────────────────────────────────────────────────────────────────

export function useMessages() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getMessages();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not signed in");
      return actor.sendMessage(content);
    },
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
      // Auto-add the resulting task to the buffer
      if (task?.id !== undefined) {
        actor
          ?.addToBuffer(task.id)
          .then(() => {
            void queryClient.invalidateQueries({ queryKey: ["buffer"] });
          })
          .catch(() => {
            /* ignore */
          });
      }
    },
  });
}

// ── Automation ──────────────────────────────────────────────────────────────

export function useTasks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<AutomationTask[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getTasks();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
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
      if (!actor) throw new Error("Not signed in");
      return actor.createTask(category, payload);
    },
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics"] });
      // Auto-add to buffer
      if (task?.id !== undefined) {
        actor
          ?.addToBuffer(task.id)
          .then(() => {
            void queryClient.invalidateQueries({ queryKey: ["buffer"] });
          })
          .catch(() => {
            /* ignore */
          });
      }
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
  const { identity } = useInternetIdentity();
  return useQuery<BufferItem[]>({
    queryKey: ["buffer"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getBufferQueue();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 3000,
  });
}

export function useFlushBuffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not signed in");
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
  const { identity } = useInternetIdentity();
  return useQuery<CloudRecord[]>({
    queryKey: ["cloud"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        return await actor.getCloudRecords();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000,
  });
}

// ── Analytics ───────────────────────────────────────────────────────────────

const EMPTY_ANALYTICS: Analytics = {
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
};

export function useAnalytics() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor || !identity) return EMPTY_ANALYTICS;
      try {
        return await actor.getAnalytics();
      } catch {
        return EMPTY_ANALYTICS;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000,
  });
}

// ── Security ─────────────────────────────────────────────────────────────────

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor || !identity) return "guest" as UserRole;
      try {
        return await actor.getCallerUserRole();
      } catch {
        return "guest" as UserRole;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor || !identity) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
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

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: string;
      role: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const { Principal } = await import("@icp-sdk/core/principal");
      const p = Principal.fromText(principal);
      return actor.assignCallerUserRole(p, role as UserRole);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["callerRole"] });
      void queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}
