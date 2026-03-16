import { useState } from "react"
import { Plus, Lock, Users, ShieldCheck, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PermissionMatrix } from "@/components/permissions/PermissionMatrix"
import { ThreeElementPanel } from "@/components/permissions/ThreeElementPanel"
import { useRoles, useCreateRole } from "@/hooks/usePermissions"
import type { Role } from "@/types/permissions"
import { cn } from "@/lib/utils"

type Selection = { type: "role"; id: string } | { type: "three_element" }

function RoleListItem({ role, selected, onClick }: { role: Role; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
        selected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
      )}
    >
      <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
      <span className={cn("flex-1 text-sm truncate", selected && "font-medium")}>{role.name}</span>
      {role.isLocked && <Lock className="size-3 text-muted-foreground shrink-0" strokeWidth={1.5} />}
      <span className="text-xs text-muted-foreground shrink-0">{role.userCount} 人</span>
    </button>
  )
}

function CreateRoleDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const createMutation = useCreateRole()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const handleCreate = () => {
    if (!name.trim()) return
    createMutation.mutate(
      { name, description, permissionIds: [] },
      {
        onSuccess: (role) => {
          setName(""); setDescription("")
          onClose()
          onCreated(role.id)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base">新建自定义角色</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">角色名称</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：HR 专员" className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">角色描述</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简述该角色的职责范围" className="h-8 text-sm" />
          </div>
          <p className="text-xs text-muted-foreground">创建后可在右侧勾选具体权限</p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>取消</Button>
          <Button size="sm" onClick={handleCreate} disabled={!name.trim() || createMutation.isPending}>
            {createMutation.isPending ? "创建中..." : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PermissionsPage() {
  const { data: roles, isLoading } = useRoles()
  const [selection, setSelection] = useState<Selection>({ type: "three_element" })
  const [createOpen, setCreateOpen] = useState(false)

  const presetRoles = roles?.filter((r) => r.type !== "custom") ?? []
  const customRoles = roles?.filter((r) => r.type === "custom") ?? []

  const selectedRole: Role | undefined =
    selection.type === "role"
      ? roles?.find((r) => r.id === selection.id)
      : undefined

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="权限设置"
        description="基于 RBAC 模型管理角色与权限，内置三元管理合规模式满足等保 2.0 要求"
      />

      <div className="flex flex-1 min-h-0">
        {/* Left: role list */}
        <div className="w-52 shrink-0 border-r flex flex-col overflow-y-auto">
          <div className="p-3 space-y-1">
            {/* Three-element compliance entry */}
            <button
              onClick={() => setSelection({ type: "three_element" })}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                selection.type === "three_element"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/60"
              )}
            >
              <ShieldCheck className="size-3.5 shrink-0" strokeWidth={1.5} />
              <span className={cn("flex-1 text-sm", selection.type === "three_element" && "font-medium")}>
                三员合规
              </span>
              <ChevronRight className="size-3 text-muted-foreground" strokeWidth={1.5} />
            </button>

            <Separator className="my-2" />

            {/* Preset roles group */}
            <div className="mb-1">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Lock className="size-3" strokeWidth={1.5} />系统预设角色
              </div>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg mb-1" />)
                : presetRoles.map((role) => (
                  <RoleListItem
                    key={role.id}
                    role={role}
                    selected={selection.type === "role" && selection.id === role.id}
                    onClick={() => setSelection({ type: "role", id: role.id })}
                  />
                ))}
            </div>

            <Separator className="my-2" />

            {/* Custom roles group */}
            <div>
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>自定义角色</span>
                <Badge variant="secondary" className="text-xs py-0">{customRoles.length}</Badge>
              </div>
              {customRoles.map((role) => (
                <RoleListItem
                  key={role.id}
                  role={role}
                  selected={selection.type === "role" && selection.id === role.id}
                  onClick={() => setSelection({ type: "role", id: role.id })}
                />
              ))}
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors mt-1"
              >
                <Plus className="size-3.5" strokeWidth={1.5} />新建角色
              </button>
            </div>
          </div>

          {/* Bottom stat */}
          <div className="mt-auto px-4 py-3 border-t">
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div className="flex justify-between">
                <span>角色总数</span>
                <span>{roles?.length ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>总用户数</span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" strokeWidth={1.5} />
                  {roles?.reduce((sum, r) => sum + r.userCount, 0) ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: content panel */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {selection.type === "three_element" ? (
            <div className="p-6">
              <ThreeElementPanel />
            </div>
          ) : selectedRole ? (
            <PermissionMatrix
              role={selectedRole}
              onDeleted={() => setSelection({ type: "three_element" })}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              从左侧选择一个角色查看权限
            </div>
          )}
        </div>
      </div>

      <CreateRoleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => setSelection({ type: "role", id })}
      />
    </div>
  )
}
