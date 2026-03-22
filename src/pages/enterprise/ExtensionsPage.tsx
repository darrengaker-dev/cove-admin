import { useMemo, useRef, useState } from "react"
import {
  BookText,
  Building2,
  Check,
  ChartColumn,
  ChevronDown,
  Languages,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  PenLine,
  Plus,
  RefreshCcw,
  Search,
  SpellCheck2,
  Trash2,
  Users,
  Wand2,
  Wrench,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import {
  useExtensions,
  useCreateExtension,
  useUpdateExtension,
  useDeleteExtension,
  useTaskTypes,
  useCreateTaskType,
  useUpdateTaskType,
  useDeleteTaskType,
} from "@/hooks/useExtensions"
import {
  EXTENSION_SOURCE_LABELS,
  EXTENSION_TERMINAL_LABELS,
} from "@/types/extension"
import type {
  Extension,
  ExtensionSource,
  ExtensionScope,
  ExtensionStatus,
  ExtensionTerminal,
  TaskType,
  TaskTypeStatus,
} from "@/types/extension"
import { cn } from "@/lib/utils"
import { MOCK_DEPTS, MOCK_MEMBERS } from "@/mocks/data/users"
import type { OrgDept } from "@/types/user"

const TERMINAL_OPTIONS = Object.entries(EXTENSION_TERMINAL_LABELS) as [ExtensionTerminal, string][]
const SOURCE_OPTIONS: Array<{ value: "all" | ExtensionSource; label: string }> = [
  { value: "all", label: "全部来源" },
  { value: "builtin", label: "内置" },
  { value: "shared", label: "用户分享" },
  { value: "admin", label: "管理员创建" },
]
const STATUS_OPTIONS: Array<{ value: "all" | ExtensionStatus; label: string }> = [
  { value: "all", label: "全部状态" },
  { value: "enabled", label: "启用中" },
  { value: "disabled", label: "已停用" },
]
const SCOPE_FILTER_OPTIONS: Array<{ value: "all" | ExtensionScope; label: string }> = [
  { value: "all", label: "全部范围" },
  { value: "dept", label: "指定部门/成员" },
  { value: "admin", label: "仅管理员" },
]
const SCOPE_OPTIONS: Array<{ value: ExtensionScope; label: string }> = [
  { value: "all", label: "全员可用" },
  { value: "dept", label: "指定部门/成员" },
  { value: "admin", label: "仅管理员" },
]

type CategoryFilter = "all" | "uncategorized" | string
type ScopeConfigTab = "dept" | "member"
type TerminalGroupFilter = "desktop" | "word" | "excel" | "ppt"

const COMMAND_TERMINAL_GROUPS: Array<{ value: TerminalGroupFilter; label: string; description: string }> = [
  { value: "desktop", label: "桌面端", description: "桌面应用内可见的快捷指令" },
  { value: "word", label: "Word 插件", description: "Word 插件内可见的快捷指令" },
  { value: "excel", label: "Excel 插件", description: "Excel 插件内可见的快捷指令" },
  { value: "ppt", label: "PPT 插件", description: "PPT 插件内可见的快捷指令" },
]

const DEFAULT_TASK_TYPE = {
  name: "",
  icon: "proofread",
  description: "",
}

const DEFAULT_SKILL = {
  name: "",
  description: "",
  icon: "🧩",
  source: "admin" as ExtensionSource,
  terminals: ["desktop"] as ExtensionTerminal[],
  scope: "all" as ExtensionScope,
  scopeDeptIds: [] as string[],
  scopeMemberIds: [] as string[],
  status: "enabled" as ExtensionStatus,
}

const DEFAULT_COMMAND = {
  name: "",
  description: "",
  categoryId: "",
  starterPrompt: "",
}

function createSkillForm(skill?: Extension | null) {
  if (!skill) return DEFAULT_SKILL
  return {
    name: skill.name,
    description: skill.description,
    icon: skill.icon,
    source: skill.source,
    terminals: skill.terminals,
    scope: skill.scope,
    scopeDeptIds: skill.scopeDeptIds ?? [],
    scopeMemberIds: skill.scopeMemberIds ?? [],
    status: skill.status,
  }
}

function createTaskTypeForm(taskType?: TaskType | null) {
  if (!taskType) return DEFAULT_TASK_TYPE
  return {
    name: taskType.name,
    icon: taskType.icon,
    description: taskType.description,
  }
}

function createCommandForm(command?: Extension | null, defaultCategoryId = "") {
  if (!command) return { ...DEFAULT_COMMAND, categoryId: defaultCategoryId }
  return {
    name: command.name,
    description: command.description,
    categoryId: command.categoryId ?? "",
    starterPrompt: command.starterPrompt ?? "",
  }
}

function getSlashQuery(value: string, caret: number) {
  const uptoCaret = value.slice(0, caret)
  const slashIndex = uptoCaret.lastIndexOf("/")
  if (slashIndex === -1) return null
  const charBefore = slashIndex === 0 ? "" : uptoCaret[slashIndex - 1]
  if (charBefore && !/\s/.test(charBefore)) return null
  const query = uptoCaret.slice(slashIndex + 1)
  if (/\s/.test(query)) return null
  return { slashIndex, query: query.toLowerCase() }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function readUInt16LE(buffer: Uint8Array, offset: number) {
  return buffer[offset] | (buffer[offset + 1] << 8)
}

function readUInt32LE(buffer: Uint8Array, offset: number) {
  return (
    buffer[offset] |
    (buffer[offset + 1] << 8) |
    (buffer[offset + 2] << 16) |
    (buffer[offset + 3] << 24)
  ) >>> 0
}

function listZipEntries(buffer: Uint8Array) {
  const entries: string[] = []

  for (let index = Math.max(0, buffer.length - 22); index >= 0; index -= 1) {
    if (
      buffer[index] === 0x50 &&
      buffer[index + 1] === 0x4b &&
      buffer[index + 2] === 0x05 &&
      buffer[index + 3] === 0x06
    ) {
      const centralDirectoryOffset = readUInt32LE(buffer, index + 16)
      const totalEntries = readUInt16LE(buffer, index + 10)
      let pointer = centralDirectoryOffset

      for (let i = 0; i < totalEntries; i += 1) {
        if (
          buffer[pointer] !== 0x50 ||
          buffer[pointer + 1] !== 0x4b ||
          buffer[pointer + 2] !== 0x01 ||
          buffer[pointer + 3] !== 0x02
        ) {
          break
        }

        const fileNameLength = readUInt16LE(buffer, pointer + 28)
        const extraLength = readUInt16LE(buffer, pointer + 30)
        const commentLength = readUInt16LE(buffer, pointer + 32)
        const fileNameStart = pointer + 46
        const fileNameEnd = fileNameStart + fileNameLength
        const fileName = new TextDecoder().decode(buffer.slice(fileNameStart, fileNameEnd))
        entries.push(fileName)

        pointer = fileNameEnd + extraLength + commentLength
      }

      return entries
    }
  }

  return entries
}

async function validateSkillArchive(file: File) {
  const errors: string[] = []

  if (!file.name.toLowerCase().endsWith(".zip")) {
    errors.push("请上传 .zip 格式的技能包。")
    return { valid: false, errors, entries: [] as string[] }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const entries = listZipEntries(bytes)
  if (entries.length === 0) {
    errors.push("无法识别 zip 文件结构，请确认压缩包未损坏。")
    return { valid: false, errors, entries }
  }

  const normalizedEntries = entries.map((entry) => entry.replace(/\\/g, "/").toLowerCase())
  const hasSkillMd = normalizedEntries.some((entry) => entry === "skill.md" || entry.endsWith("/skill.md"))
  if (!hasSkillMd) {
    errors.push("压缩包中缺少 `SKILL.md` 文件。")
  }

  const hasDirectory = normalizedEntries.some((entry) => entry.includes("/"))
  if (!hasDirectory && normalizedEntries.length < 2) {
    errors.push("技能包结构过于简单，请确认包含技能说明及相关资源文件。")
  }

  return {
    valid: errors.length === 0,
    errors,
    entries,
  }
}

function TerminalTag({
  terminal,
  className,
}: {
  terminal: ExtensionTerminal
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground",
        className
      )}
    >
      {EXTENSION_TERMINAL_LABELS[terminal]}
    </span>
  )
}

function TerminalTagList({
  terminals,
  className,
}: {
  terminals: ExtensionTerminal[]
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {terminals.map((terminal) => (
        <TerminalTag key={terminal} terminal={terminal} />
      ))}
    </div>
  )
}

function TerminalMultiSelect({
  value,
  onChange,
  placeholder = "选择终端",
  className,
}: {
  value: ExtensionTerminal[]
  onChange: (value: ExtensionTerminal[]) => void
  placeholder?: string
  className?: string
}) {
  const toggle = (terminal: ExtensionTerminal) => {
    if (value.includes(terminal)) {
      onChange(value.filter((item) => item !== terminal))
      return
    }
    onChange([...value, terminal])
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-auto min-h-9 w-full justify-start px-3 py-2 font-normal", className)}
        >
          {value.length > 0 ? (
            <TerminalTagList terminals={value} className="max-w-full" />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          <CommandList className="max-h-64">
            <CommandEmpty>没有匹配终端</CommandEmpty>
            <CommandGroup>
              {TERMINAL_OPTIONS.map(([terminal, label]) => {
                const checked = value.includes(terminal)
                return (
                  <CommandItem
                    key={terminal}
                    value={`${terminal}-${label}`}
                    onSelect={() => toggle(terminal)}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border",
                        checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                      )}
                    >
                      <Check className={cn("size-3", checked ? "opacity-100" : "opacity-0")} />
                    </span>
                    <span>{label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.length > 0 ? (
              <div className="border-t p-1">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-sm"
                  onClick={() => onChange([])}
                >
                  清空选择
                </button>
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

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

function getScopeSelectionSummary(deptIds: string[], memberIds: string[]) {
  return `已选 ${deptIds.length} 个部门，${memberIds.length} 个成员`
}

const TASK_TYPE_ICON_OPTIONS = [
  { value: "proofread", label: "校对", icon: SpellCheck2 },
  { value: "layout", label: "排版", icon: LayoutTemplate },
  { value: "translate", label: "翻译", icon: Languages },
  { value: "write", label: "写作", icon: PenLine },
  { value: "rewrite", label: "改写", icon: RefreshCcw },
  { value: "summary", label: "总结", icon: BookText },
  { value: "analysis", label: "分析", icon: ChartColumn },
  { value: "custom", label: "通用", icon: Wand2 },
] as const

type TaskTypeIconKey = typeof TASK_TYPE_ICON_OPTIONS[number]["value"]

function resolveTaskTypeIcon(taskType: Pick<TaskType, "name" | "icon">) {
  const explicitIcon = TASK_TYPE_ICON_OPTIONS.find((item) => item.value === taskType.icon)
  if (explicitIcon) return explicitIcon.value
  const keyword = `${taskType.name} ${taskType.icon}`.toLowerCase()
  if (keyword.includes("校对") || keyword.includes("错别字") || keyword.includes("语法")) return "proofread"
  if (keyword.includes("排版") || keyword.includes("版式")) return "layout"
  if (keyword.includes("翻译")) return "translate"
  if (keyword.includes("写作")) return "write"
  if (keyword.includes("改写")) return "rewrite"
  if (keyword.includes("总结") || keyword.includes("摘要")) return "summary"
  if (keyword.includes("分析")) return "analysis"
  return "custom" as TaskTypeIconKey
}

function TaskTypeIcon({
  taskType,
  className,
}: {
  taskType: Pick<TaskType, "name" | "icon">
  className?: string
}) {
  const iconKind = resolveTaskTypeIcon(taskType)
  const Icon = TASK_TYPE_ICON_OPTIONS.find((item) => item.value === iconKind)?.icon ?? Wand2

  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background shadow-xs text-foreground",
        className
      )}
    >
      <Icon className="size-4 stroke-[1.8]" />
    </span>
  )
}

function ScopePickerDialog({
  open,
  onOpenChange,
  title,
  deptIds,
  memberIds,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  deptIds: string[]
  memberIds: string[]
  onSave: (payload: { scopeDeptIds: string[]; scopeMemberIds: string[] }) => void
}) {
  const deptTree = useMemo(() => buildDeptTree(MOCK_DEPTS), [])
  const [tab, setTab] = useState<ScopeConfigTab>("dept")
  const [draftDeptIds, setDraftDeptIds] = useState<string[]>(deptIds)
  const [draftMemberIds, setDraftMemberIds] = useState<string[]>(memberIds)
  const [memberSearch, setMemberSearch] = useState("")

  const filteredMembers = useMemo(() => {
    const keyword = memberSearch.trim().toLowerCase()
    if (!keyword) return MOCK_MEMBERS
    return MOCK_MEMBERS.filter((member) =>
      member.name.toLowerCase().includes(keyword) ||
      member.email?.toLowerCase().includes(keyword) ||
      member.primaryDeptName.toLowerCase().includes(keyword)
    )
  }, [memberSearch])

  const getDeptCheckState = (node: DeptTreeNode): boolean | "indeterminate" => {
    const relatedIds = collectDeptTreeIds(node)
    const selectedCount = relatedIds.filter((id) => draftDeptIds.includes(id)).length
    if (selectedCount === 0) return false
    if (selectedCount === relatedIds.length) return true
    return "indeterminate"
  }

  const toggleDeptNode = (node: DeptTreeNode) => {
    const relatedIds = collectDeptTreeIds(node)
    const isFullySelected = relatedIds.every((id) => draftDeptIds.includes(id))
    setDraftDeptIds((prev) => {
      if (isFullySelected) return prev.filter((id) => !relatedIds.includes(id))
      return Array.from(new Set([...prev, ...relatedIds]))
    })
  }

  const toggleMember = (id: string) => {
    setDraftMemberIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="space-y-1 rounded-xl border bg-muted/20 p-2">
            <button
              type="button"
              onClick={() => setTab("dept")}
              className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm", tab === "dept" ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              <Building2 className="size-4" />
              部门
            </button>
            <button
              type="button"
              onClick={() => setTab("member")}
              className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm", tab === "member" ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              <Users className="size-4" />
              成员
            </button>
          </div>
          <div className="rounded-xl border">
            {tab === "dept" ? (
              <div className="max-h-[420px] overflow-y-auto p-3">
                <div className="mb-3 text-sm text-muted-foreground">选择允许使用该技能的部门</div>
                <div className="space-y-1">{deptTree.map((node) => renderDeptNode(node))}</div>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto p-3">
                <Input placeholder="搜索成员" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
                <div className="mt-3 space-y-1">
                  {filteredMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/40">
                      <Checkbox checked={draftMemberIds.includes(member.id)} onCheckedChange={() => toggleMember(member.id)} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email} · {member.primaryDeptName}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="items-center justify-between">
          <div className="text-xs text-muted-foreground">{getScopeSelectionSummary(draftDeptIds, draftMemberIds)}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
            <Button onClick={() => { onSave({ scopeDeptIds: draftDeptIds, scopeMemberIds: draftMemberIds }); onOpenChange(false) }}>保存范围</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ScopeConfigDialog({
  open,
  onOpenChange,
  extension,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  extension: Extension | null
}) {
  const updateExtension = useUpdateExtension()
  if (!extension) return null

  return (
    <ScopePickerDialog
      open={open}
      onOpenChange={onOpenChange}
      title="配置使用范围"
      deptIds={extension.scopeDeptIds ?? []}
      memberIds={extension.scopeMemberIds ?? []}
      onSave={({ scopeDeptIds, scopeMemberIds }) =>
        updateExtension.mutate({
          id: extension.id,
          body: { scopeDeptIds, scopeMemberIds, scope: "dept" },
        })
      }
    />
  )
}

function SkillDialog({
  open,
  onOpenChange,
  editingSkill,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSkill: Extension | null
}) {
  const [form, setForm] = useState(() => createSkillForm(editingSkill))
  const [scopePickerOpen, setScopePickerOpen] = useState(false)
  const createExtension = useCreateExtension()
  const updateExtension = useUpdateExtension()

  const saveSkill = () => {
    const payload = {
      ...form,
      type: "skill" as const,
      developer: "管理员",
      name: form.name.trim(),
      description: form.description.trim(),
    }
    if (!payload.name || !payload.description || payload.terminals.length === 0) return

    if (editingSkill) {
      updateExtension.mutate({ id: editingSkill.id, body: payload }, { onSuccess: () => onOpenChange(false) })
      return
    }
    createExtension.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingSkill ? "编辑技能" : "新建技能"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label>名称</Label>
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>描述</Label>
            <Textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>来源</Label>
            <Select value={form.source} onValueChange={(value) => setForm((prev) => ({ ...prev, source: value as ExtensionSource }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="builtin">内置</SelectItem>
                <SelectItem value="shared">用户分享</SelectItem>
                <SelectItem value="admin">管理员创建</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>状态</Label>
            <div className="flex h-10 items-center justify-between rounded-md border px-3">
              <span className="text-sm text-muted-foreground">{form.status === "enabled" ? "启用中" : "已停用"}</span>
              <Switch
                checked={form.status === "enabled"}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked ? "enabled" : "disabled" }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>使用范围</Label>
            <Select
              value={form.scope}
              onValueChange={(value) => {
                const nextScope = value as ExtensionScope
                setForm((prev) => ({
                  ...prev,
                  scope: nextScope,
                  scopeDeptIds: nextScope === "dept" ? prev.scopeDeptIds : [],
                  scopeMemberIds: nextScope === "dept" ? prev.scopeMemberIds : [],
                }))
                if (nextScope === "dept") setScopePickerOpen(true)
              }}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCOPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>终端</Label>
            <TerminalMultiSelect value={form.terminals} onChange={(terminals) => setForm((prev) => ({ ...prev, terminals }))} className="w-full" />
          </div>
          {form.scope === "dept" ? (
            <div className="flex items-center justify-between rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground md:col-span-2">
              <span>{getScopeSelectionSummary(form.scopeDeptIds, form.scopeMemberIds)}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setScopePickerOpen(true)}>
                选择部门/成员
              </Button>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={saveSkill}>{editingSkill ? "保存技能" : "创建技能"}</Button>
        </DialogFooter>
        <ScopePickerDialog
          open={scopePickerOpen}
          onOpenChange={setScopePickerOpen}
          title="选择部门/成员"
          deptIds={form.scopeDeptIds}
          memberIds={form.scopeMemberIds}
          onSave={({ scopeDeptIds, scopeMemberIds }) =>
            setForm((prev) => ({ ...prev, scopeDeptIds, scopeMemberIds, scope: "dept" }))
          }
        />
      </DialogContent>
    </Dialog>
  )
}

function UploadSkillDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const createExtension = useCreateExtension()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [archiveEntries, setArchiveEntries] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isValidated, setIsValidated] = useState(false)

  const resetUploadState = () => {
    setSelectedFile(null)
    setValidationErrors([])
    setArchiveEntries([])
    setIsValidated(false)
    setIsValidating(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file)
    setValidationErrors([])
    setArchiveEntries([])
    setIsValidated(false)
    if (!file) return

    setIsValidating(true)
    const result = await validateSkillArchive(file)
    setValidationErrors(result.errors)
    setArchiveEntries(result.entries)
    setIsValidated(result.valid)
    setIsValidating(false)
  }

  const handleUpload = () => {
    if (!selectedFile || !isValidated) return
    const skillName = selectedFile.name.replace(/\.zip$/i, "")
    createExtension.mutate({
      name: skillName,
      description: "通过 zip 技能包上传，已通过基础结构校验。",
      icon: "🧩",
      type: "skill",
      source: "admin",
      developer: "管理员",
      scope: "all",
      terminals: ["desktop"],
      status: "enabled",
    }, {
      onSuccess: () => {
        resetUploadState()
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetUploadState()
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>上架技能</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed p-4">
            <div className="mt-1 text-xs text-muted-foreground">
              仅支持 `.zip` 文件。上传后会校验压缩包结构，至少需要包含 `SKILL.md`。
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                选择 zip 文件
              </Button>
              {selectedFile ? (
                <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-sm text-foreground">
                  <span className="max-w-[280px] truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={resetUploadState}
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    aria-label="移除已选择文件"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {selectedFile ? (
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-sm font-medium">结构校验</div>
              {isValidating ? (
                <div className="mt-3 text-sm text-muted-foreground">正在校验 zip 文件结构...</div>
              ) : validationErrors.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {validationErrors.map((error) => (
                    <div key={error} className="text-sm text-destructive">{error}</div>
                  ))}
                </div>
              ) : isValidated ? (
                <div className="mt-3 text-sm text-emerald-600">校验通过，可以上架该技能。</div>
              ) : null}
            </div>
          ) : null}

          {archiveEntries.length > 0 ? (
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium">压缩包内容预览</div>
              <div className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {archiveEntries.slice(0, 20).map((entry) => (
                  <div key={entry}>{entry}</div>
                ))}
                {archiveEntries.length > 20 ? <div>... 还有 {archiveEntries.length - 20} 项</div> : null}
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleUpload} disabled={!selectedFile || !isValidated || isValidating}>
            上架技能
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TaskTypeDialog({
  open,
  onOpenChange,
  editingTaskType,
  currentTerminal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTaskType: TaskType | null
  currentTerminal: TerminalGroupFilter
}) {
  const [taskTypeForm, setTaskTypeForm] = useState(() => createTaskTypeForm(editingTaskType))
  const createTaskType = useCreateTaskType()
  const updateTaskType = useUpdateTaskType()

  const saveTaskType = () => {
    const basePayload = {
      name: taskTypeForm.name.trim(),
      description: taskTypeForm.description.trim(),
      icon: taskTypeForm.icon,
    }
    if (!basePayload.name) return

    if (editingTaskType) {
      updateTaskType.mutate({ id: editingTaskType.id, body: basePayload }, { onSuccess: () => onOpenChange(false) })
      return
    }
    createTaskType.mutate({
      ...basePayload,
      terminals: [currentTerminal],
      status: "enabled" as TaskTypeStatus,
    }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTaskType ? "编辑任务类型" : "新建任务类型"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-[112px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label>图标</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 w-full justify-between px-3">
                    <TaskTypeIcon taskType={{ name: taskTypeForm.name, icon: taskTypeForm.icon }} className="size-6 rounded-md" />
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[220px] p-2">
                  <div className="grid grid-cols-4 gap-2">
                    {TASK_TYPE_ICON_OPTIONS.map((option) => {
                      const Icon = option.icon
                      const active = taskTypeForm.icon === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTaskTypeForm((prev) => ({ ...prev, icon: option.value }))}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-md border transition-colors",
                            active ? "border-primary bg-primary/5 text-foreground" : "hover:bg-muted/40"
                          )}
                          title={option.label}
                        >
                          <Icon className="size-3.5 stroke-[1.8]" />
                        </button>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>名称</Label>
              <Input value={taskTypeForm.name} onChange={(e) => setTaskTypeForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="例如：校对" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>描述</Label>
            <Textarea value={taskTypeForm.description} onChange={(e) => setTaskTypeForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={saveTaskType}>{editingTaskType ? "保存类型" : "创建类型"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CommandDialog({
  open,
  onOpenChange,
  editingCommand,
  defaultCategoryId,
  taskTypes,
  currentTerminal,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCommand: Extension | null
  defaultCategoryId: string
  taskTypes: TaskType[]
  currentTerminal: TerminalGroupFilter
}) {
  const [commandForm, setCommandForm] = useState(() => createCommandForm(editingCommand, defaultCategoryId))
  const [slashState, setSlashState] = useState<{ slashIndex: number; query: string } | null>(null)
  const [slashActiveIndex, setSlashActiveIndex] = useState(0)
  const promptRef = useRef<HTMLTextAreaElement | null>(null)
  const createExtension = useCreateExtension()
  const updateExtension = useUpdateExtension()
  const { data: extensions = [] } = useExtensions()

  const mentionableItems = useMemo(() => {
    const skills = extensions
      .filter((item) => item.type === "skill")
      .map((item) => ({
        id: item.id,
        name: item.name,
        insertText: `/${item.name}`,
        description: item.description,
        icon: item.icon,
        typeLabel: "技能",
      }))
    const tools = extensions
      .filter((item) => item.type === "tool")
      .map((item) => ({
        id: item.id,
        name: item.name,
        insertText: `/${item.name}`,
        description: item.description,
        icon: item.icon,
        typeLabel: "工具",
      }))
    return { skills, tools }
  }, [extensions])

  const slashItems = useMemo(() => {
    const keyword = slashState?.query ?? ""
    const filterItems = (items: typeof mentionableItems.skills) =>
      keyword
        ? items.filter((item) =>
          `${item.name} ${item.description}`.toLowerCase().includes(keyword)
        )
        : items
    return {
      skills: filterItems(mentionableItems.skills).slice(0, 8),
      tools: filterItems(mentionableItems.tools).slice(0, 8),
    }
  }, [mentionableItems, slashState?.query])

  const slashFlatItems = useMemo(
    () => [
      ...slashItems.skills.map((item) => ({ ...item, value: `skill-${item.id}` })),
      ...slashItems.tools.map((item) => ({ ...item, value: `tool-${item.id}` })),
    ],
    [slashItems.skills, slashItems.tools]
  )
  const safeSlashActiveIndex = slashFlatItems.length === 0 ? 0 : Math.min(slashActiveIndex, slashFlatItems.length - 1)

  const referencedItems = useMemo(() => {
    const allItems = [...mentionableItems.skills, ...mentionableItems.tools]
    return allItems.filter((item) => {
      const pattern = new RegExp(`(^|\\s)/${escapeRegExp(item.name)}(?=\\s|$|[,.!?:;])`)
      return pattern.test(commandForm.starterPrompt)
    })
  }, [commandForm.starterPrompt, mentionableItems.skills, mentionableItems.tools])

  const showSlashPanel = Boolean(
    slashState && (slashItems.skills.length > 0 || slashItems.tools.length > 0)
  )

  const updatePromptValue = (value: string, caret?: number) => {
    setCommandForm((prev) => ({ ...prev, starterPrompt: value }))
    if (typeof caret !== "number") {
      setSlashState(null)
      return
    }
    setSlashState(getSlashQuery(value, caret))
    setSlashActiveIndex(0)
  }

  const handlePromptSelect = (itemName: string) => {
    if (!promptRef.current || !slashState) return
    const textarea = promptRef.current
    const value = commandForm.starterPrompt
    const before = value.slice(0, slashState.slashIndex)
    const after = value.slice(textarea.selectionStart)
    const nextValue = `${before}/${itemName} ${after}`
    const nextCaret = `${before}/${itemName} `.length
    updatePromptValue(nextValue, nextCaret)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCaret, nextCaret)
    })
  }

  const syncSlashStateFromTextarea = () => {
    const textarea = promptRef.current
    if (!textarea) return
    const caret = textarea.selectionStart ?? textarea.value.length
    setSlashState(getSlashQuery(textarea.value, caret))
  }

  const removeReferencedItem = (itemName: string) => {
    const nextValue = commandForm.starterPrompt
      .replace(new RegExp(`(^|\\s)/${escapeRegExp(itemName)}(?=\\s|$|[,.!?:;])`, "g"), " ")
      .replace(/\s{2,}/g, " ")
      .trim()
    updatePromptValue(nextValue, nextValue.length)
    requestAnimationFrame(() => promptRef.current?.focus())
  }

  const saveCommand = () => {
    const payload = {
      type: "agent" as const,
      source: "admin" as const,
      developer: "管理员",
      scope: "all" as const,
      categoryId: commandForm.categoryId || undefined,
      name: commandForm.name.trim(),
      description: commandForm.description.trim(),
      starterPrompt: commandForm.starterPrompt.trim(),
      terminals: editingCommand?.terminals ?? [currentTerminal],
      status: editingCommand?.status ?? "enabled" as ExtensionStatus,
    }
    if (!payload.name || !payload.description) return

    if (editingCommand) {
      updateExtension.mutate({ id: editingCommand.id, body: payload }, { onSuccess: () => onOpenChange(false) })
      return
    }
    createExtension.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingCommand ? "编辑快捷指令" : "新建快捷指令"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>名称</Label>
            <Input value={commandForm.name} onChange={(e) => setCommandForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="例如：错别字 / 语法" />
          </div>
          <div className="space-y-1.5">
            <Label>任务类型</Label>
            <Select value={commandForm.categoryId || "uncategorized"} onValueChange={(value) => setCommandForm((prev) => ({ ...prev, categoryId: value === "uncategorized" ? "" : value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="uncategorized">未分类</SelectItem>
                {taskTypes.map((taskType) => (
                  <SelectItem key={taskType.id} value={taskType.id}>
                    <TaskTypeIcon taskType={taskType} className="size-6" />
                    {taskType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>描述</Label>
            <Textarea value={commandForm.description} onChange={(e) => setCommandForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>提示词</Label>
            <Popover open={showSlashPanel}>
              <PopoverTrigger asChild>
                <div className="rounded-xl border bg-background">
                  <Textarea
                    ref={promptRef}
                    value={commandForm.starterPrompt}
                    onChange={(e) => updatePromptValue(e.target.value, e.target.selectionStart ?? e.target.value.length)}
                    onClick={() => syncSlashStateFromTextarea()}
                    onKeyUp={() => syncSlashStateFromTextarea()}
                    onKeyDown={(e) => {
                      if (
                        e.key === "/" &&
                        !e.metaKey &&
                        !e.ctrlKey &&
                        !e.altKey &&
                        !e.shiftKey
                      ) {
                        const textarea = e.currentTarget
                        const start = textarea.selectionStart ?? textarea.value.length
                        const end = textarea.selectionEnd ?? textarea.value.length
                        const nextValue = `${textarea.value.slice(0, start)}/${textarea.value.slice(end)}`
                        const nextCaret = start + 1
                        setSlashState(getSlashQuery(nextValue, nextCaret))
                        setSlashActiveIndex(0)
                      }
                      if (!showSlashPanel || slashFlatItems.length === 0) return
                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setSlashActiveIndex((prev) => (prev + 1) % slashFlatItems.length)
                        return
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault()
                        setSlashActiveIndex((prev) => (prev - 1 + slashFlatItems.length) % slashFlatItems.length)
                        return
                      }
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handlePromptSelect(slashFlatItems[safeSlashActiveIndex]?.name ?? "")
                        return
                      }
                      if (e.key === "Escape") {
                        e.preventDefault()
                        setSlashState(null)
                      }
                    }}
                    onBlur={() => window.setTimeout(() => setSlashState(null), 120)}
                    rows={6}
                    className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                    placeholder="输入提示词"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="bottom"
                className="w-[var(--radix-popover-trigger-width)] p-0"
              >
                <Command shouldFilter={false}>
                  <CommandList className="max-h-64">
                    <CommandEmpty>没有匹配的技能或工具</CommandEmpty>
                    {slashItems.skills.length > 0 ? (
                      <CommandGroup heading="技能">
                        {slashItems.skills.map((item, index) => (
                          <CommandItem
                            key={item.id}
                            value={`skill-${item.id}`}
                            onSelect={() => handlePromptSelect(item.name)}
                            onMouseEnter={() => setSlashActiveIndex(index)}
                            className={cn(index === safeSlashActiveIndex && "bg-accent text-accent-foreground")}
                          >
                            <span className="flex size-7 items-center justify-center rounded-md border bg-muted/40 text-sm">{item.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{item.insertText}</div>
                              <div className="truncate text-xs text-muted-foreground">{item.description}</div>
                            </div>
                            <span className="text-xs text-muted-foreground">{item.typeLabel}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : null}
                    {slashItems.tools.length > 0 ? (
                      <CommandGroup heading="工具">
                        {slashItems.tools.map((item, index) => (
                          <CommandItem
                            key={item.id}
                            value={`tool-${item.id}`}
                            onSelect={() => handlePromptSelect(item.name)}
                            onMouseEnter={() => setSlashActiveIndex(index + slashItems.skills.length)}
                            className={cn(index + slashItems.skills.length === safeSlashActiveIndex && "bg-accent text-accent-foreground")}
                          >
                            <span className="flex size-7 items-center justify-center rounded-md border bg-muted/40 text-sm">
                              {item.icon || <Wrench className="size-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{item.insertText}</div>
                              <div className="truncate text-xs text-muted-foreground">{item.description}</div>
                            </div>
                            <span className="text-xs text-muted-foreground">{item.typeLabel}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : null}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {referencedItems.length > 0 ? (
              <div className="flex flex-wrap gap-2 rounded-lg border border-dashed px-3 py-2">
                {referencedItems.map((item) => (
                  <span
                    key={`${item.typeLabel}-${item.id}`}
                    className="inline-flex items-center gap-2 rounded-full border bg-muted/30 px-2.5 py-1 text-xs"
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-background text-[10px]">
                      {item.icon || (item.typeLabel === "工具" ? <Wrench className="size-3" /> : null)}
                    </span>
                    <span>{item.name}</span>
                    <button
                      type="button"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => removeReferencedItem(item.name)}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="text-xs text-muted-foreground">
              输入 `/` 可快速插入技能或工具，支持上下选择、回车插入，例如 `/format-proofread`
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={saveCommand}>
            <Wand2 className="size-4" />
            {editingCommand ? "保存快捷指令" : "创建快捷指令"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SkillsManagementContent() {
  const { data: extensions = [], isLoading } = useExtensions()
  const updateExtension = useUpdateExtension()
  const deleteExtension = useDeleteExtension()
  const [keyword, setKeyword] = useState("")
  const [sourceFilter, setSourceFilter] = useState<"all" | ExtensionSource>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | ExtensionStatus>("all")
  const [scopeFilter, setScopeFilter] = useState<"all" | ExtensionScope>("all")
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [uploadSkillOpen, setUploadSkillOpen] = useState(false)
  const [skillEditOpen, setSkillEditOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Extension | null>(null)
  const [scopeSkill, setScopeSkill] = useState<Extension | null>(null)

  const skills = extensions.filter((item) => item.type === "skill").filter((item) => {
    const matchKeyword = !keyword.trim() || `${item.name} ${item.description}`.toLowerCase().includes(keyword.trim().toLowerCase())
    const matchSource = sourceFilter === "all" || item.source === sourceFilter
    const matchStatus = statusFilter === "all" || item.status === statusFilter
    const matchScope = scopeFilter === "all" || item.scope === scopeFilter
    return matchKeyword && matchSource && matchStatus && matchScope
  })
  const allSelected = skills.length > 0 && skills.every((skill) => selectedSkillIds.includes(skill.id))

  const toggleSkillSelection = (id: string) => {
    setSelectedSkillIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelectedSkillIds(allSelected ? [] : skills.map((skill) => skill.id))
  }

  const updateSkillTerminals = (skill: Extension, terminals: ExtensionTerminal[]) => {
    if (terminals.length === 0) return
    updateExtension.mutate({ id: skill.id, body: { terminals } })
  }

  const batchUpdateStatus = (status: ExtensionStatus) => {
    selectedSkillIds.forEach((id) => updateExtension.mutate({ id, body: { status } }))
    setSelectedSkillIds([])
  }

  const batchDelete = () => {
    selectedSkillIds.forEach((id) => deleteExtension.mutate(id))
    setSelectedSkillIds([])
  }

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">技能管理</CardTitle>
          <CardDescription>技能是底层能力资产，用于提供工具调用、知识处理和流程执行能力。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="搜索技能名称或描述" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as "all" | ExtensionSource)}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | ExtensionStatus)}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={scopeFilter} onValueChange={(value) => setScopeFilter(value as "all" | ExtensionScope)}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCOPE_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button size="sm" className="shrink-0" onClick={() => setUploadSkillOpen(true)}>
              <Plus className="size-4" />
              上架技能
            </Button>
          </div>

          {selectedSkillIds.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm text-muted-foreground">已选择 {selectedSkillIds.length} 项</div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => batchUpdateStatus("enabled")}>批量启用</Button>
                <Button size="sm" variant="outline" onClick={() => batchUpdateStatus("disabled")}>批量停用</Button>
                <Button size="sm" variant="outline" onClick={batchDelete}>批量删除</Button>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <Skeleton className="h-[420px] w-full rounded-xl" />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>终端</TableHead>
                    <TableHead>使用范围</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">使用量</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        <Checkbox checked={selectedSkillIds.includes(skill.id)} onCheckedChange={() => toggleSkillSelection(skill.id)} />
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <div className="font-medium">{skill.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{skill.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{EXTENSION_SOURCE_LABELS[skill.source]}</TableCell>
                      <TableCell>
                        <TerminalMultiSelect
                          value={skill.terminals}
                          onChange={(terminals) => updateSkillTerminals(skill, terminals)}
                          className="h-auto min-h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={skill.scope}
                            onValueChange={(value) =>
                              updateExtension.mutate({ id: skill.id, body: { scope: value as ExtensionScope } })
                            }
                          >
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {SCOPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {skill.scope === "dept" ? (
                            <Button size="sm" variant="outline" onClick={() => setScopeSkill(skill)}>
                              配置范围
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                            checked={skill.status === "enabled"}
                            onCheckedChange={(checked) =>
                              updateExtension.mutate({
                                id: skill.id,
                                body: { status: checked ? "enabled" : "disabled" },
                              })
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{skill.usageCount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon-xs" variant="ghost">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingSkill(skill); setSkillEditOpen(true) }}>
                              <Pencil className="size-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteExtension.mutate(skill.id)} className="text-destructive">
                              <Trash2 className="size-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UploadSkillDialog open={uploadSkillOpen} onOpenChange={setUploadSkillOpen} />
      <SkillDialog
        key={`${editingSkill?.id ?? "edit"}-${skillEditOpen ? "open" : "closed"}`}
        open={skillEditOpen}
        onOpenChange={(nextOpen) => {
          setSkillEditOpen(nextOpen)
          if (!nextOpen) setEditingSkill(null)
        }}
        editingSkill={editingSkill}
      />
      <ScopeConfigDialog
        key={`${scopeSkill?.id ?? "none"}-${scopeSkill ? "open" : "closed"}`}
        open={Boolean(scopeSkill)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setScopeSkill(null)
        }}
        extension={scopeSkill}
      />
    </div>
  )
}

function CommandsManagementContent() {
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | ExtensionStatus>("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [terminalFilter, setTerminalFilter] = useState<TerminalGroupFilter>("word")
  const [taskTypeOpen, setTaskTypeOpen] = useState(false)
  const [editingTaskType, setEditingTaskType] = useState<TaskType | null>(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [editingCommand, setEditingCommand] = useState<Extension | null>(null)

  const { data: extensions = [], isLoading: extensionsLoading } = useExtensions()
  const { data: taskTypes = [], isLoading: taskTypesLoading } = useTaskTypes()
  const updateExtension = useUpdateExtension()
  const deleteExtension = useDeleteExtension()
  const deleteTaskType = useDeleteTaskType()

  const commands = extensions.filter((item) => item.type === "agent")
  const terminalScopedTaskTypes = taskTypes.filter((item) => item.terminals.includes(terminalFilter))
  const terminalScopedCommands = commands.filter((item) => item.terminals.includes(terminalFilter))
  const safeCategoryFilter =
    categoryFilter === "all" || categoryFilter === "uncategorized" || terminalScopedTaskTypes.some((item) => item.id === categoryFilter)
      ? categoryFilter
      : "all"
  const filteredCommands = terminalScopedCommands.filter((item) => {
    const matchKeyword = !keyword.trim() || `${item.name} ${item.description}`.toLowerCase().includes(keyword.trim().toLowerCase())
    const matchCategory =
      safeCategoryFilter === "all" ||
      (safeCategoryFilter === "uncategorized" ? !item.categoryId : item.categoryId === safeCategoryFilter)
    const matchStatus = statusFilter === "all" || item.status === statusFilter
    return matchKeyword && matchCategory && matchStatus
  })

  const loading = extensionsLoading || taskTypesLoading

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">终端分组</CardTitle>
          <CardDescription>先按终端区分快捷指令，再结合任务类型和状态继续筛选。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-3 px-1">
            {COMMAND_TERMINAL_GROUPS.map((group) => {
              const count = commands.filter((item) => item.terminals.includes(group.value)).length

              return (
                <button
                  key={group.value}
                  type="button"
                  onClick={() => setTerminalFilter(group.value)}
                  className={cn(
                    "w-[220px] shrink-0 rounded-xl border px-4 py-3 text-left transition-colors",
                    terminalFilter === group.value ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{group.label}</div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{group.description}</div>
                </button>
              )
            })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base">任务类型</CardTitle>
              <Button size="icon-sm" variant="outline" onClick={() => { setEditingTaskType(null); setTaskTypeOpen(true) }}>
                <Plus className="size-4" />
              </Button>
            </div>
            <CardDescription>客户端第一层入口，用于组织快捷指令。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <Skeleton className="h-[420px] w-full rounded-xl" />
            ) : (
              <>
                {terminalScopedTaskTypes.map((taskType) => (
                  <div
                    key={taskType.id}
                    className={cn(
                      "relative rounded-xl border px-3 py-3",
                      safeCategoryFilter === taskType.id ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => setCategoryFilter(taskType.id)}
                        className="block w-full min-w-0 text-left"
                      >
                        <div className="flex items-center gap-2 pr-8">
                          <TaskTypeIcon taskType={taskType} className="size-8 rounded-lg" />
                          <div className="min-w-0 font-medium">{taskType.name}</div>
                        </div>
                        <div className="mt-2 truncate text-xs leading-5 text-muted-foreground">{taskType.description}</div>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon-xs" variant="ghost" className="absolute right-3 top-3">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingTaskType(taskType); setTaskTypeOpen(true) }}>
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteTaskType.mutate(taskType.id)} className="text-destructive">
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">快捷指令</CardTitle>
            <CardDescription>{`当前仅展示投放到「${EXTENSION_TERMINAL_LABELS[terminalFilter]}」的快捷指令。`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-[280px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="搜索指令名称或描述" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | ExtensionStatus)}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button size="sm" className="shrink-0" onClick={() => { setEditingCommand(null); setCommandOpen(true) }}>
                <Plus className="size-4" />
                新建快捷指令
              </Button>
            </div>

            {loading ? (
              <Skeleton className="h-[420px] w-full rounded-xl" />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>快捷指令</TableHead>
                      <TableHead>任务类型</TableHead>
                      <TableHead>提示词</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommands.map((command) => {
                      const taskType = taskTypes.find((item) => item.id === command.categoryId)
                      return (
                        <TableRow key={command.id}>
                          <TableCell>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{command.name}</span>
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">{command.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {taskType ? (
                              <div className="inline-flex items-center gap-2 rounded-md border px-2 py-1">
                                <TaskTypeIcon taskType={taskType} className="size-5 rounded-sm border-0 bg-transparent shadow-none" />
                                <span className="text-sm">{taskType.name}</span>
                              </div>
                            ) : <span className="text-sm text-muted-foreground">未分类</span>}
                          </TableCell>
                          <TableCell className="max-w-[320px]">
                            <div className="line-clamp-2 text-sm text-muted-foreground">{command.starterPrompt || "未配置"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={command.status === "enabled"}
                                onCheckedChange={(checked) =>
                                  updateExtension.mutate({
                                    id: command.id,
                                    body: { status: checked ? "enabled" : "disabled" },
                                  })
                                }
                              />
                              <span className="text-sm text-muted-foreground">{command.status === "enabled" ? "启用中" : "已停用"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon-xs" variant="ghost">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditingCommand(command); setCommandOpen(true) }}>
                                  <Pencil className="size-4" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteExtension.mutate(command.id)} className="text-destructive">
                                  <Trash2 className="size-4" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskTypeDialog
        key={`${editingTaskType?.id ?? "new"}-${taskTypeOpen ? "open" : "closed"}`}
        open={taskTypeOpen}
        onOpenChange={setTaskTypeOpen}
        editingTaskType={editingTaskType}
        currentTerminal={terminalFilter}
      />
      <CommandDialog
        key={`${editingCommand?.id ?? "new"}-${commandOpen ? "open" : "closed"}-${safeCategoryFilter}`}
        open={commandOpen}
        onOpenChange={setCommandOpen}
        editingCommand={editingCommand}
        defaultCategoryId={safeCategoryFilter !== "all" && safeCategoryFilter !== "uncategorized" ? safeCategoryFilter : ""}
        taskTypes={taskTypes}
        currentTerminal={terminalFilter}
      />
    </div>
  )
}

export function SkillsManagementPage() {
  return (
    <div>
      <PageHeader
        title="技能管理"
        description="参考任务后台的筛选 + 表格交互，聚焦底层能力资产的浏览与治理。"
      />
      <SkillsManagementContent />
    </div>
  )
}

export function CommandsManagementPage() {
  return (
    <div>
      <PageHeader
        title="快捷指令"
        description="左侧管理任务类型，右侧管理快捷指令列表，客户端任务入口直接映射这里的分类。"
      />
      <CommandsManagementContent />
    </div>
  )
}
