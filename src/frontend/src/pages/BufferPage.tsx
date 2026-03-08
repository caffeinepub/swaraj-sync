import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Clock,
  Hash,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { BufferItem } from "../backend.d";
import { useBufferQueue, useFlushBuffer } from "../hooks/useQueries";
import { bufferStatusMeta, formatNanoTimestamp } from "../utils/format";

function BufferCard({ item, index }: { item: BufferItem; index: number }) {
  const meta = bufferStatusMeta(item.status);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      data-ocid={`buffer.item.${index + 1}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-border/70 hover:bg-secondary/20 transition-colors"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-400/10 border border-cyan-400/20">
        <Activity className="h-3.5 w-3.5 text-cyan-400" />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <div className="text-[10px] text-muted-foreground/60 mb-0.5">
            Buffer ID
          </div>
          <div className="font-mono text-xs text-foreground">
            <Hash className="h-2.5 w-2.5 inline mr-0.5 opacity-50" />
            {item.id.toString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground/60 mb-0.5">
            Task ID
          </div>
          <div className="font-mono text-xs text-foreground">
            <Hash className="h-2.5 w-2.5 inline mr-0.5 opacity-50" />
            {item.taskId.toString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground/60 mb-0.5">
            Retry Count
          </div>
          <div className="font-mono text-xs text-amber-400 font-medium">
            {item.retryCount.toString()}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground/60 mb-0.5">
            Queued At
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 opacity-60" />
            {formatNanoTimestamp(item.queuedAt)}
          </div>
        </div>
      </div>

      <Badge
        variant="outline"
        className={`text-xs border shrink-0 ${meta.color}`}
      >
        {meta.label}
      </Badge>
    </motion.div>
  );
}

export function BufferPage() {
  const { data: items, isLoading, refetch } = useBufferQueue();
  const flushBuffer = useFlushBuffer();
  const [isOnline, setIsOnline] = useState(true);
  const [lastFlushCount, setLastFlushCount] = useState<number | null>(null);

  const handleFlush = async () => {
    if (!isOnline) {
      toast.error("Cannot flush: system is offline");
      return;
    }
    try {
      const count = await flushBuffer.mutateAsync();
      const num = Number(count);
      setLastFlushCount(num);
      toast.success(
        `Buffer flushed: ${num} item${num !== 1 ? "s" : ""} synced`,
      );
    } catch {
      toast.error("Failed to flush buffer");
    }
  };

  const pendingCount =
    items?.filter(
      (i) => String(i.status) === "queued" || String(i.status) === "flushing",
    ).length ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" data-ocid="buffer.section">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Buffer Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Offline buffer management &amp; sync control
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Online/Offline Toggle */}
          <button
            type="button"
            onClick={() => setIsOnline((v) => !v)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              isOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {isOnline ? "Online" : "Offline"}
          </button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border text-muted-foreground hover:text-foreground"
            onClick={() => void refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Button
            data-ocid="buffer.flush_button"
            size="sm"
            className="gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
            variant="outline"
            onClick={() => void handleFlush()}
            disabled={flushBuffer.isPending || !isOnline}
          >
            {flushBuffer.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            Flush Buffer
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Items",
            value: items?.length?.toString() ?? "0",
            color: "text-cyan-400",
          },
          {
            label: "Pending",
            value: pendingCount.toString(),
            color: "text-amber-400",
          },
          {
            label: "Synced",
            value:
              items
                ?.filter((i) => String(i.status) === "synced")
                .length.toString() ?? "0",
            color: "text-emerald-400",
          },
          {
            label: "Failed",
            value:
              items
                ?.filter((i) => String(i.status) === "failed")
                .length.toString() ?? "0",
            color: "text-red-400",
          },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border shadow-card">
            <CardContent className="p-3">
              <div className="text-[10px] text-muted-foreground mb-1">
                {s.label}
              </div>
              {isLoading ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <div className={`text-xl font-mono font-bold ${s.color}`}>
                  {s.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last flush result */}
      <AnimatePresence>
        {lastFlushCount !== null && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center gap-2"
            data-ocid="buffer.success_state"
          >
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">
              Last flush synced {lastFlushCount} item
              {lastFlushCount !== 1 ? "s" : ""} to cloud
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buffer List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Buffer Items
            {!isLoading && (
              <Badge
                variant="outline"
                className="ml-auto text-xs border-border text-muted-foreground"
              >
                {items?.length ?? 0} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div data-ocid="buffer.list" className="space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))
            ) : !items || items.length === 0 ? (
              <div className="py-12 text-center" data-ocid="buffer.empty_state">
                <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Buffer is empty</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Items will appear here when tasks are queued
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <BufferCard key={item.id.toString()} item={item} index={i} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
