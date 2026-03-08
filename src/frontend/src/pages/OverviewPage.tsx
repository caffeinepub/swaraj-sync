import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowRight,
  Cloud,
  Cpu,
  MessageSquare,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useAnalytics } from "../hooks/useQueries";

const ARCH_STEPS = [
  {
    icon: MessageSquare,
    label: "User Interface",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
  },
  {
    icon: Cpu,
    label: "AI Chatbot (NLP)",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/30",
  },
  {
    icon: Zap,
    label: "Automation Engine",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
  },
  {
    icon: Activity,
    label: "Buffer Layer",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/30",
  },
  {
    icon: Cloud,
    label: "Cloud Database",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/30",
  },
  {
    icon: ShieldCheck,
    label: "Isolation Security",
    color: "text-rose-400",
    bg: "bg-rose-400/10 border-rose-400/30",
  },
];

export function OverviewPage() {
  const { data: analytics, isLoading } = useAnalytics();

  const stats = [
    {
      label: "Total Tasks",
      value: analytics?.totalTasks?.toString() ?? "0",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "Total Messages",
      value: analytics?.totalMessages?.toString() ?? "0",
      icon: MessageSquare,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
    },
    {
      label: "Buffer Size",
      value: analytics?.bufferSize?.toString() ?? "0",
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10 border-cyan-400/20",
    },
    {
      label: "Synced Count",
      value: analytics?.syncedCount?.toString() ?? "0",
      icon: Cloud,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
    },
  ];

  return (
    <div
      className="p-6 max-w-6xl mx-auto space-y-8"
      data-ocid="overview.section"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time status of the Swaraj-Sync automation platform
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            >
              <Card className="bg-card border-border shadow-card hover:shadow-glow transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground font-medium">
                      {stat.label}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-md border ${stat.bg}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    </div>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <div
                      className={`text-2xl font-mono font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Architecture Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-card border-border overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              System Architecture Diagram
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full bg-muted/30">
              <img
                src="/assets/uploads/WhatsApp-Image-2026-03-05-at-11.23.03-PM-1.jpeg"
                alt="Swaraj-Sync System Architecture"
                className="w-full object-contain max-h-[480px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Architecture flow cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-display font-semibold text-foreground">
              Data Flow Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              {ARCH_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${step.bg}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${step.color}`} />
                      <span className={step.color}>{step.label}</span>
                    </motion.div>
                    {i < ARCH_STEPS.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
