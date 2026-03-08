import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, RefreshCw, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { IntentCategory } from "../backend.d";
import type { AutomationTask } from "../backend.d";
import { useCreateTask, useTasks } from "../hooks/useQueries";
import {
  formatNanoTimestamp,
  intentMeta,
  taskStatusMeta,
  truncate,
} from "../utils/format";

const CATEGORIES: IntentCategory[] = [
  IntentCategory.hotel,
  IntentCategory.food,
  IntentCategory.finance,
  IntentCategory.ticket,
];

function StatusBadge({ status }: { status: AutomationTask["status"] }) {
  const meta = taskStatusMeta(status);
  return (
    <Badge variant="outline" className={`text-xs border gap-1.5 ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </Badge>
  );
}

export function AutomationPage() {
  const { data: tasks, isLoading, refetch } = useTasks();
  const createTask = useCreateTask();
  const [tab, setTab] = useState("all");
  const [newCategory, setNewCategory] = useState<string>(IntentCategory.hotel);
  const [newPayload, setNewPayload] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered =
    tasks?.filter((t) => {
      if (tab === "all") return true;
      return String(t.category) === tab;
    }) ?? [];

  const handleCreate = async () => {
    if (!newPayload.trim()) {
      toast.error("Payload is required");
      return;
    }
    try {
      await createTask.mutateAsync({
        category: newCategory,
        payload: newPayload,
      });
      toast.success("Task created successfully");
      setNewPayload("");
      setDialogOpen(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  return (
    <div
      className="p-6 max-w-7xl mx-auto space-y-6"
      data-ocid="automation.section"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Automation Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor automated task processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border text-muted-foreground hover:text-foreground"
            onClick={() => void refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="automation.open_modal_button"
                size="sm"
                className="gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                variant="outline"
              >
                <Plus className="h-3.5 w-3.5" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="automation.dialog"
              className="bg-card border-border"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  Create Automation Task
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">Category</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger
                      data-ocid="automation.select"
                      className="bg-secondary/50 border-border"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {CATEGORIES.map((cat) => {
                        const meta = intentMeta(cat);
                        return (
                          <SelectItem key={cat} value={cat}>
                            <Badge
                              variant="outline"
                              className={`text-xs border ${meta.color}`}
                            >
                              {meta.label}
                            </Badge>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">Payload</Label>
                  <Input
                    data-ocid="automation.input"
                    value={newPayload}
                    onChange={(e) => setNewPayload(e.target.value)}
                    placeholder='e.g. {"hotel":"Taj","nights":3}'
                    className="bg-secondary/50 border-border font-mono text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    data-ocid="automation.cancel_button"
                    variant="outline"
                    className="border-border"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  data-ocid="automation.submit_button"
                  onClick={() => void handleCreate()}
                  disabled={createTask.isPending}
                  className="gap-2"
                >
                  {createTask.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs + Table */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList
          data-ocid="automation.tab"
          className="bg-secondary/50 border border-border mb-4"
        >
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value={IntentCategory.hotel}>Hotel</TabsTrigger>
          <TabsTrigger value={IntentCategory.food}>Food</TabsTrigger>
          <TabsTrigger value={IntentCategory.finance}>Finance</TabsTrigger>
          <TabsTrigger value={IntentCategory.ticket}>Ticket</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <div data-ocid="automation.table">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs text-muted-foreground font-medium w-20">
                      ID
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Category
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Payload
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Created At
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      User
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                      <TableRow key={i} className="border-border">
                        {Array.from({ length: 6 }).map((__, j) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full max-w-[100px]" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow className="border-0">
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center"
                        data-ocid="automation.empty_state"
                      >
                        <div className="text-sm text-muted-foreground">
                          No tasks found
                        </div>
                        <div className="text-xs text-muted-foreground/60 mt-1">
                          Create a task to get started
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((task, i) => {
                      const catMeta = intentMeta(task.category);
                      return (
                        <TableRow
                          key={task.id.toString()}
                          data-ocid={`automation.row.${i + 1}`}
                          className="border-border hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{task.id.toString()}
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
                            {task.payload}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={task.status} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatNanoTimestamp(task.createdAt)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {truncate(task.userId.toString())}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
