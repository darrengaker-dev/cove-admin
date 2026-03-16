import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusVariant =
  | "active" | "disabled" | "resigned"  // 新成员状态
  | "banned" | "pending"                 // 旧别名（保持兼容）
  | "success" | "failed" | "stable" | "beta"

const statusConfig: Record<StatusVariant, { label: string; className: string }> = {
  active:   { label: "在职",   className: "bg-success/10 text-success border-success/20" },
  disabled: { label: "已禁用", className: "bg-destructive/10 text-destructive border-destructive/20" },
  resigned: { label: "已离职", className: "bg-muted text-muted-foreground border-border" },
  // 旧别名
  banned:   { label: "已禁用", className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending:  { label: "待激活", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  // 版本状态
  success: { label: "成功",   className: "bg-success/10 text-success border-success/20" },
  failed:  { label: "失败",   className: "bg-destructive/10 text-destructive border-destructive/20" },
  stable:  { label: "稳定版", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  beta:    { label: "测试版", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as StatusVariant] ?? { label: status, className: "" }
  return (
    <Badge variant="outline" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  )
}
