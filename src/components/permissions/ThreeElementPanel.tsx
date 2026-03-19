import { CheckCircle2, AlertTriangle, ShieldCheck, UserCog, FileSearch, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useRoles, useThreeElement, useSetThreeElementMode } from "@/hooks/usePermissions"
import { THREE_ELEMENT_ROLE_IDS } from "@/types/permissions"
import { cn } from "@/lib/utils"

const ROLE_META: Record<string, { icon: React.ElementType; color: string; who: string; canDo: string; cannotDo: string }> = {
  sys_admin: {
    icon: UserCog, color: "#2563EB",
    who: "IT 运维人员",
    canDo: "用户账号管理（查看 + 编辑）、模型配置、版本升级、授权管理、品牌设置、SSO 配置",
    cannotDo: "修改 DLP 规则或访问控制策略；查看或导出审计日志；调整权限与安全策略",
  },
  sec_admin: {
    icon: ShieldCheck, color: "#DC2626",
    who: "信息安全负责人",
    canDo: "制定与修改 DLP 规则、配置访问控制与安全策略（规则设置），可查看并编辑 DLP 和规则设置",
    cannotDo: "管理用户账号或部门；修改系统基础配置（模型/版本/品牌/SSO）；查看或修改审计日志",
  },
  audit_admin: {
    icon: FileSearch, color: "#7C3AED",
    who: "合规/审计部门",
    canDo: "查看全员全量操作审计日志（含三元管理员操作），用于合规核查与安全事件溯源",
    cannotDo: "修改任何系统配置、安全策略或用户账号；删除或篡改审计记录",
  },
}

export function ThreeElementPanel() {
  const { data: roles, isLoading: loadingRoles } = useRoles()
  const { data: status, isLoading: loadingStatus } = useThreeElement()
  const setModeMutation = useSetThreeElementMode()

  const threeRoles = THREE_ELEMENT_ROLE_IDS.map((id) =>
    roles?.find((r) => r.id === id)
  )

  const isCompliant = status?.isCompliant ?? false
  const isThreeElement = status?.mode === "three_element"

  if (loadingRoles || loadingStatus) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="rounded-xl border p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">三元管理模式</span>
            <Badge variant={isThreeElement ? "default" : "secondary"} className="text-xs">
              {isThreeElement ? "已启用" : "简化模式"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {isThreeElement
              ? "等保 2.0 / 军工合规模式：系统管理员、安全管理员、审计管理员三员分立，权力互相制约"
              : "简化模式：超级管理员 + 审计员，适合非军工客户"}
          </p>
        </div>
        <Switch
          checked={isThreeElement}
          disabled={setModeMutation.isPending}
          onCheckedChange={(checked) =>
            setModeMutation.mutate(checked ? "three_element" : "simplified")
          }
        />
      </div>

      {/* Compliance status */}
      <div className={cn(
        "rounded-xl border px-4 py-3 flex items-center gap-3",
        isCompliant
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
          : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
      )}>
        {isCompliant
          ? <CheckCircle2 className="size-4 text-green-600 shrink-0" />
          : <AlertTriangle className="size-4 text-yellow-600 shrink-0" />
        }
        <div>
          <p className={cn("text-sm font-medium", isCompliant ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400")}>
            {isCompliant ? "三员分立合规，满足等保 2.0 要求" : "合规检查未通过，请完成角色分配"}
          </p>
          {status?.conflicts && status.conflicts.length > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
              检测到 {status.conflicts.length} 处兼任冲突，请及时处理
            </p>
          )}
        </div>
      </div>

      {/* Three role cards */}
      <div className="grid grid-cols-3 gap-3">
        {THREE_ELEMENT_ROLE_IDS.map((roleId) => {
          const role = threeRoles.find((r) => r?.id === roleId)
          const meta = ROLE_META[roleId]
          const Icon = meta.icon
          const hasUser = (role?.userCount ?? 0) > 0

          return (
            <Card key={roleId} className={cn("border-l-4", !hasUser && "border-l-yellow-400")}>
              <CardHeader className="pb-2" style={{ borderLeftColor: meta.color }}>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${meta.color}18` }}>
                    <Icon className="size-4" style={{ color: meta.color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{role?.name ?? roleId}</CardTitle>
                    <p className="text-xs text-muted-foreground">{meta.who}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Assigned users */}
                <div>
                  <Label className="text-xs text-muted-foreground">当前绑定</Label>
                  {role?.users && role.users.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {role.users.map((u) => (
                        <div key={u.id} className="flex items-center gap-1.5">
                          <div
                            className="size-5 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
                            style={{ backgroundColor: meta.color }}
                          >
                            {u.displayName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{u.displayName}</div>
                            <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600">
                      <AlertTriangle className="size-3" />未分配用户
                    </div>
                  )}
                </div>

                {/* Can / Cannot */}
                <div className="space-y-1.5 pt-1 border-t">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-0.5">可以做</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{meta.canDo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-0.5">不能做</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{meta.cannotDo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Constraints note */}
      <div className="rounded-xl bg-muted/50 px-4 py-3 flex items-start gap-2.5">
        <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
          <p className="font-medium text-foreground">三元管理关键约束</p>
          <p>系统管理员的全部操作均被审计，且系统管理员无法查看自己被记录的审计日志。</p>
          <p>审计管理员只对上级监管机构（如保密委）汇报，不对系统管理员负责。</p>
          <p>安全管理员制定的 DLP 规则和访问控制策略，系统管理员无权修改或绕过。</p>
          <p className="text-yellow-600 dark:text-yellow-400">注：三元角色账号的创建和变更建议启用双人操作确认机制（将在后续版本支持）。</p>
        </div>
      </div>
    </div>
  )
}
