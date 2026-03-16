import { PieChart, Pie, Cell, Legend } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeatureUsage } from "@/hooks/useMetrics"

const COLORS = ["var(--color-brand)", "var(--color-success)", "var(--color-warning)", "#8b5cf6"]

const config = {
  count: { label: "使用次数" },
}

export function FeatureUsageChart() {
  const { data, isLoading } = useFeatureUsage()

  if (isLoading) return <Skeleton className="h-52 w-full" />

  return (
    <ChartContainer config={config} className="h-52">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={70}
          strokeWidth={0}
        >
          {data?.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip />
        <Legend
          formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
      </PieChart>
    </ChartContainer>
  )
}
