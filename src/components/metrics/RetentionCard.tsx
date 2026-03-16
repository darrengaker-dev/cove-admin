import { useState } from "react"
import { Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useRetentionCohort } from "@/hooks/useMetrics"
import type { RetentionCohortType, RetentionPlatform } from "@/types/metrics"
import { cn } from "@/lib/utils"

// ─── colour helpers ───────────────────────────────────────────────────────────

function cellStyle(rate: number | null): React.CSSProperties {
  if (rate === null || rate <= 0) return {}
  const intensity = Math.min(rate / 65, 1) // 65% → full colour
  const alpha = 0.08 + intensity * 0.72
  return {
    backgroundColor: `rgba(66, 105, 225, ${alpha})`,
    color: intensity > 0.52 ? "white" : undefined,
  }
}

// ─── sub-components ───────────────────────────────────────────────────────────

interface ToggleGroupProps<T extends string> {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}
function ToggleGroup<T extends string>({ value, onChange, options }: ToggleGroupProps<T>) {
  return (
    <div className="flex rounded-md border overflow-hidden bg-muted/30 shrink-0">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "px-2.5 py-1 text-xs transition-colors",
            value === o.value
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function RetentionCell({
  rate,
  count,
  showCount,
}: {
  rate: number | null
  count: number | null
  showCount: boolean
}) {
  if (rate === null) {
    return (
      <td className="px-2 py-2.5 text-center text-muted-foreground/30 text-xs border-r border-border/40 last:border-r-0">
        —
      </td>
    )
  }
  const isZero = rate <= 0
  const style = cellStyle(rate)
  return (
    <td
      className="px-2 py-2.5 text-center border-r border-border/40 last:border-r-0 transition-colors"
      style={style}
    >
      <div
        className={cn(
          "text-xs font-semibold tabular-nums",
          isZero && "text-muted-foreground/40",
        )}
      >
        {rate.toFixed(2)}%
      </div>
      {showCount && count !== null && !isZero && (
        <div className="text-[10px] mt-0.5 opacity-75 tabular-nums">
          {count.toLocaleString()}
        </div>
      )}
    </td>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: RetentionCohortType; label: string }[] = [
  { value: "new_user",    label: "新用户留存" },
  { value: "active_user", label: "活跃用户留存" },
]

const PLATFORM_OPTIONS: { value: RetentionPlatform; label: string }[] = [
  { value: "all",     label: "全部"      },
  { value: "desktop", label: "桌面端"    },
  { value: "word",    label: "Word 插件"  },
  { value: "excel",   label: "Excel 插件" },
  { value: "ppt",     label: "PPT 插件"   },
  { value: "browser", label: "浏览器插件" },
]

const DAY_OPTIONS = [7, 14, 30]

export function RetentionCard() {
  const [days, setDays]               = useState(14)
  const [retentionType, setType]      = useState<RetentionCohortType>("new_user")
  const [platform, setPlatform]       = useState<RetentionPlatform>("all")
  const [showCount, setShowCount]     = useState(true)

  const { data, isLoading } = useRetentionCohort({ days, type: retentionType })

  return (
    <Card>
      <CardHeader className="pb-2 space-y-3">
        <CardTitle className="text-sm font-medium">用户留存</CardTitle>

        {/* ── filter bar ───────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {/* time range */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground shrink-0">时间</span>
            <div className="flex items-center gap-0.5 rounded-md border bg-muted/30 px-2 py-0.5">
              <span className="text-muted-foreground mr-1">最近</span>
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "px-1.5 py-0.5 rounded transition-colors",
                    days === d
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {d} 天
                </button>
              ))}
            </div>
          </div>

          {/* platform */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground shrink-0">终端</span>
            <ToggleGroup value={platform} onChange={setPlatform} options={PLATFORM_OPTIONS} />
          </div>

          {/* metric type */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground shrink-0">指标</span>
            <ToggleGroup value={retentionType} onChange={setType} options={TYPE_OPTIONS} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ── sub-header ──────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-b bg-muted/10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium">
              {retentionType === "new_user" ? "新用户留存" : "活跃用户留存"}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCount}
                onChange={(e) => setShowCount(e.target.checked)}
                className="rounded size-3 accent-primary"
              />
              显示用户数
            </label>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 text-muted-foreground">
            <Download className="size-3" />
            下载数据
          </Button>
        </div>

        {/* ── table ───────────────────────────────────── */}
        {isLoading ? (
          <div className="p-4 space-y-1.5">
            <Skeleton className="h-9 w-full" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : !data ? null : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm" style={{ minWidth: Math.max(560, 160 + (data.columns.length * 72)) }}>
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-r border-border/40 w-20 sticky left-0 bg-muted/30">
                    日期
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground border-r border-border/40 w-20">
                    新增人数
                  </th>
                  {data.columns.map((col) => (
                    <th
                      key={col}
                      className="px-2 py-2 text-center text-xs font-medium text-muted-foreground border-r border-border/40 last:border-r-0 min-w-[72px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* summary row */}
                <tr className="border-t border-b-2 border-b-border bg-muted/10 font-medium">
                  <td className="px-3 py-2.5 text-xs sticky left-0 bg-muted/10 border-r border-border/40">
                    {data.summary.date}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs tabular-nums border-r border-border/40">
                    {data.summary.newUsers.toLocaleString()}
                  </td>
                  {data.summary.retention.map((rate, i) => (
                    <RetentionCell
                      key={i}
                      rate={rate}
                      count={data.summary.retentionCounts[i]}
                      showCount={showCount}
                    />
                  ))}
                </tr>

                {/* per-date rows */}
                {data.rows.map((row, idx) => (
                  <tr
                    key={row.date}
                    className={cn(
                      "border-t hover:bg-muted/20 transition-colors",
                      idx % 2 === 1 && "bg-muted/5",
                    )}
                  >
                    <td className="px-3 py-2.5 text-xs text-muted-foreground sticky left-0 border-r border-border/40 bg-background">
                      {row.date}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs tabular-nums text-muted-foreground border-r border-border/40">
                      {row.newUsers.toLocaleString()}
                    </td>
                    {row.retention.map((rate, i) => (
                      <RetentionCell
                        key={i}
                        rate={rate}
                        count={row.retentionCounts[i]}
                        showCount={showCount}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
