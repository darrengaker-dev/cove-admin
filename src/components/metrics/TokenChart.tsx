import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenMetrics } from "@/hooks/useMetrics"

const config = {
  totalTokens: { label: "Token 用量", color: "var(--color-warning)" },
}

function formatTokens(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

export function TokenChart({ days }: { days: number }) {
  const { data, isLoading } = useTokenMetrics(days)

  if (isLoading) return <Skeleton className="h-52 w-full" />

  return (
    <ChartContainer config={config} className="h-[208px] w-full">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatTokens}
        />
        <ChartTooltip formatter={(v: number) => [formatTokens(v), "Token 用量"]} />
        <Area
          type="monotone"
          dataKey="totalTokens"
          stroke="var(--color-warning)"
          fill="rgba(245,158,11,0.12)"
          strokeWidth={1.5}
          name="Token 用量"
        />
      </AreaChart>
    </ChartContainer>
  )
}
