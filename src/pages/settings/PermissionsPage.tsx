import { useState } from "react"
import { Lock, Users, ShieldCheck, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { PermissionMatrix } from "@/components/permissions/PermissionMatrix"
import { ThreeElementPanel } from "@/components/permissions/ThreeElementPanel"
import { useRoles } from "@/hooks/usePermissions"
import type { Role } from "@/types/permissions"
import { cn } from "@/lib/utils"

type Selection = { type: "role"; id: string } | { type: "three_element" }

const PRESET_ROLE_IDS = ["super_admin", "sys_admin", "sec_admin", "audit_admin", "dept_admin"] as const

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

export function PermissionsPage() {
  const { data: roles, isLoading } = useRoles()
  const [selection, setSelection] = useState<Selection>({ type: "three_element" })
  const presetRoles = PRESET_ROLE_IDS
    .map((id) => roles?.find((r) => r.id === id))
    .filter((r): r is Role => !!r)

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

            {/* Preset roles */}
            <div className="mb-1">
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
    </div>
  )
}
