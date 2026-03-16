import { useState } from "react"
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, Users, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DeptDialog } from "./DeptDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import type { OrgDept } from "@/types/user"

interface DeptTreeProps {
  depts: OrgDept[]
  selectedId: string | null          // null = 全部成员
  onSelect: (id: string | null) => void
  totalMemberCount: number
}

interface TreeNode extends OrgDept {
  children: TreeNode[]
}

function buildTree(depts: OrgDept[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  depts.forEach((d) => map.set(d.id, { ...d, children: [] }))

  const roots: TreeNode[] = []
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  // 排序
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder)
    nodes.forEach((n) => sort(n.children))
  }
  sort(roots)
  return roots
}

interface TreeItemProps {
  node: TreeNode
  depth: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  allDepts: OrgDept[]
  onEdit: (dept: OrgDept) => void
  onAddChild: (parent: OrgDept) => void
  onDelete: (dept: OrgDept) => void
}

function TreeItem({ node, depth, selectedId, onSelect, allDepts, onEdit, onAddChild, onDelete }: TreeItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [hovered, setHovered] = useState(false)
  const hasChildren = node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer select-none",
          "hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 展开/收起 */}
        <button
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
        >
          {hasChildren
            ? (expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />)
            : <span className="size-3.5 inline-block" />
          }
        </button>

        <Building2 className="shrink-0 size-3.5 text-muted-foreground" />

        <span className="flex-1 truncate text-sm">{node.name}</span>

        {/* 成员数 */}
        {!hovered && (
          <span className="text-xs text-muted-foreground tabular-nums">{node.memberCount}</span>
        )}

        {/* 悬浮操作 */}
        {hovered && (
          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              title="新增子部门"
              onClick={() => onAddChild(node)}
            >
              <Plus className="size-3" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              title="编辑部门"
              onClick={() => onEdit(node)}
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-destructive"
              title="删除部门"
              onClick={() => onDelete(node)}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              allDepts={allDepts}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DeptTree({ depts, selectedId, onSelect, totalMemberCount }: DeptTreeProps) {
  const tree = buildTree(depts)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [editingDept, setEditingDept] = useState<OrgDept | undefined>()
  const [parentDept, setParentDept] = useState<OrgDept | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<OrgDept | undefined>()

  const handleEdit = (dept: OrgDept) => {
    setDialogMode("edit")
    setEditingDept(dept)
    setParentDept(undefined)
    setDialogOpen(true)
  }

  const handleAddChild = (parent: OrgDept) => {
    setDialogMode("add")
    setEditingDept(undefined)
    setParentDept(parent)
    setDialogOpen(true)
  }

  const handleAddRoot = () => {
    setDialogMode("add")
    setEditingDept(undefined)
    setParentDept(undefined)
    setDialogOpen(true)
  }

  const handleDelete = (dept: OrgDept) => {
    setDeleteTarget(dept)
  }

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-medium">部门</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" title="新增顶级部门" onClick={handleAddRoot}>
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* 全部成员 */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md mx-1 mt-1",
          "hover:bg-accent/50 transition-colors text-sm",
          selectedId === null && "bg-accent text-accent-foreground font-medium"
        )}
        onClick={() => onSelect(null)}
      >
        <Users className="size-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1">全部成员</span>
        <span className="text-xs text-muted-foreground tabular-nums">{totalMemberCount}</span>
      </div>

      {/* 树 */}
      <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5">
        {tree.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
            allDepts={depts}
            onEdit={handleEdit}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 新增/编辑对话框 */}
      <DeptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        dept={editingDept}
        parentDept={parentDept}
        allDepts={depts}
      />

      {/* 删除确认 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(undefined) }}
        title="删除部门"
        description={`确认删除「${deleteTarget?.name}」？删除后无法恢复，该部门下的成员将需要重新分配。`}
        confirmLabel="删除"
        confirmVariant="destructive"
        onConfirm={() => setDeleteTarget(undefined)}
      />
    </div>
  )
}
