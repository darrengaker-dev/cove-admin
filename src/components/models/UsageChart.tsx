import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useModelUsage } from "@/hooks/useModels"

const config = {
  requestCount: { label: "请求数", color: "var(--color-brand)" },
}

export function UsageChart() {
  const [days, setDays] = useState(30)
  const { data, isLoading } = useModelUsage(days)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">用量趋势</h3>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="h-7 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">最近 7 天</SelectItem>
            <SelectItem value="30">最近 30 天</SelectItem>
            <SelectItem value="90">最近 90 天</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <ChartContainer config={config} className="h-40 w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="requestCount"
              stroke="var(--color-brand)"
              fill="var(--color-brand-muted)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  )
}
