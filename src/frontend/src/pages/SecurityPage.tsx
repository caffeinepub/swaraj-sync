import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertTriangle,
  Crown,
  Globe,
  Loader2,
  Lock,
  ShieldCheck,
  Terminal,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerRole,
  useIsAdmin,
  usePingExternalService,
} from "../hooks/useQueries";

const ROLE_META: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  admin: {
    label: "Administrator",
    color: "bg-accent/20 text-accent border-accent/40",
    icon: Crown,
  },
  user: {
    label: "Standard User",
    color: "bg-primary/20 text-primary border-primary/40",
    icon: User,
  },
  guest: {
    label: "Guest",
    color: "bg-muted/40 text-muted-foreground border-border",
    icon: User,
  },
};

export function SecurityPage() {
  const { data: role, isLoading: roleLoading } = useCallerRole();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const pingService = usePingExternalService();
  const { identity } = useInternetIdentity();

  const [pingUrl, setPingUrl] = useState("https://example.com");
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pingError, setPingError] = useState<string | null>(null);

  const roleKey = String(role ?? "guest");
  const meta = ROLE_META[roleKey] ?? ROLE_META.guest;
  const RoleIcon = meta.icon;
  const principal = identity?.getPrincipal().toString();

  const handlePing = async () => {
    setPingResult(null);
    setPingError(null);
    try {
      const result = await pingService.mutateAsync(pingUrl);
      setPingResult(result);
      toast.success("Ping successful");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ping failed";
      setPingError(msg);
      toast.error(msg);
    }
  };

  const isLoading = roleLoading || adminLoading;

  return (
    <div
      className="p-6 max-w-3xl mx-auto space-y-6"
      data-ocid="security.section"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-rose-400" />
          Isolation Security
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Role-based access control and isolated process security
        </p>
      </motion.div>

      {/* Current User Role */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Current Session
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${meta.color}`}
                  >
                    <RoleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-sm px-3 py-1 border ${meta.color} mb-1`}
                    >
                      {meta.label}
                    </Badge>
                    {principal && (
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        {principal}
                      </p>
                    )}
                    {!identity && (
                      <p className="text-xs text-muted-foreground">
                        Not authenticated — guest access
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/30 px-2.5 py-1">
                      <Crown className="h-3 w-3 text-accent" />
                      <span className="text-xs text-accent font-medium">
                        Admin Access
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Role Assignment — admin only */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                Role Management
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] border-accent/40 text-accent bg-accent/10"
                >
                  Admin Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <RoleAssignPanel />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Ping External Service — admin only */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" />
                External Service Ping
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] border-accent/40 text-accent bg-accent/10"
                >
                  Admin Only
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground">Service URL</Label>
                <div className="flex gap-2">
                  <Input
                    data-ocid="security.ping_input"
                    value={pingUrl}
                    onChange={(e) => setPingUrl(e.target.value)}
                    placeholder="https://api.example.com/health"
                    className="flex-1 bg-secondary/50 border-border font-mono text-sm"
                  />
                  <Button
                    data-ocid="security.ping_button"
                    onClick={() => void handlePing()}
                    disabled={pingService.isPending || !pingUrl.trim()}
                    variant="outline"
                    className="gap-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                  >
                    {pingService.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                    Ping
                  </Button>
                </div>
              </div>

              {pingResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  data-ocid="security.success_state"
                >
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">
                        Response
                      </span>
                    </div>
                    <pre className="text-xs font-mono text-emerald-300/80 whitespace-pre-wrap break-all">
                      {pingResult}
                    </pre>
                  </div>
                </motion.div>
              )}

              {pingError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  data-ocid="security.error_state"
                >
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Ping Failed</AlertTitle>
                    <AlertDescription className="text-xs font-mono">
                      {pingError}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Non-admin info */}
      {!isLoading && !isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="rounded-lg border border-border bg-muted/20 px-4 py-6 flex flex-col items-center text-center gap-3">
            <Lock className="h-8 w-8 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Admin Privileges Required
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Role assignment and external service testing are restricted to
                administrators.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function RoleAssignPanel() {
  const [targetPrincipal, setTargetPrincipal] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");

  const handleAssign = () => {
    if (!targetPrincipal.trim()) {
      toast.error("Principal ID is required");
      return;
    }
    toast.info(
      "Role assignment requires a valid principal — connect with the backend actor",
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm text-foreground">Principal ID</Label>
        <Input
          value={targetPrincipal}
          onChange={(e) => setTargetPrincipal(e.target.value)}
          placeholder="xxxxx-xxxxx-xxxxx-xxxxx-cai"
          className="bg-secondary/50 border-border font-mono text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm text-foreground">Assign Role</Label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger
            data-ocid="security.role_select"
            className="bg-secondary/50 border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="admin">
              <span className="flex items-center gap-2">
                <Crown className="h-3.5 w-3.5 text-accent" />
                Administrator
              </span>
            </SelectItem>
            <SelectItem value="user">
              <span className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                Standard User
              </span>
            </SelectItem>
            <SelectItem value="guest">
              <span className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Guest
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        data-ocid="security.submit_button"
        onClick={handleAssign}
        className="w-full gap-2"
        variant="outline"
      >
        <Crown className="h-3.5 w-3.5" />
        Assign Role
      </Button>
    </div>
  );
}
