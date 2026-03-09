import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  BarChart3,
  Cloud,
  DollarSign,
  Hotel,
  MessageSquare,
  Ticket,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { SignInPrompt } from "../components/SignInPrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAnalytics } from "../hooks/useQueries";

export function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: analytics, isLoading } = useAnalytics();

  if (!identity) {
    return (
      <SignInPrompt
        icon={BarChart3}
        title="Sign In to View Analytics"
        description="See real-time metrics: total tasks, messages, buffer size, sync count, and task breakdown by category. Sign in to access your dashboard."
      />
    );
  }

  const successRate = analytics
    ? Math.min(100, Number(analytics.successRate))
    : 0;

  const statCards = [
    {
      label: "Total Tasks",
      value: analytics?.totalTasks?.toString() ?? "0",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10 border-amber-400/20",
      trend: "+12%",
    },
    {
      label: "Total Messages",
      value: analytics?.totalMessages?.toString() ?? "0",
      icon: MessageSquare,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
      trend: "+8%",
    },
    {
      label: "Buffer Size",
      value: analytics?.bufferSize?.toString() ?? "0",
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10 border-cyan-400/20",
      trend: null,
    },
    {
      label: "Synced Count",
      value: analytics?.syncedCount?.toString() ?? "0",
      icon: Cloud,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
      trend: "+5%",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      color:
        successRate >= 80
          ? "text-emerald-400"
          : successRate >= 50
            ? "text-amber-400"
            : "text-red-400",
      bg:
        successRate >= 80
          ? "bg-emerald-400/10 border-emerald-400/20"
          : "bg-amber-400/10 border-amber-400/20",
      trend: null,
    },
  ];

  const categoryData = [
    {
      label: "Hotel",
      icon: Hotel,
      value: analytics?.tasksByCategory?.hotel ?? BigInt(0),
      color: "bg-blue-500",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/40",
      bg: "bg-blue-400/10",
    },
    {
      label: "Food",
      icon: Utensils,
      value: analytics?.tasksByCategory?.food ?? BigInt(0),
      color: "bg-amber-500",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/40",
      bg: "bg-amber-400/10",
    },
    {
      label: "Finance",
      icon: DollarSign,
      value: analytics?.tasksByCategory?.finance ?? BigInt(0),
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/40",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Ticket",
      icon: Ticket,
      value: analytics?.tasksByCategory?.ticket ?? BigInt(0),
      color: "bg-purple-500",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/40",
      bg: "bg-purple-400/10",
    },
  ];

  const totalCategoryTasks = categoryData.reduce(
    (sum, c) => sum + Number(c.value),
    0,
  );

  return (
    <div
      className="p-6 max-w-6xl mx-auto space-y-8"
      data-ocid="dashboard.section"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform performance metrics and task distribution
        </p>
      </motion.div>

      {/* Stat cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        data-ocid="dashboard.card"
      >
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
            >
              <Card className="bg-card border-border shadow-card hover:shadow-glow transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-muted-foreground font-medium leading-tight">
                      {stat.label}
                    </span>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border ${stat.bg}`}
                    >
                      <Icon className={`h-3 w-3 ${stat.color}`} />
                    </div>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-7 w-14" />
                  ) : (
                    <div
                      className={`text-xl font-mono font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </div>
                  )}
                  {stat.trend && !isLoading && (
                    <div className="text-[10px] text-emerald-400 mt-1 font-medium">
                      {stat.trend} this week
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Success Rate Progress */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Task completion success rate
              </span>
              {isLoading ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                <span
                  className={`text-sm font-mono font-bold ${
                    successRate >= 80
                      ? "text-emerald-400"
                      : successRate >= 50
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {successRate}%
                </span>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-2.5 w-full rounded-full" />
            ) : (
              <Progress value={successRate} className="h-2.5 bg-secondary/50" />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Tasks by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {categoryData.map((cat, i) => {
                const Icon = cat.icon;
                const count = Number(cat.value);
                const pct =
                  totalCategoryTasks > 0
                    ? Math.round((count / totalCategoryTasks) * 100)
                    : 0;

                return (
                  <motion.div
                    key={cat.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border ${cat.borderColor} ${cat.bg}`}
                        >
                          <Icon className={`h-3 w-3 ${cat.textColor}`} />
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLoading ? (
                          <Skeleton className="h-4 w-12" />
                        ) : (
                          <>
                            <span
                              className={`text-xs font-mono font-bold ${cat.textColor}`}
                            >
                              {count}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({pct}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-2 w-full rounded-full" />
                    ) : (
                      <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.6,
                            delay: 0.5 + i * 0.06,
                            ease: "easeOut",
                          }}
                          className={`h-full rounded-full ${cat.color}`}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
