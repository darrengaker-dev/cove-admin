import { useState, useEffect } from "react"
import { Lock, CheckCircle2, Users, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useUpdateRole, useDeleteRole } from "@/hooks/usePermissions"
import { PERMISSION_REGISTRY, MODULE_LABELS, MODULE_ORDER, THREE_ELEMENT_ROLE_IDS } from "@/types/permissions"
import type { Role } from "@/types/permissions"

interface RoleSheetProps {
  role: Role | null
  open: boolean
  onClose: () => void
}

export function RoleSheet({ role, open, onClose }: RoleSheetProps) {
  const updateMutation = useUpdateRole()
  const deleteMutation = useDeleteRole()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (role) {
      setName(role.name)
      setDescription(role.description)
      setSelectedPerms(new Set(role.permissionIds))
      setSaved(false)
    }
  }, [role])

  if (!role) return null

  const isThreeElement = THREE_ELEMENT_ROLE_IDS.includes(role.id as typeof THREE_ELEMENT_ROLE_IDS[number])
  const byModule = MODULE_ORDER.map((mod) => ({
    mod,
    perms: PERMISSION_REGISTRY.filter((p) => p.module === mod),
  }))

  const togglePerm = (id: string) => {
    if (role.isLocked) return
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSaved(false)
  }

  const handleSave = () => {
    updateMutation.mutate(
      { id: role.id, body: { name, description, permissionIds: Array.from(selectedPerms) } },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500) } }
    )
  }

  const handleDelete = () => {
    if (!confirm(`确认删除角色「${role.name}」？已绑定该角色的用户将自动降级为普通用户。`)) return
    deleteMutation.mutate(role.id, { onSuccess: onClose })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
            <SheetTitle className="text-base">
              {role.isLocked ? role.name : (
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false) }}
                  className="h-7 text-base font-semibold border-0 p-0 focus-visible:ring-0"
                />
              )}
            </SheetTitle>
            {role.isLocked && <Lock className="size-3.5 text-muted-foreground" strokeWidth={1.5} />}
            <Badge variant="outline" className="text-xs ml-auto">
              {role.type === "three_element" ? "三元管理" : role.type === "builtin" ? "内置角色" : "自定义"}
            </Badge>
          </div>
          <SheetDescription className="text-xs">
            {role.isLocked ? role.description : (
              <Input
                value={description}
                onChange={(e) => { setDescription(e.target.value); setSaved(false) }}
                className="h-7 text-xs border-0 p-0 focus-visible:ring-0 text-muted-foreground"
                placeholder="角色描述"
              />
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Bound users */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-medium mb-2">
            <Users className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
            已绑定用户
            <Badge variant="secondary" className="text-xs py-0 ml-1">{role.userCount}</Badge>
          </div>
          {role.users.length > 0 ? (
            <div className="space-y-1.5">
              {role.users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                    {u.displayName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{u.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {role.userCount > 0 ? `共 ${role.userCount} 位用户，详情请在用户管理页查看` : "暂未分配用户"}
            </p>
          )}
        </div>

        <Separator className="my-4" />

        {/* Permission matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">权限明细</Label>
            {role.isLocked && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="size-3" strokeWidth={1.5} />系统预设，不可修改
              </span>
            )}
          </div>

          {byModule.map(({ mod, perms }) => {
            const activeInModule = perms.filter((p) => selectedPerms.has(p.id))
            if (role.isLocked && activeInModule.length === 0) return null
            return (
              <div key={mod}>
                <div className="text-xs text-muted-foreground mb-1.5 font-medium">{MODULE_LABELS[mod]}</div>
                <div className="grid grid-cols-1 gap-1">
                  {perms.map((perm) => {
                    const active = selectedPerms.has(perm.id)
                    if (role.isLocked && !active) return null
                    return (
                      <button
                        key={perm.id}
                        onClick={() => togglePerm(perm.id)}
                        disabled={role.isLocked}
                        className={cn(
                          "flex items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
                          role.isLocked
                            ? "cursor-default"
                            : active ? "bg-primary/5 border border-primary/20" : "bg-muted/30 hover:bg-muted/60",
                          active && !role.isLocked && "border border-primary/20"
                        )}
                      >
                        <div className={cn(
                          "size-4 shrink-0 rounded mt-0.5 flex items-center justify-center",
                          active ? "bg-primary" : "border border-border"
                        )}>
                          {active && <CheckCircle2 className="size-3 text-white" strokeWidth={2.5} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium">{perm.label}</div>
                          <div className="text-xs text-muted-foreground">{perm.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Three-element mutual exclusion note */}
        {isThreeElement && (
          <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-3 py-2.5">
            <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
              此为三元管理预设角色，与其他两个三元角色互斥。同一用户不得同时持有系统管理员、安全管理员、审计管理员中的任意两个角色。
            </p>
          </div>
        )}

        {/* Actions */}
        {!role.isLocked && (
          <div className="mt-5 flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="size-3.5" />删除角色
            </Button>
            <div className="flex items-center gap-2">
              {saved && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="size-3.5" />已保存
                </span>
              )}
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
