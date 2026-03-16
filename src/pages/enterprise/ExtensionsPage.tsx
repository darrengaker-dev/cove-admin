import { useState } from "react"
import { Plus, Search, Check, X, Trash2, Settings2 } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  useExtensions, usePendingApprovals,
  useUpdateExtension, useDeleteExtension, useReviewApproval,
} from "@/hooks/useExtensions"
import {
  EXTENSION_TYPE_LABELS, EXTENSION_TYPE_COLORS,
  EXTENSION_SOURCE_LABELS, EXTENSION_SCOPE_LABELS,
} from "@/types/extension"
import type { Extension, ExtensionApproval, ExtensionType, ExtensionScope } from "@/types/extension"
import { cn } from "@/lib/utils"

const TYPE_FILTERS: { value: ExtensionType | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "skill", label: "Skill" },
  { value: "tool", label: "工具" },
  { value: "connector", label: "连接器" },
  { value: "agent", label: "Agent" },
]

function TableSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function InstalledTable({ data, isLoading }: { data: Extension[]; isLoading: boolean }) {
  const updateMutation = useUpdateExtension()
  const deleteMutation = useDeleteExtension()

  const handleToggle = (ext: Extension) => {
    updateMutation.mutate({ id: ext.id, body: { status: ext.status === "enabled" ? "disabled" : "enabled" } })
  }

  const handleScopeChange = (ext: Extension, scope: ExtensionScope) => {
    updateMutation.mutate({ id: ext.id, body: { scope } })
  }

  const handleDelete = (ext: Extension) => {
    if (!confirm(`确认卸载「${ext.name}」？`)) return
    deleteMutation.mutate(ext.id)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>扩展</TableHead>
          <TableHead className="w-20">类型</TableHead>
          <TableHead className="w-20">来源</TableHead>
          <TableHead className="w-32">可用范围</TableHead>
          <TableHead className="w-16 text-right">调用次数</TableHead>
          <TableHead className="w-16">启用</TableHead>
          <TableHead className="w-20">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? <TableSkeleton cols={7} /> : data.map((ext) => (
          <TableRow key={ext.id} className={ext.status === "disabled" ? "opacity-50" : ""}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <span className="text-xl leading-none shrink-0">{ext.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{ext.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-xs">{ext.description}</div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5">{ext.developer} · v{ext.version}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("text-xs", EXTENSION_TYPE_COLORS[ext.type])}>
                {EXTENSION_TYPE_LABELS[ext.type]}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-xs text-muted-foreground">{EXTENSION_SOURCE_LABELS[ext.source]}</span>
            </TableCell>
            <TableCell>
              <Select
                value={ext.scope}
                onValueChange={(v) => handleScopeChange(ext, v as ExtensionScope)}
                disabled={ext.source === "builtin"}
              >
                <SelectTrigger className="h-7 text-xs w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(EXTENSION_SCOPE_LABELS) as [ExtensionScope, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-right">
              <span className="text-sm tabular-nums text-muted-foreground">{ext.usageCount.toLocaleString()}</span>
            </TableCell>
            <TableCell>
              <Switch
                checked={ext.status === "enabled"}
                onCheckedChange={() => handleToggle(ext)}
                disabled={ext.source === "builtin"}
                className="scale-90"
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="配置">
                  <Settings2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  title={ext.source === "builtin" ? "内置扩展不可卸载" : "卸载"}
                  disabled={ext.source === "builtin" || deleteMutation.isPending}
                  onClick={() => handleDelete(ext)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function ApprovalTable({ data, isLoading }: { data: ExtensionApproval[]; isLoading: boolean }) {
  const reviewMutation = useReviewApproval()

  const handleReview = (id: string, approved: boolean) => {
    reviewMutation.mutate({ id, body: { status: approved ? "approved" : "rejected" } })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>扩展</TableHead>
          <TableHead className="w-20">类型</TableHead>
          <TableHead className="w-32">申请人</TableHead>
          <TableHead className="w-36">申请时间</TableHead>
          <TableHead className="w-24">申请范围</TableHead>
          <TableHead className="w-28">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? <TableSkeleton cols={6} /> : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
              暂无待审批的扩展申请
            </TableCell>
          </TableRow>
        ) : data.map((apr) => (
          <TableRow key={apr.id}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <span className="text-xl leading-none shrink-0">{apr.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{apr.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-xs">{apr.description}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("text-xs", EXTENSION_TYPE_COLORS[apr.type])}>
                {EXTENSION_TYPE_LABELS[apr.type]}
              </Badge>
            </TableCell>
            <TableCell>
              <div>
                <div className="text-sm">{apr.submittedBy}</div>
                <div className="text-xs text-muted-foreground">{apr.submittedByEmail}</div>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {new Date(apr.submittedAt).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {EXTENSION_SCOPE_LABELS[apr.requestedScope]}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  size="sm" className="h-7 gap-1 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => handleReview(apr.id, true)}
                  disabled={reviewMutation.isPending}
                >
                  <Check className="size-3" />通过
                </Button>
                <Button
                  variant="outline" size="sm" className="h-7 gap-1 text-xs text-destructive border-destructive/40 hover:bg-destructive/5"
                  onClick={() => handleReview(apr.id, false)}
                  disabled={reviewMutation.isPending}
                >
                  <X className="size-3" />拒绝
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function ExtensionsPage() {
  const { data: extensions = [], isLoading: loadingExt } = useExtensions()
  const { data: approvals = [], isLoading: loadingApr } = usePendingApprovals()
  const [typeFilter, setTypeFilter] = useState<ExtensionType | "all">("all")
  const [scopeFilter, setScopeFilter] = useState<ExtensionScope | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = extensions.filter((e) => {
    if (typeFilter !== "all" && e.type !== typeFilter) return false
    if (scopeFilter !== "all" && e.scope !== scopeFilter) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) &&
        !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="扩展管理"
        description="管理 Skills、工具、连接器和 Agent 的安装、访问权限与上架审批"
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" strokeWidth={1.5} />上架扩展
          </Button>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="installed">
          <TabsList className="mb-4">
            <TabsTrigger value="installed" className="gap-1.5">
              已安装
              <Badge variant="secondary" className="text-xs py-0 px-1.5">{extensions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-1.5">
              待审批
              {approvals.length > 0 && (
                <Badge className="text-xs py-0 px-1.5 bg-orange-500 hover:bg-orange-500">{approvals.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="space-y-3">
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 rounded-lg border p-1">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTypeFilter(f.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs transition-colors",
                      typeFilter === f.value
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <Select value={scopeFilter} onValueChange={(v) => setScopeFilter(v as ExtensionScope | "all")}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="可用范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">全部范围</SelectItem>
                  {(Object.entries(EXTENSION_SCOPE_LABELS) as [ExtensionScope, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-40 max-w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索扩展名称..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <InstalledTable data={filtered} isLoading={loadingExt} />
            </div>
          </TabsContent>

          <TabsContent value="approvals">
            <div className="rounded-xl border overflow-hidden">
              <ApprovalTable data={approvals} isLoading={loadingApr} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
