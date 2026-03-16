import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useMessageMetrics } from "@/hooks/useMetrics"

const config = {
  totalMessages: { label: "消息总量", color: "var(--color-brand)" },
}

export function MessageChart({ days }: { days: number }) {
  const { data, isLoading } = useMessageMetrics(days)

  if (isLoading) return <Skeleton className="h-52 w-full" />

  return (
    <ChartContainer config={config} className="h-52">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={(v: string) => v.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <ChartTooltip />
        <Bar dataKey="totalMessages" fill="var(--color-brand)" radius={[3, 3, 0, 0]} name="消息总量" />
      </BarChart>
    </ChartContainer>
  )
}
