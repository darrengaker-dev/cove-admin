import * as React from "react"
import {
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<string, { label: string; color?: string }>

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig
  children: React.ComponentProps<typeof ResponsiveContainer>["children"]
}

function ChartContainer({ config: _config, className, children, ...props }: ChartContainerProps) {
  return (
    <div className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

function ChartTooltip({ ...props }: TooltipProps<number, string>) {
  return (
    <Tooltip
      cursor={{ strokeDasharray: "3 3", stroke: "var(--color-border)" }}
      contentStyle={{
        background: "var(--color-popover)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        fontSize: "12px",
        color: "var(--color-foreground)",
      }}
      {...props}
    />
  )
}

export { ChartContainer, ChartTooltip }
