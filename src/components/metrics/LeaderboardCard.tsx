import { Clock, Zap, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsageLeaderboard, useTokenLeaderboard, useToolLeaderboard } from "@/hooks/useMetrics"
import type { LeaderboardUser, ToolLeaderboardItem, ToolType } from "@/types/metrics"
import { cn } from "@/lib/utils"

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatValue(value: number, type: "usage" | "tokens"): string {
  if (type === "usage") {
    const h = Math.floor(value / 60)
    const m = value % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }
  // tokens
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

const RANK_COLORS: Record<number, string> = {
  1: "text-amber-500 font-bold",
  2: "text-zinc-400 font-bold",
  3: "text-orange-400 font-bold",
}

const TOOL_TYPE_CONFIG: Record<ToolType, { label: string; color: string }> = {
  skill:     { label: "技能",      color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  tool:      { label: "工具",      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  connector: { label: "连接器",    color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
}

// ─── skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRows({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-5 shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-14 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ─── User leaderboard (usage / tokens) ───────────────────────────────────────

function UserLeaderboardRows({
  data,
  type,
}: {
  data: LeaderboardUser[]
  type: "usage" | "tokens"
}) {
  return (
    <div className="divide-y divide-border/40">
      {data.map((item) => (
        <div
          key={item.userId}
          className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 transition-colors"
        >
          {/* rank */}
          <span
            className={cn(
              "w-5 shrink-0 text-center text-xs tabular-nums",
              RANK_COLORS[item.rank] ?? "text-muted-foreground",
            )}
          >
            {item.rank}
          </span>

          {/* avatar placeholder + name/email */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{item.displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{item.email}</p>
          </div>

          {/* value */}
          <span className="text-xs font-semibold tabular-nums shrink-0 text-foreground">
            {formatValue(item.value, type)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Tool leaderboard ─────────────────────────────────────────────────────────

function ToolLeaderboardRows({ data }: { data: ToolLeaderboardItem[] }) {
  return (
    <div className="divide-y divide-border/40">
      {data.map((item) => {
        const cfg = TOOL_TYPE_CONFIG[item.toolType]
        return (
          <div
            key={item.rank}
            className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 transition-colors"
          >
            {/* rank */}
            <span
              className={cn(
                "w-5 shrink-0 text-center text-xs tabular-nums",
                RANK_COLORS[item.rank] ?? "text-muted-foreground",
              )}
            >
              {item.rank}
            </span>

            {/* tool name + type badge */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className="text-xs font-medium truncate">{item.toolName}</span>
              <span
                className={cn(
                  "shrink-0 rounded px-1 py-0.5 text-[10px] font-medium",
                  cfg.color,
                )}
              >
                {cfg.label}
              </span>
            </div>

            {/* call count + users */}
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold tabular-nums">
                {item.callCount.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {item.userCount} 人
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── exported sub-cards ───────────────────────────────────────────────────────

export function UsageLeaderboardCard() {
  const { data, isLoading } = useUsageLeaderboard()

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
          <Clock className="size-3.5 text-muted-foreground" />
          使用时长榜单
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">按用户 · 本周累计时长</p>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonRows />
        ) : data ? (
          <UserLeaderboardRows data={data} type="usage" />
        ) : null}
      </CardContent>
    </Card>
  )
}

export function TokenLeaderboardCard() {
  const { data, isLoading } = useTokenLeaderboard()

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
          <Zap className="size-3.5 text-muted-foreground" />
          Token 消耗榜单
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">按用户 · 本周累计消耗</p>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonRows />
        ) : data ? (
          <UserLeaderboardRows data={data} type="tokens" />
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ToolLeaderboardCard() {
  const { data, isLoading } = useToolLeaderboard()

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium">
          <Wrench className="size-3.5 text-muted-foreground" />
          工具调用榜单
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">Skills / 工具 / 连接器综合排行</p>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonRows />
        ) : data ? (
          <ToolLeaderboardRows data={data} />
        ) : null}
      </CardContent>
    </Card>
  )
}
