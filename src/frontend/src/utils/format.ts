import { BufferStatus, IntentCategory, TaskStatus } from "../backend.d";

/** Convert nanosecond bigint timestamp to a readable date string */
export function formatNanoTimestamp(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  if (ms <= 0) return "—";
  const d = new Date(ms);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Short time-only */
export function formatNanoTime(ns: bigint): string {
  const ms = Number(ns / BigInt(1_000_000));
  if (ms <= 0) return "—";
  const d = new Date(ms);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Intent label + color class */
export function intentMeta(intent: IntentCategory): {
  label: string;
  color: string;
} {
  const map: Record<IntentCategory, { label: string; color: string }> = {
    [IntentCategory.hotel]: {
      label: "Hotel",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    [IntentCategory.food]: {
      label: "Food",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    [IntentCategory.finance]: {
      label: "Finance",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    [IntentCategory.ticket]: {
      label: "Ticket",
      color: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    [IntentCategory.unknown_]: {
      label: "Unknown",
      color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
    },
  };
  return (
    map[intent] ?? {
      label: String(intent),
      color: "bg-zinc-500/20 text-zinc-400",
    }
  );
}

/** Task status label + color */
export function taskStatusMeta(status: TaskStatus): {
  label: string;
  color: string;
  dot: string;
} {
  const map: Record<TaskStatus, { label: string; color: string; dot: string }> =
    {
      [TaskStatus.pending]: {
        label: "Pending",
        color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        dot: "bg-amber-400",
      },
      [TaskStatus.processing]: {
        label: "Processing",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        dot: "bg-blue-400",
      },
      [TaskStatus.done]: {
        label: "Done",
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        dot: "bg-emerald-400",
      },
      [TaskStatus.failed]: {
        label: "Failed",
        color: "bg-red-500/20 text-red-300 border-red-500/40",
        dot: "bg-red-400",
      },
    };
  return (
    map[status] ?? {
      label: String(status),
      color: "bg-zinc-500/20 text-zinc-400",
      dot: "bg-zinc-400",
    }
  );
}

/** Buffer status meta */
export function bufferStatusMeta(status: BufferStatus): {
  label: string;
  color: string;
} {
  const map: Record<BufferStatus, { label: string; color: string }> = {
    [BufferStatus.queued]: {
      label: "Queued",
      color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    [BufferStatus.flushing]: {
      label: "Flushing",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    [BufferStatus.synced]: {
      label: "Synced",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    [BufferStatus.failed]: {
      label: "Failed",
      color: "bg-red-500/20 text-red-300 border-red-500/40",
    },
  };
  return (
    map[status] ?? {
      label: String(status),
      color: "bg-zinc-500/20 text-zinc-400",
    }
  );
}

/** Truncate a principal or long string for display */
export function truncate(str: string, len = 14): string {
  if (str.length <= len) return str;
  return `${str.slice(0, len)}…`;
}
