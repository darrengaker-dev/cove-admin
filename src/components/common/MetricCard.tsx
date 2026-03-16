import { TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { cn } from "@/lib/utils"
import { formatChangePercent, formatNumber } from "@/lib/format"

interface MetricCardProps {
  title: string
  value: number
  change?: number
  suffix?: string
  isLoading?: boolean
  tooltip?: string            // 指标说明（hover 展示）
  changeLabel?: string        // 默认"较昨日"，可改为"较上周"等
  formatter?: (v: number) => string  // 自定义数值格式化
}

export function MetricCard({
  title,
  value,
  change,
  suffix,
  isLoading,
  tooltip,
  changeLabel = "较昨日",
  formatter,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  const isPositive = (change ?? 0) >= 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1 text-muted-foreground text-sm font-medium">
          {title}
          {tooltip && <InfoTooltip text={tooltip} />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatter ? formatter(value) : formatNumber(value)}
          {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
        </div>
        {change !== undefined && (
          <div className={cn("mt-1 flex items-center gap-1 text-xs", isPositive ? "text-success" : "text-destructive")}>
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {formatChangePercent(change)} {changeLabel}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
