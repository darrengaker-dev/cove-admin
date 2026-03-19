import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Search, Check, X, Trash2, Upload, Bot, Building2, Users, ChevronDown, MoreHorizontal, Pencil } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  useExtensions, usePendingApprovals,
  useUpdateExtension, useDeleteExtension, useReviewApproval,
} from "@/hooks/useExtensions"
import {
  EXTENSION_TYPE_LABELS, EXTENSION_TYPE_COLORS,
  EXTENSION_SOURCE_LABELS, EXTENSION_SCOPE_LABELS, EXTENSION_TERMINAL_LABELS,
} from "@/types/extension"
import type { Extension, ExtensionApproval, ExtensionType, ExtensionScope, ExtensionTerminal } from "@/types/extension"
import { MOCK_DEPTS, MOCK_MEMBERS } from "@/mocks/data/users"
import type { OrgDept } from "@/types/user"
import { cn } from "@/lib/utils"

const VISIBLE_EXTENSION_TYPES: ExtensionType[] = ["skill", "agent"]

const TYPE_FILTERS: { value: ExtensionType; label: string }[] = [
  { value: "skill", label: "技能" },
  { value: "agent", label: "智能体" },
]

const ALL_TERMINALS = Object.keys(EXTENSION_TERMINAL_LABELS) as ExtensionTerminal[]

type ScopeConfigTab = "dept" | "member"

type DeptTreeNode = OrgDept & { children: DeptTreeNode[] }

function buildDeptTree(depts: OrgDept[]) {
  const nodeMap = new Map<string, DeptTreeNode>()
  depts.forEach((dept) => nodeMap.set(dept.id, { ...dept, children: [] }))

  const roots: DeptTreeNode[] = []
  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (nodes: DeptTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder)
    nodes.forEach((node) => sortNodes(node.children))
  }

  sortNodes(roots)
  return roots
}

function collectDeptTreeIds(node: DeptTreeNode): string[] {
  return [node.id, ...node.children.flatMap(collectDeptTreeIds)]
}

function getScopeSelectionText(extension: Extension) {
  const deptCount = extension.scopeDeptIds?.length ?? 0
  const memberCount = extension.scopeMemberIds?.length ?? 0
  return `已选${deptCount}部门，${memberCount}成员`
}

function getScopeSelectionSummary(deptIds: string[], memberIds: string[]) {
  return `已选${deptIds.length}部门，${memberIds.length}成员`
}

function TerminalMultiSelect({
  extension,
  onChange,
}: {
  extension: Extension
  onChange: (terminals: ExtensionTerminal[]) => void
}) {
  const current: ExtensionTerminal[] = extension.terminals.length > 0 ? extension.terminals : ALL_TERMINALS
  const isAllSelected = ALL_TERMINALS.every((terminal) => current.includes(terminal))

  const isChecked = (terminal: ExtensionTerminal) => current.includes(terminal)

  const toggleTerminal = (terminal: ExtensionTerminal) => {
    const updated = current.includes(terminal)
      ? current.filter((item) => item !== terminal)
      : [...current, terminal]
    onChange(updated.length === 0 ? [...ALL_TERMINALS] : updated)
  }

  const summary = isAllSelected ? "全部终端" : current.map((item) => EXTENSION_TERMINAL_LABELS[item]).join("、")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-7 w-36 items-center justify-between rounded-md border px-3 text-xs"
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-2">
        <div className="mb-1 flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium">可选终端</span>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => onChange([...ALL_TERMINALS])}
          >
            全选
          </button>
        </div>
        <div className="space-y-1">
          {(Object.entries(EXTENSION_TERMINAL_LABELS) as [ExtensionTerminal, string][]).map(([terminal, label]) => (
            <label key={terminal} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40">
              <Checkbox checked={isChecked(terminal)} onCheckedChange={() => toggleTerminal(terminal)} />
              <span className="text-xs">{label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ScopeConfigDialog({
  open,
  onOpenChange,
  extension,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  extension: Extension | null
  onConfirm: (payload: { scopeDeptIds: string[]; scopeMemberIds: string[] }) => void
}) {
  const [tab, setTab] = useState<ScopeConfigTab>("dept")
  const [deptIds, setDeptIds] = useState<string[]>([])
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState("")

  useEffect(() => {
    if (!open || !extension) return
    setTab("dept")
    setDeptIds(extension.scopeDeptIds ?? [])
    setMemberIds(extension.scopeMemberIds ?? [])
    setMemberSearch("")
  }, [open, extension])

  const deptTree = useMemo(() => buildDeptTree(MOCK_DEPTS), [])
  const filteredMembers = useMemo(() => {
    const keyword = memberSearch.trim().toLowerCase()
    if (!keyword) return MOCK_MEMBERS
    return MOCK_MEMBERS.filter((member) =>
      member.name.toLowerCase().includes(keyword) ||
      member.email?.toLowerCase().includes(keyword) ||
      member.primaryDeptName.toLowerCase().includes(keyword)
    )
  }, [memberSearch])

  const toggleId = (setter: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setter((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const allDeptIds = useMemo(() => MOCK_DEPTS.map((dept) => dept.id), [])
  const allFilteredMemberIds = filteredMembers.map((member) => member.id)

  const getDeptCheckState = (node: DeptTreeNode): boolean | "indeterminate" => {
    const relatedIds = collectDeptTreeIds(node)
    const selectedCount = relatedIds.filter((id) => deptIds.includes(id)).length
    if (selectedCount === 0) return false
    if (selectedCount === relatedIds.length) return true
    return "indeterminate"
  }

  const toggleDeptNode = (node: DeptTreeNode) => {
    const relatedIds = collectDeptTreeIds(node)
    const isFullySelected = relatedIds.every((id) => deptIds.includes(id))

    setDeptIds((prev) => {
      if (isFullySelected) return prev.filter((id) => !relatedIds.includes(id))
      return Array.from(new Set([...prev, ...relatedIds]))
    })
  }

  const renderDeptNode = (node: DeptTreeNode, depth = 0) => (
    <div key={node.id}>
      <label
        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/40"
        style={{ paddingLeft: `${12 + depth * 18}px` }}
      >
        <Checkbox checked={getDeptCheckState(node)} onCheckedChange={() => toggleDeptNode(node)} />
        <Building2 className="size-4 text-muted-foreground" />
        <span className="flex-1 text-sm">{node.name}</span>
        <span className="text-xs text-muted-foreground">{node.memberCount}</span>
      </label>
      {node.children.map((child) => renderDeptNode(child, depth + 1))}
    </div>
  )

  const handleConfirm = () => {
    onConfirm({ scopeDeptIds: deptIds, scopeMemberIds: memberIds })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>配置适用范围</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="space-y-1 rounded-xl border bg-muted/20 p-2">
            {[
              { id: "dept", label: "部门", icon: Building2 },
              { id: "member", label: "成员", icon: Users },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id as ScopeConfigTab)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    tab === item.id ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="rounded-xl border">
            {tab === "dept" && (
              <div className="max-h-[420px] overflow-y-auto p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">选择允许访问该扩展的部门范围</div>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setDeptIds(deptIds.length === allDeptIds.length ? [] : allDeptIds)}
                  >
                    {deptIds.length === allDeptIds.length ? "取消全选" : "全选"}
                  </button>
                </div>
                <div className="space-y-1">
                  {deptTree.map((node) => renderDeptNode(node))}
                </div>
              </div>
            )}

            {tab === "member" && (
              <div className="p-3">
                <div className="mb-3 flex items-center gap-3">
                  <Input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="搜索成员姓名、邮箱或部门"
                    className="h-9"
                  />
                  <button
                    type="button"
                    className="shrink-0 text-xs text-primary hover:underline"
                    onClick={() => {
                      setMemberIds((prev) =>
                        allFilteredMemberIds.every((id) => prev.includes(id))
                          ? prev.filter((id) => !allFilteredMemberIds.includes(id))
                          : Array.from(new Set([...prev, ...allFilteredMemberIds]))
                      )
                    }}
                  >
                    {allFilteredMemberIds.every((id) => memberIds.includes(id)) ? "取消全选" : "全选"}
                  </button>
                </div>
                <div className="max-h-[368px] space-y-2 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <label key={member.id} className="flex items-start gap-3 rounded-lg border px-3 py-3 hover:bg-muted/20">
                      <Checkbox checked={memberIds.includes(member.id)} onCheckedChange={() => toggleId(setMemberIds, member.id)} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.primaryDeptName}
                          {member.email ? ` · ${member.email}` : ""}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="items-center justify-between">
          <div className="text-xs text-muted-foreground">
            已选 {deptIds.length} 个部门，{memberIds.length} 个成员
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={handleConfirm}>确认</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

function InstalledTable({
  data,
  isLoading,
  onEditAgent,
}: {
  data: Extension[]
  isLoading: boolean
  onEditAgent: (extension: Extension) => void
}) {
  const updateMutation = useUpdateExtension()
  const deleteMutation = useDeleteExtension()
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false)
  const [scopeExtension, setScopeExtension] = useState<Extension | null>(null)

  const handleToggle = (ext: Extension) => {
    updateMutation.mutate({ id: ext.id, body: { status: ext.status === "enabled" ? "disabled" : "enabled" } })
  }

  const handleScopeChange = (ext: Extension, scope: ExtensionScope) => {
    if (scope === "dept") {
      setScopeExtension(ext)
      setScopeDialogOpen(true)
      return
    }

    updateMutation.mutate({
      id: ext.id,
      body: {
        scope,
        scopeDeptIds: [],
        scopeMemberIds: [],
      },
    })
  }

  const handleTerminalChange = (ext: Extension, terminals: ExtensionTerminal[]) => {
    updateMutation.mutate({ id: ext.id, body: { terminals } })
  }

  const handleDelete = (ext: Extension) => {
    if (!confirm(`确认卸载「${ext.name}」？`)) return
    deleteMutation.mutate(ext.id)
  }

  const handleEdit = (ext: Extension) => {
    if (ext.type !== "agent") return
    onEditAgent(ext)
  }

  const handleScopeConfirm = (payload: { scopeDeptIds: string[]; scopeMemberIds: string[] }) => {
    if (!scopeExtension) return
    updateMutation.mutate({
      id: scopeExtension.id,
      body: {
        scope: "dept",
        scopeDeptIds: payload.scopeDeptIds,
        scopeMemberIds: payload.scopeMemberIds,
      },
    })
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>扩展</TableHead>
            <TableHead className="w-20">类型</TableHead>
            <TableHead className="w-20">来源</TableHead>
            <TableHead className="w-52">可用范围</TableHead>
            <TableHead className="w-32">可选终端</TableHead>
            <TableHead className="w-16 text-right">调用次数</TableHead>
            <TableHead className="w-16">启用</TableHead>
            <TableHead className="w-20">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? <TableSkeleton cols={8} /> : data.map((ext) => (
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
                <div className="flex items-center gap-1.5">
                  <Select
                    value={ext.scope}
                    onValueChange={(v) => handleScopeChange(ext, v as ExtensionScope)}
                  >
                    <SelectTrigger className="h-7 text-xs w-40">
                      <SelectValue>
                        <span className="truncate">
                          {ext.scope === "dept" ? getScopeSelectionText(ext) : EXTENSION_SCOPE_LABELS[ext.scope]}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(EXTENSION_SCOPE_LABELS) as [ExtensionScope, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ext.scope === "dept" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      title="配置范围"
                      onClick={() => {
                        setScopeExtension(ext)
                        setScopeDialogOpen(true)
                      }}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">配置范围</span>
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <TerminalMultiSelect extension={ext} onChange={(terminals) => handleTerminalChange(ext, terminals)} />
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
                  {ext.type === "agent" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="编辑"
                      onClick={() => handleEdit(ext)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">编辑</span>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="更多操作">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={ext.source === "builtin" || deleteMutation.isPending}
                        onClick={() => handleDelete(ext)}
                      >
                        <Trash2 className="mr-2 size-3.5" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ScopeConfigDialog
        open={scopeDialogOpen}
        onOpenChange={setScopeDialogOpen}
        extension={scopeExtension}
        onConfirm={handleScopeConfirm}
      />
    </>
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

function UploadSkillDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setFile(null)
    onOpenChange(nextOpen)
  }

  const handleFileSelect = (nextFile?: File | null) => {
    if (!nextFile) return
    if (!nextFile.name.toLowerCase().endsWith(".zip")) return
    setFile(nextFile)
  }

  const handleSubmit = () => {
    if (!file) return
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>上架技能</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/20 p-6 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-background p-2 shadow-sm">
                <Upload className="size-5 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">上传 ZIP 安装包</div>
                <div className="text-sm text-muted-foreground">
                  选择技能安装包并提交上架申请，支持单个 `.zip` 文件
                </div>
              </div>
            </div>
          </div>

          {file && (
            <div className="rounded-xl border bg-muted/20 px-4 py-3">
              <div className="text-sm font-medium">{file.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                文件大小 {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={!file}>提交上架</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CreateAgentDialog({
  open,
  onOpenChange,
  extension,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  extension?: Extension | null
  onSubmit: (payload: { name: string; icon: string; description: string; systemPrompt: string }) => void
  isSubmitting?: boolean
}) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("🤖")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const isEditMode = Boolean(extension)

  const reset = () => {
    setName("")
    setIcon("🤖")
    setDescription("")
    setSystemPrompt("")
  }

  useEffect(() => {
    if (!open) return

    if (extension) {
      setName(extension.name)
      setIcon(extension.icon || "🤖")
      setDescription(extension.description)
      setSystemPrompt(extension.systemPrompt ?? "")
      return
    }

    reset()
  }, [open, extension])

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const handleSubmit = () => {
    if (!name.trim() || !systemPrompt.trim()) return
    onSubmit({
      name: name.trim(),
      icon: icon.trim() || "🤖",
      description: description.trim(),
      systemPrompt: systemPrompt.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "编辑智能体" : "新建智能体"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="agent-name">名称</Label>
            <div className="grid grid-cols-[1fr_120px] gap-3">
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：research-agent"
              />
              <div className="rounded-xl border bg-muted/20 px-3 py-2">
                <div className="mb-1 text-xs text-muted-foreground">图标</div>
                <div className="flex items-center gap-2 text-sm">
                  <Bot className="size-4 text-muted-foreground" />
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    placeholder="🤖"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="agent-description">描述</Label>
            <Textarea
              id="agent-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述此智能体的职责和适用场景"
              className="min-h-24"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="agent-system-prompt">System Prompt</Label>
            <Textarea
              id="agent-system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="定义智能体的角色、行为边界和输出要求"
              className="min-h-48"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !systemPrompt.trim() || isSubmitting}>
            {isEditMode ? "保存修改" : "提交创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ExtensionsPage() {
  const { data: extensions = [], isLoading: loadingExt } = useExtensions()
  const { data: approvals = [], isLoading: loadingApr } = usePendingApprovals()
  const updateMutation = useUpdateExtension()
  const [typeFilter, setTypeFilter] = useState<ExtensionType>("skill")
  const [scopeFilter, setScopeFilter] = useState<ExtensionScope | "all">("all")
  const [scopeFilterDeptIds, setScopeFilterDeptIds] = useState<string[]>([])
  const [scopeFilterMemberIds, setScopeFilterMemberIds] = useState<string[]>([])
  const [scopeFilterDialogOpen, setScopeFilterDialogOpen] = useState(false)
  const [terminalFilter, setTerminalFilter] = useState<ExtensionTerminal | "all">("all")
  const [search, setSearch] = useState("")
  const [uploadSkillOpen, setUploadSkillOpen] = useState(false)
  const [createAgentOpen, setCreateAgentOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Extension | null>(null)

  const visibleExtensions = extensions.filter((e) => VISIBLE_EXTENSION_TYPES.includes(e.type))
  const visibleApprovals = approvals.filter((e) => VISIBLE_EXTENSION_TYPES.includes(e.type))

  const filtered = visibleExtensions.filter((e) => {
    if (e.type !== typeFilter) return false
    if (scopeFilter !== "all" && e.scope !== scopeFilter) return false
    if (scopeFilter === "dept") {
      const matchDept =
        scopeFilterDeptIds.length === 0 ||
        (e.scopeDeptIds?.some((id) => scopeFilterDeptIds.includes(id)) ?? false)
      const matchMember =
        scopeFilterMemberIds.length === 0 ||
        (e.scopeMemberIds?.some((id) => scopeFilterMemberIds.includes(id)) ?? false)
      if (!matchDept && !matchMember) return false
    }
    if (terminalFilter !== "all" && !e.terminals.includes(terminalFilter)) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) &&
      !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreateClick = () => {
    if (typeFilter === "skill") {
      setUploadSkillOpen(true)
      return
    }
    setEditingAgent(null)
    setCreateAgentOpen(true)
  }

  const handleAgentDialogOpenChange = (open: boolean) => {
    setCreateAgentOpen(open)
    if (!open) setEditingAgent(null)
  }

  const handleEditAgent = (extension: Extension) => {
    setEditingAgent(extension)
    setCreateAgentOpen(true)
  }

  const handleAgentSubmit = (payload: { name: string; icon: string; description: string; systemPrompt: string }) => {
    if (!editingAgent) {
      handleAgentDialogOpenChange(false)
      return
    }

    updateMutation.mutate(
      {
        id: editingAgent.id,
        body: payload,
      },
      {
        onSuccess: () => handleAgentDialogOpenChange(false),
      }
    )
  }

  const handleScopeFilterChange = (nextScope: ExtensionScope | "all") => {
    if (nextScope === "dept") {
      setScopeFilter("dept")
      setScopeFilterDialogOpen(true)
      return
    }

    setScopeFilter(nextScope)
    setScopeFilterDeptIds([])
    setScopeFilterMemberIds([])
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="扩展管理"
        description="管理技能和智能体的安装、访问权限与上架审批"
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="installed">
          <TabsList className="mb-4">
            <TabsTrigger value="installed" className="gap-1.5">
              已安装
              <Badge variant="secondary" className="text-xs py-0 px-1.5">{visibleExtensions.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-1.5">
              待审批
              {visibleApprovals.length > 0 && (
                <Badge className="text-xs py-0 px-1.5 bg-orange-500 hover:bg-orange-500">{visibleApprovals.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="space-y-3">
            {/* Filters */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
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
                <Select value={terminalFilter} onValueChange={(v) => setTerminalFilter(v as ExtensionTerminal | "all")}>
                  <SelectTrigger className="h-8 w-32 text-xs">
                    <SelectValue placeholder="终端" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">全部终端</SelectItem>
                    {(Object.entries(EXTENSION_TERMINAL_LABELS) as [ExtensionTerminal, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Select value={scopeFilter} onValueChange={(v) => handleScopeFilterChange(v as ExtensionScope | "all")}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue>
                        <span className="truncate">
                          {scopeFilter === "dept"
                            ? getScopeSelectionSummary(scopeFilterDeptIds, scopeFilterMemberIds)
                            : scopeFilter === "all"
                              ? "全部范围"
                              : EXTENSION_SCOPE_LABELS[scopeFilter as ExtensionScope]}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">全部范围</SelectItem>
                      {(Object.entries(EXTENSION_SCOPE_LABELS) as [ExtensionScope, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {scopeFilter === "dept" && (
                    <button
                      type="button"
                      className="shrink-0 text-xs text-primary hover:underline"
                      onClick={() => setScopeFilterDialogOpen(true)}
                    >
                      配置
                    </button>
                  )}
                </div>
                <div className="relative flex-1 min-w-40 max-w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={typeFilter === "skill" ? "搜索技能名称" : "搜索智能体名称"}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>
              <Button size="sm" className="gap-1.5" onClick={handleCreateClick}>
                <Plus className="size-3.5" strokeWidth={1.5} />
                {typeFilter === "skill" ? "上架技能" : "新建智能体"}
              </Button>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <InstalledTable data={filtered} isLoading={loadingExt} onEditAgent={handleEditAgent} />
            </div>
          </TabsContent>

          <TabsContent value="approvals">
            <div className="rounded-xl border overflow-hidden">
              <ApprovalTable data={visibleApprovals} isLoading={loadingApr} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <UploadSkillDialog open={uploadSkillOpen} onOpenChange={setUploadSkillOpen} />
      <CreateAgentDialog
        open={createAgentOpen}
        onOpenChange={handleAgentDialogOpenChange}
        extension={editingAgent}
        onSubmit={handleAgentSubmit}
        isSubmitting={updateMutation.isPending}
      />
      <ScopeConfigDialog
        open={scopeFilterDialogOpen}
        onOpenChange={setScopeFilterDialogOpen}
        extension={{
          id: "scope-filter",
          name: "",
          description: "",
          icon: "",
          type: "skill",
          source: "admin",
          developer: "",
          scope: "dept",
          terminals: [],
          scopeDeptIds: scopeFilterDeptIds,
          scopeMemberIds: scopeFilterMemberIds,
          status: "enabled",
          version: "",
          installedAt: "",
          usageCount: 0,
        }}
        onConfirm={({ scopeDeptIds, scopeMemberIds }) => {
          setScopeFilter("dept")
          setScopeFilterDeptIds(scopeDeptIds)
          setScopeFilterMemberIds(scopeMemberIds)
        }}
      />
    </div>
  )
}
