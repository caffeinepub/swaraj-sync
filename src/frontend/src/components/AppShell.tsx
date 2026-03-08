import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Cloud,
  Database,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  User,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerRole } from "../hooks/useQueries";

export type Page =
  | "overview"
  | "chat"
  | "automation"
  | "buffer"
  | "cloud"
  | "dashboard"
  | "security";

const NAV_ITEMS: {
  id: Page;
  label: string;
  icon: React.ElementType;
  badge?: string;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "chat", label: "AI Chatbot", icon: MessageSquare },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "buffer", label: "Buffer Queue", icon: Activity },
  { id: "cloud", label: "Cloud DB", icon: Cloud },
  { id: "dashboard", label: "Analytics", icon: BarChart3 },
  { id: "security", label: "Security", icon: ShieldCheck },
];

interface AppShellProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { data: role } = useCallerRole();

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 10)}…`
    : null;

  const roleLabel = role ?? "guest";

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-accent/20 text-accent border-accent/40",
    user: "bg-primary/20 text-primary border-primary/40",
    guest: "bg-muted/40 text-muted-foreground border-border",
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo/Brand */}
        <div className="flex h-14 items-center gap-2.5 px-5 border-b border-sidebar-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 border border-primary/40">
            <Database className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-display font-semibold text-sm tracking-wide text-sidebar-foreground">
            Swaraj<span className="text-primary">-</span>Sync
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    data-ocid={`nav.${item.id}.link`}
                    onClick={() => {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User panel */}
        <div className="p-3">
          {identity ? (
            <div className="rounded-md bg-sidebar-accent/50 border border-sidebar-border p-2.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 shrink-0">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono text-muted-foreground truncate">
                    {principalShort}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize border",
                    roleBadgeColor[roleLabel] ?? roleBadgeColor.guest,
                  )}
                >
                  {roleLabel}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                  onClick={clear}
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full gap-2 text-sm"
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
            >
              <LogIn className="h-3.5 w-3.5" />
              {isLoggingIn ? "Connecting…" : "Sign In"}
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 text-[10px] text-muted-foreground/50 text-center border-t border-sidebar-border">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-muted-foreground transition-colors"
          >
            Built with caffeine.ai
          </a>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm text-foreground hidden sm:block">
              {NAV_ITEMS.find((n) => n.id === activePage)?.label}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="text-xs text-emerald-400 font-medium">Live</span>
            </div>
            <Badge
              variant="outline"
              className="text-xs capitalize border hidden sm:inline-flex"
              style={{ borderColor: "oklch(var(--primary) / 0.4)" }}
            >
              {roleLabel}
            </Badge>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
