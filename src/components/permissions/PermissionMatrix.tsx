import { useState, useEffect } from "react"
import { Lock, Check, CheckCircle2, Users, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useUpdateRole, useDeleteRole } from "@/hooks/usePermissions"
import { PERMISSION_REGISTRY, MODULE_LABELS, MODULE_ORDER, THREE_ELEMENT_ROLE_IDS } from "@/types/permissions"
import type { Role } from "@/types/permissions"
import { cn } from "@/lib/utils"

const TYPE_LABELS: Record<string, string> = {
  three_element: "三元管理",
  builtin: "内置角色",
  custom: "自定义",
}

interface Props {
  role: Role
  onDeleted: () => void
}

export function PermissionMatrix({ role, onDeleted }: Props) {
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()
  const [selected, setSelected] = useState<Set<string>>(new Set(role.permissionIds))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSelected(new Set(role.permissionIds))
    setSaved(false)
  }, [role.id])

  const toggle = (id: string) => {
    if (role.isLocked) return
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSaved(false)
  }

  const handleSave = () => {
    updateMutation.mutate(
      { id: role.id, body: { permissionIds: Array.from(selected) } },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500) } }
    )
  }

  const handleDelete = () => {
    if (!confirm(`确认删除角色「${role.name}」？`)) return
    deleteMutation.mutate(role.id, { onSuccess: onDeleted })
  }

  const isThreeElement = THREE_ELEMENT_ROLE_IDS.includes(role.id as typeof THREE_ELEMENT_ROLE_IDS[number])
  const modules = MODULE_ORDER.map((mod) => ({
    mod,
    perms: PERMISSION_REGISTRY.filter((p) => p.module === mod),
  }))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Role header */}
      <div className="px-6 py-5 border-b shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
              <span className="text-base font-semibold">{role.name}</span>
              <Badge variant="outline" className="text-xs font-normal">{TYPE_LABELS[role.type]}</Badge>
              {role.isLocked && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="size-3" strokeWidth={1.5} />系统预设角色
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
              <Users className="size-3" strokeWidth={1.5} />
              {role.userCount} 人
              {role.users.length > 0 && (
                <span className="ml-1">
                  ({role.users.map((u) => u.displayName).join("、")})
                </span>
              )}
            </div>
          </div>
          {!role.isLocked && (
            <Button
              variant="ghost" size="sm"
              className="text-destructive hover:text-destructive gap-1.5 shrink-0"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="size-3.5" />删除角色
            </Button>
          )}
        </div>

        {isThreeElement && (
          <div className="mt-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-3 py-2">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              三元管理角色，与其他两个三元角色互斥，同一用户不得同时持有其中两个。
            </p>
          </div>
        )}
      </div>

      {/* Permission matrix */}
      <div className="flex-1 px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            {role.isLocked ? "权限项目（只读）" : "权限项目"}
          </span>
          {role.isLocked && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="size-3" strokeWidth={1.5} />权限内容不可修改
            </span>
          )}
        </div>

        <div className="rounded-xl border overflow-hidden">
          {modules.map(({ mod, perms }, idx) => (
            <div
              key={mod}
              className={cn("flex items-start gap-4 px-4 py-3", idx < modules.length - 1 && "border-b")}
            >
              <div className="w-20 shrink-0 pt-0.5">
                <span className="text-sm font-medium">{MODULE_LABELS[mod]}</span>
              </div>
              <div className="flex flex-wrap gap-2 flex-1">
                {perms.map((perm) => {
                  const active = selected.has(perm.id)
                  return (
                    <button
                      key={perm.id}
                      onClick={() => toggle(perm.id)}
                      disabled={role.isLocked}
                      title={perm.desc}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm border transition-colors",
                        role.isLocked
                          ? active
                            ? "bg-primary/8 text-primary border-primary/20 cursor-default"
                            : "bg-muted/30 text-muted-foreground/50 border-transparent cursor-default"
                          : active
                            ? "bg-primary/8 text-primary border-primary/20 hover:bg-primary/12"
                            : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/80 hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "size-3.5 rounded shrink-0 flex items-center justify-center",
                        active ? "bg-primary" : "border border-border"
                      )}>
                        {active && <Check className="size-2.5 text-white" strokeWidth={3} />}
                      </div>
                      {perm.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Save bar */}
        {!role.isLocked && (
          <div className="flex items-center gap-3 mt-4">
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "保存中..." : "保存"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSelected(new Set(role.permissionIds)); setSaved(false) }}>
              恢复默认
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="size-4" />已保存
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
