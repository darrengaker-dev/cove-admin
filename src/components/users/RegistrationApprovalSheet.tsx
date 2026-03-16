import { useState } from "react"
import { Check, X, Settings2, Plus, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  usePendingRegistrations, useReviewRegistration, useBatchReviewRegistrations,
  useAutoApprovalRules, useCreateAutoApprovalRule, useUpdateAutoApprovalRule, useDeleteAutoApprovalRule,
} from "@/hooks/useRegistrations"
import type { AutoApprovalRuleType } from "@/types/user"
import { cn } from "@/lib/utils"

// ── 自动审批规则子弹窗 ────────────────────────────────────────
function AutoRulesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: rules = [], isLoading } = useAutoApprovalRules()
  const createMutation = useCreateAutoApprovalRule()
  const updateMutation = useUpdateAutoApprovalRule()
  const deleteMutation = useDeleteAutoApprovalRule()
  const [newType, setNewType] = useState<AutoApprovalRuleType>("email_domain")
  const [newValue, setNewValue] = useState("")
  const [newDesc, setNewDesc] = useState("")

  const handleAdd = () => {
    if (!newValue.trim()) return
    createMutation.mutate(
      { type: newType, value: newValue.trim(), description: newDesc.trim(), isEnabled: true },
      { onSuccess: () => { setNewValue(""); setNewDesc("") } }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>自动审批规则</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            符合以下规则的注册申请将自动通过，无需人工审批
          </p>
        </DialogHeader>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无规则</p>
          ) : rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30">
              <Badge variant="outline" className="text-xs shrink-0">
                {rule.type === "email_domain" ? "域名" : "前缀"}
              </Badge>
              <span className="text-sm font-mono flex-1">{rule.value}</span>
              {rule.description && (
                <span className="text-xs text-muted-foreground truncate max-w-24">{rule.description}</span>
              )}
              <Switch
                checked={rule.isEnabled}
                onCheckedChange={(v) => updateMutation.mutate({ id: rule.id, body: { isEnabled: v } })}
                className="scale-75"
              />
              <Button
                variant="ghost" size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteMutation.mutate(rule.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">添加新规则</p>
          <div className="flex items-center gap-2">
            <Select value={newType} onValueChange={(v) => setNewType(v as AutoApprovalRuleType)}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email_domain" className="text-xs">邮件域名</SelectItem>
                <SelectItem value="email_prefix" className="text-xs">邮件前缀</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={newType === "email_domain" ? "@example.com" : "name.prefix"}
              className="h-8 text-xs font-mono flex-1"
            />
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="备注（可选）"
              className="h-8 text-xs w-28"
            />
            <Button size="sm" className="h-8 gap-1 shrink-0" onClick={handleAdd} disabled={createMutation.isPending || !newValue.trim()}>
              <Plus className="size-3" />添加
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── 主注册审批 Sheet ──────────────────────────────────────────
interface RegistrationApprovalSheetProps {
  open: boolean
  onClose: () => void
}

export function RegistrationApprovalSheet({ open, onClose }: RegistrationApprovalSheetProps) {
  const { data: requests = [], isLoading } = usePendingRegistrations()
  const reviewMutation = useReviewRegistration()
  const batchMutation = useBatchReviewRegistrations()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rulesOpen, setRulesOpen] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(selected.size === requests.length ? new Set() : new Set(requests.map((r) => r.id)))
  }

  const handleBatch = (status: "approved" | "rejected") => {
    if (selected.size === 0) return
    batchMutation.mutate({ ids: Array.from(selected), status }, { onSuccess: () => setSelected(new Set()) })
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full max-w-3xl p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base">注册审批</SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  用户自助注册后需经管理员审批方可使用
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRulesOpen(true)}>
                <Settings2 className="size-3.5" />自动审批规则
              </Button>
            </div>
          </SheetHeader>

          {/* 批量操作栏 */}
          {selected.size > 0 && (
            <div className="px-6 py-2 bg-primary/5 border-b shrink-0 flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex-1">已选 {selected.size} 条</span>
              <Button
                size="sm" className="h-7 gap-1 text-xs bg-green-600 hover:bg-green-700"
                onClick={() => handleBatch("approved")} disabled={batchMutation.isPending}
              >
                <Check className="size-3" />批量通过
              </Button>
              <Button
                variant="outline" size="sm"
                className="h-7 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => handleBatch("rejected")} disabled={batchMutation.isPending}
              >
                <X className="size-3" />批量拒绝
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      checked={requests.length > 0 && selected.size === requests.length}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>申请人</TableHead>
                  <TableHead className="w-32">邮箱</TableHead>
                  <TableHead className="w-24">申请部门</TableHead>
                  <TableHead className="w-36">申请时间</TableHead>
                  <TableHead>申请说明</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-sm text-muted-foreground">
                      🎉 暂无待审批的注册申请
                    </TableCell>
                  </TableRow>
                ) : requests.map((req) => (
                  <TableRow key={req.id} className={cn(selected.has(req.id) && "bg-primary/5")}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(req.id)}
                        onChange={() => toggleSelect(req.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6 shrink-0">
                          <AvatarFallback className="text-xs bg-muted">{req.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{req.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{req.loginName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground truncate block max-w-28">{req.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{req.requestedDeptName ?? <span className="text-muted-foreground/50">—</span>}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(req.registeredAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground line-clamp-1">{req.message || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm" className="h-7 gap-1 text-xs bg-green-600 hover:bg-green-700"
                          disabled={reviewMutation.isPending}
                          onClick={() => reviewMutation.mutate({ id: req.id, status: "approved" })}
                        >
                          <Check className="size-3" />通过
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          className="h-7 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                          disabled={reviewMutation.isPending}
                          onClick={() => reviewMutation.mutate({ id: req.id, status: "rejected" })}
                        >
                          <X className="size-3" />拒绝
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 py-3 border-t shrink-0 flex items-center text-xs text-muted-foreground">
            共 {requests.length} 条待审批 · 通过后用户即可登录使用
          </div>
        </SheetContent>
      </Sheet>

      <AutoRulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </>
  )
}
