import { TrendingUp, TrendingDown, Monitor, FileText, Table, Layers, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { useActiveUserMetrics } from "@/hooks/useMetrics"
import { cn } from "@/lib/utils"

function Trend({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", up ? "text-green-600" : "text-red-500")}>
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {up ? "+" : ""}{value.toFixed(1)}%
    </span>
  )
}

const METRIC_TOOLTIPS = {
  dau: "当日访问产品的去重用户数",
  wau: "一周内有 2 天及以上访问且完成一次以上对话的用户数",
  mau: "当月访问产品的去重用户数",
  stickiness: "WAU/MAU × 100%，反映用户周均活跃程度，优质产品通常 >50%",
}

const PLATFORMS = [
  { key: "desktop" as const, label: "桌面端",    Icon: Monitor,   bar: "bg-blue-500"    },
  { key: "word"    as const, label: "Word 插件",  Icon: FileText,  bar: "bg-indigo-500"  },
  { key: "excel"   as const, label: "Excel 插件", Icon: Table,     bar: "bg-emerald-500" },
  { key: "ppt"     as const, label: "PPT 插件",   Icon: Layers,    bar: "bg-orange-500"  },
  { key: "browser" as const, label: "浏览器插件", Icon: Globe,     bar: "bg-violet-500"  },
]

export function ActiveUsersCard() {
  const { data, isLoading } = useActiveUserMetrics()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">周活用户分布</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const stickinessGood = data.stickiness >= 50

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">周活用户分布</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* DAU / WAU / MAU */}
        <div className="grid grid-cols-3 gap-4">
          {/* DAU */}
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              日活 DAU <InfoTooltip text={METRIC_TOOLTIPS.dau} side="bottom" />
            </span>
            <span className="text-2xl font-bold tabular-nums">{data.dau.toLocaleString()}</span>
            <Trend value={data.dauChange} />
            <span className="text-[11px] text-muted-foreground mt-0.5">
              新增 <span className="font-semibold text-foreground tabular-nums">{data.newUsers}</span>
              <span className="ml-1 opacity-60">({data.newUserRatio.toFixed(1)}%)</span>
            </span>
          </div>

          {/* WAU */}
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              周活 WAU <InfoTooltip text={METRIC_TOOLTIPS.wau} side="bottom" />
            </span>
            <span className="text-2xl font-bold tabular-nums">{data.wau.toLocaleString()}</span>
            <Trend value={data.wauChange} />
          </div>

          {/* MAU */}
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              月活 MAU <InfoTooltip text={METRIC_TOOLTIPS.mau} side="bottom" />
            </span>
            <span className="text-2xl font-bold tabular-nums">{data.mau.toLocaleString()}</span>
            <Trend value={data.mauChange} />
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">今日终端分布</p>
          {PLATFORMS.map(({ key, label, Icon, bar }) => {
            const count = data.platforms[key]
            const pct = data.dau > 0 ? (count / data.dau) * 100 : 0
            return (
              <div key={key} className="flex items-center gap-2">
                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground w-[72px] shrink-0">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium tabular-nums w-8 text-right">{count}</span>
                <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">{pct.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>

        {/* Stickiness */}
        <div className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-xs",
          stickinessGood
            ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
            : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
        )}>
          <span className="flex items-center gap-1 font-medium">
            粘性指数 WAU/MAU
            <InfoTooltip text={METRIC_TOOLTIPS.stickiness} />
          </span>
          <span className="font-bold tabular-nums">{data.stickiness.toFixed(1)}%</span>
          <span className="opacity-70">{stickinessGood ? "良好 · >50%" : "偏低 · 建议 >50%"}</span>
        </div>
      </CardContent>
    </Card>
  )
}
