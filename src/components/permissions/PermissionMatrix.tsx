import { useEffect, useState } from "react"
import { Lock, Check, CheckCircle2, Users, Trash2, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useDeleteRole, useUpdateRole } from "@/hooks/usePermissions"
import {
  ENDUSER_PERMISSION_REGISTRY,
  ENDUSER_ROLE_IDS,
  MODULE_LABELS,
  MODULE_ORDER,
  PERMISSION_REGISTRY,
  THREE_ELEMENT_ROLE_IDS,
} from "@/types/permissions"
import type { Role } from "@/types/permissions"
import { cn } from "@/lib/utils"

const TYPE_LABELS: Record<string, string> = {
  three_element: "三元管理",
  builtin: "内置角色",
  custom: "自定义",
}

const ENDUSER_MODULES = ["users", "extensions", "skills", "tools", "connectors", "agents"] as const

type EndUserModule = (typeof ENDUSER_MODULES)[number]

const ENDUSER_MODULE_LABELS: Record<EndUserModule, string> = {
  users: "用户管理",
  extensions: "扩展管理",
  skills: "技能",
  tools: "工具",
  connectors: "连接器",
  agents: "智能体",
}

const DEPT_ADMIN_SCOPE_HINTS: Partial<Record<EndUserModule, string>> = {
  users: "仅限部门范围：部门树仅显示所在部门及下属部门；用户列表仅显示本部门成员。",
  extensions: "仅限部门范围：扩展列表仅展示本部门成员分享范围内的扩展。",
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
    const next = new Set(role.permissionIds)
    if ((ENDUSER_ROLE_IDS as readonly string[]).includes(role.id)) {
      for (const mod of ENDUSER_MODULES) {
        const readId = `${mod}.read`
        const writeId = `${mod}.write`
        if (next.has(writeId)) next.add(readId)
      }
    }
    setSelected(next)
    setSaved(false)
  }, [role.id])

  const toggle = (_id: string) => {
    // All roles are locked; editing is not permitted.
    return
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
  const isEndUserRole = (ENDUSER_ROLE_IDS as readonly string[]).includes(role.id)
  const isDeptAdmin = role.id === "dept_admin"
  const endUserModulesForRole: readonly EndUserModule[] = isDeptAdmin
    ? ENDUSER_MODULES.filter((m) => m === "users" || m === "extensions")
    : ENDUSER_MODULES.filter((m) => m !== "users" && m !== "extensions")

  const modules = MODULE_ORDER.map((mod) => ({
    mod,
    perms: PERMISSION_REGISTRY.filter((p) => p.module === mod),
  }))

  const endUserDesc = (id: string) =>
    ENDUSER_PERMISSION_REGISTRY.find((p) => p.id === id)?.desc
    ?? PERMISSION_REGISTRY.find((p) => p.id === id)?.desc
    ?? ""

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
                <span className="ml-1">({role.users.map((u) => u.displayName).join("、")})</span>
              )}
            </div>
          </div>
          {!role.isLocked && (
            <Button
              variant="ghost"
              size="sm"
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

      {/* Permissions */}
      <div className="flex-1 px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">权限项目（查看）</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" strokeWidth={1.5} />权限内容不可修改
          </span>
        </div>

        {isEndUserRole ? (
          <div className="rounded-xl border overflow-hidden">
            {endUserModulesForRole.map((mod, idx) => {
              const label = ENDUSER_MODULE_LABELS[mod]
              const readId = `${mod}.read`
              const writeId = `${mod}.write`

              return (
                <div key={mod} className={cn("flex items-start gap-4 px-4 py-3", idx < endUserModulesForRole.length - 1 && "border-b")}>
                  <div className="w-20 shrink-0 pt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{label}</span>
                      {isDeptAdmin && (mod === "users" || mod === "extensions") && (
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={`${label} 权限范围说明`}
                              >
                                <HelpCircle className="size-3.5" strokeWidth={1.5} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={6} className="max-w-72">
                              <div className="leading-relaxed">{DEPT_ADMIN_SCOPE_HINTS[mod] ?? ""}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {(["read", "write"] as const).map((rw) => {
                      const id = rw === "read" ? readId : writeId
                      const active = selected.has(id)
                      const permLabel = rw === "read" ? "查看" : "编辑"
                      const desc = endUserDesc(id)

                      const onClick = () => {
                        // All roles are locked; editing is not permitted.
                        return
                      }

                      return (
                        <button
                          key={id}
                          onClick={onClick}
                          disabled={role.isLocked}
                          title={desc}
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
                          <div
                            className={cn(
                              "size-3.5 rounded shrink-0 flex items-center justify-center",
                              active ? "bg-primary" : "border border-border"
                            )}
                          >
                            {active && <Check className="size-2.5 text-white" strokeWidth={3} />}
                          </div>
                          {permLabel}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
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
                        <div
                          className={cn(
                            "size-3.5 rounded shrink-0 flex items-center justify-center",
                            active ? "bg-primary" : "border border-border"
                          )}
                        >
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
        )}

        {/* Save bar */}
        {!role.isLocked && (
          <div className="flex items-center gap-3 mt-4">
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "保存中..." : "保存"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(new Set(role.permissionIds))
                setSaved(false)
              }}
            >
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
