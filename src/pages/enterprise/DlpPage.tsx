import { useState, useCallback } from "react"
import { Plus, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { DlpRuleTable } from "@/components/dlp/DlpRuleTable"
import { DlpRuleDialog } from "@/components/dlp/DlpRuleDialog"
import { useDlpStats, useDlpRules, useCreateDlpRule, useUpdateDlpRule, useDeleteDlpRule } from "@/hooks/useDlp"
import type { DlpRule, DlpCategory, DlpSensitivity, CreateDlpRuleBody } from "@/types/dlp"

const CATEGORY_FILTER = [
  { value: "all",        label: "全部分类" },
  { value: "identity",   label: "身份信息" },
  { value: "financial",  label: "金融信息" },
  { value: "credential", label: "密钥凭证" },
  { value: "classified", label: "涉密信息" },
  { value: "custom",     label: "自定义" },
]

const SENSITIVITY_FILTER = [
  { value: "all",     label: "全部等级" },
  { value: "info",    label: "提示" },
  { value: "warning", label: "警告" },
  { value: "block",   label: "拦截" },
]

export function DlpPage() {
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sensitivityFilter, setSensitivityFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRule, setEditRule] = useState<DlpRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DlpRule | null>(null)

  const { data: stats } = useDlpStats()
  const { data: rules, isLoading } = useDlpRules({
    category:    categoryFilter !== "all" ? (categoryFilter as DlpCategory) : undefined,
    sensitivity: sensitivityFilter !== "all" ? (sensitivityFilter as DlpSensitivity) : undefined,
  })

  const createMutation = useCreateDlpRule()
  const updateMutation = useUpdateDlpRule()
  const deleteMutation = useDeleteDlpRule()

  const handleToggle = useCallback((id: string, enabled: boolean) => {
    updateMutation.mutate({ id, body: { isEnabled: enabled } })
  }, [updateMutation])

  const handleEdit = useCallback((rule: DlpRule) => {
    setEditRule(rule)
    setDialogOpen(true)
  }, [])

  const handleSubmit = (values: CreateDlpRuleBody) => {
    if (editRule) {
      updateMutation.mutate({ id: editRule.id, body: values }, { onSuccess: () => { setDialogOpen(false); setEditRule(null) } })
    } else {
      createMutation.mutate(values, { onSuccess: () => setDialogOpen(false) })
    }
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const statCards = [
    { icon: ShieldCheck,  label: "规则总数",   value: stats?.totalRules ?? 0,   className: "text-muted-foreground" },
    { icon: ShieldAlert,  label: "已启用",     value: stats?.enabledRules ?? 0,  className: "text-blue-600 dark:text-blue-400" },
    { icon: AlertTriangle,label: "今日警告",   value: stats?.todayWarned ?? 0,   className: "text-yellow-600 dark:text-yellow-400" },
    { icon: ShieldX,      label: "今日拦截",   value: stats?.todayBlocked ?? 0,  className: "text-destructive" },
  ]

  return (
    <div>
      <PageHeader
        title="DLP 敏感信息保护"
        description="自动识别并处理消息中的敏感信息，保障数据安全合规"
        actions={
          <Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditRule(null); setDialogOpen(true) }}>
            <Plus className="size-3.5" />
            新增规则
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {statCards.map(({ icon: Icon, label, value, className }) => (
            <div key={label} className="rounded-xl border p-4 flex items-center gap-3">
              <Icon className={`size-8 ${className}`} strokeWidth={1.5} />
              <div>
                <div className="text-2xl font-semibold tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_FILTER.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENSITIVITY_FILTER.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <DlpRuleTable
            data={rules ?? []}
            isLoading={isLoading}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
          />
        </div>

        {/* Footnote */}
        <p className="text-xs text-muted-foreground">
          内置规则仅支持启用/禁用。所有拦截和警告事件自动写入操作日志（安全合规 · content.flagged）。
        </p>
      </div>

      <DlpRuleDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditRule(null) }}
        editRule={editRule}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="删除规则"
        description={`确认删除自定义规则「${deleteTarget?.name}」？此操作不可恢复。`}
        confirmLabel="删除"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
