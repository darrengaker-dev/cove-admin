import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { DlpRule, DlpCategory, DlpSensitivity } from "@/types/dlp"

const CATEGORY_LABELS: Record<DlpCategory, string> = {
  identity:   "身份信息",
  financial:  "金融信息",
  credential: "密钥凭证",
  classified: "涉密信息",
  custom:     "自定义",
}

const SENSITIVITY_CONFIG: Record<DlpSensitivity, { label: string; className: string }> = {
  info:    { label: "提示",  className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300" },
  warning: { label: "警告",  className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300" },
  block:   { label: "拦截",  className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300" },
}

interface DlpRuleTableProps {
  data: DlpRule[]
  isLoading?: boolean
  onToggle: (id: string, enabled: boolean) => void
  onEdit: (rule: DlpRule) => void
  onDelete: (rule: DlpRule) => void
}

export function DlpRuleTable({ data, isLoading, onToggle, onEdit, onDelete }: DlpRuleTableProps) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {["规则名称", "分类", "匹配模式", "敏感等级", "命中次数", "状态", "操作"].map((h) => (
              <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">规则名称</TableHead>
          <TableHead className="w-24 whitespace-nowrap">分类</TableHead>
          <TableHead className="w-24 whitespace-nowrap">匹配模式</TableHead>
          <TableHead className="w-20 whitespace-nowrap">敏感等级</TableHead>
          <TableHead className="w-24 text-right whitespace-nowrap">命中次数</TableHead>
          <TableHead className="w-16 whitespace-nowrap">状态</TableHead>
          <TableHead className="w-20 whitespace-nowrap">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((rule) => {
          const sens = SENSITIVITY_CONFIG[rule.sensitivity]
          return (
            <TableRow key={rule.id} className={rule.isEnabled ? "" : "opacity-50"}>
              <TableCell>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    {rule.name}
                    {rule.type === "builtin" && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-muted-foreground">内置</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{rule.description}</div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{CATEGORY_LABELS[rule.category]}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs font-mono">
                  {rule.matchMode === "regex" ? "正则" : "关键词"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs ${sens.className}`}>{sens.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm tabular-nums">
                  {rule.matchCount > 0 ? (
                    <span className={rule.blockCount > 0 ? "text-destructive font-medium" : ""}>{rule.matchCount}</span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={rule.isEnabled}
                  onCheckedChange={(v) => onToggle(rule.id, v)}
                  className="scale-90"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onEdit(rule)}
                    disabled={rule.type === "builtin"}
                    title={rule.type === "builtin" ? "内置规则不可编辑" : "编辑"}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => onDelete(rule)}
                    disabled={rule.type === "builtin"}
                    title={rule.type === "builtin" ? "内置规则不可删除" : "删除"}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
