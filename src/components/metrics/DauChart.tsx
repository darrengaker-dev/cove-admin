import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useDauMetrics } from "@/hooks/useMetrics"
import { cn } from "@/lib/utils"

type PlatformKey = "all" | "desktop" | "word" | "excel" | "ppt" | "browser"

const PLATFORM_OPTIONS: { value: PlatformKey; label: string }[] = [
  { value: "all",     label: "全部"     },
  { value: "desktop", label: "桌面端"   },
  { value: "word",    label: "Word 插件" },
  { value: "excel",   label: "Excel 插件"},
  { value: "ppt",     label: "PPT 插件"  },
  { value: "browser", label: "浏览器插件"},
]

const chartConfig = {
  wau:      { label: "周活用户 WAU", color: "var(--color-brand)"   },
  newUsers: { label: "新用户",       color: "var(--color-success)" },
}

export function DauChart({ days }: { days: number }) {
  const [platform, setPlatform] = useState<PlatformKey>("all")
  const { data, isLoading } = useDauMetrics(days)

  if (isLoading) return <Skeleton className="h-52 w-full" />

  const chartData = data?.map((d) => {
    if (platform === "all") {
      return { date: d.date, wau: d.wau, newUsers: d.newUsers }
    }
    // 按平台 DAU 占比换算平台 WAU
    const platformDau = d[platform as keyof typeof d] as number
    const platformWau = d.dau > 0 ? Math.round((platformDau / d.dau) * d.wau) : 0
    return { date: d.date, wau: platformWau, newUsers: undefined }
  })

  const wauLabel = platform === "all"
    ? "周活用户 WAU"
    : (PLATFORM_OPTIONS.find((p) => p.value === platform)?.label ?? "") + " WAU"

  return (
    <div className="space-y-2">
      {/* Platform filter — 横向滚动防止折行 */}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 rounded-md border p-0.5 w-max bg-muted/30">
          {PLATFORM_OPTIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              className={cn(
                "whitespace-nowrap px-2.5 py-0.5 rounded text-[11px] transition-colors",
                platform === p.value
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-44 w-full">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <ChartTooltip />
          <Area
            type="monotone"
            dataKey="wau"
            stroke="var(--color-brand)"
            fill="var(--color-brand-muted)"
            strokeWidth={1.5}
            name={wauLabel}
          />
          {platform === "all" && (
            <Area
              type="monotone"
              dataKey="newUsers"
              stroke="var(--color-success)"
              fill="rgba(16,185,129,0.1)"
              strokeWidth={1.5}
              name="新用户"
            />
          )}
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
