import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cloud, Database, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { SignInPrompt } from "../components/SignInPrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCloudRecords } from "../hooks/useQueries";
import { formatNanoTimestamp, intentMeta, truncate } from "../utils/format";

export function CloudPage() {
  const { identity } = useInternetIdentity();
  const { data: records, isLoading, refetch } = useCloudRecords();

  if (!identity) {
    return (
      <SignInPrompt
        icon={Cloud}
        title="Sign In to View Cloud Records"
        description="All synced transactions are stored here. Records appear after buffer data is flushed to the cloud database. Sign in to access them."
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-ocid="cloud.section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Cloud className="h-5 w-5 text-emerald-400" />
            Cloud Database
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Synced records stored in the cloud after buffer processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs text-emerald-400 font-medium">
              Connected
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border text-muted-foreground hover:text-foreground"
            onClick={() => void refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["hotel", "food", "finance", "ticket"] as const).map((cat) => {
          const count =
            records?.filter((r) => String(r.category) === cat).length ?? 0;
          const meta = intentMeta(cat as never);
          return (
            <Card key={cat} className="bg-card border-border shadow-card">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] text-muted-foreground capitalize">
                    {cat}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] border px-1.5 py-0 ${meta.color}`}
                  >
                    {meta.label}
                  </Badge>
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <div className="text-xl font-mono font-bold text-foreground">
                    {count}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              Cloud Records
              {!isLoading && (
                <Badge
                  variant="outline"
                  className="ml-auto text-xs border-border text-muted-foreground"
                >
                  {records?.length ?? 0} records
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div data-ocid="cloud.table">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground font-medium w-16">
                      ID
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium w-20">
                      Task ID
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Category
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Data
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Synced At
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                      <TableRow key={i} className="border-border">
                        {Array.from({ length: 5 }).map((__, j) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full max-w-[100px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : !records || records.length === 0 ? (
                    <TableRow className="border-0">
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center"
                        data-ocid="cloud.empty_state"
                      >
                        <Cloud className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No cloud records yet
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Records will appear after flushing the buffer
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record, i) => {
                      const catMeta = intentMeta(record.category);
                      return (
                        <TableRow
                          key={record.id.toString()}
                          data-ocid={`cloud.row.${i + 1}`}
                          className="border-border hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{record.id.toString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{record.taskId.toString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs border ${catMeta.color}`}
                            >
                              {catMeta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-foreground/80 max-w-[200px] truncate">
                            {truncate(record.data, 40)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatNanoTimestamp(record.syncedAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
