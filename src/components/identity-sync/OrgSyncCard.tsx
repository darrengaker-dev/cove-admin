import { useState } from "react"
import { RefreshCw, CheckCircle2, AlertCircle, Clock, TestTube2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrgSyncSettings, useSaveOrgSyncSettings, useTestOrgSyncConnection, useTriggerOrgSync, useSyncLogs } from "@/hooks/useIdentitySync"
import type { OASyncSource, SyncFrequency } from "@/types/identity-sync"
import { cn } from "@/lib/utils"

const SOURCES: { value: OASyncSource; label: string; icon: string; desc: string }[] = [
  { value: "wecom",      icon: "💼", label: "企业微信", desc: "通讯录 API + Webhook" },
  { value: "dingtalk",   icon: "📱", label: "钉钉",     desc: "OpenAPI 同步" },
  { value: "feishu",     icon: "🪐", label: "飞书",     desc: "OpenAPI 同步" },
  { value: "scim",       icon: "🔄", label: "SCIM 2.0", desc: "标准协议，推送模式" },
  { value: "custom_api", icon: "🔧", label: "自定义 API",desc: "自研 OA 系统对接" },
]

const FREQ_LABELS: Record<SyncFrequency, string> = {
  realtime: "实时（Webhook）",
  hourly:   "每小时",
  daily:    "每天凌晨",
  manual:   "仅手动触发",
}

const STATUS_CFG = {
  idle:    { icon: Clock,          cls: "text-muted-foreground", label: "等待中" },
  running: { icon: RefreshCw,      cls: "text-blue-600 animate-spin", label: "同步中" },
  success: { icon: CheckCircle2,   cls: "text-green-600", label: "成功" },
  error:   { icon: AlertCircle,    cls: "text-destructive", label: "失败" },
}

function SourceConfigForm({ source, settings, onChange }: {
  source: OASyncSource
  settings: ReturnType<typeof useOrgSyncSettings>["data"]
  onChange: (patch: object) => void
}) {
  if (!settings) return null
  if (source === "wecom") {
    const c = settings.wecom!
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs text-muted-foreground">企业 CorpID</label>
          <Input value={c.corpId} onChange={(e) => onChange({ wecom: { ...c, corpId: e.target.value } })} className="h-8 text-sm font-mono" placeholder="ww1a2b3c4d..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">通讯录 Secret</label>
          <Input value={c.secret} onChange={(e) => onChange({ wecom: { ...c, secret: e.target.value } })} type="password" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Webhook Token（可选）</label>
          <Input value={c.webhookToken ?? ""} onChange={(e) => onChange({ wecom: { ...c, webhookToken: e.target.value } })} className="h-8 text-sm font-mono" placeholder="用于实时推送验证" />
        </div>
      </div>
    )
  }
  if (source === "dingtalk") {
    const c = settings.dingtalk!
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">AppKey</label>
          <Input value={c.appKey} onChange={(e) => onChange({ dingtalk: { ...c, appKey: e.target.value } })} className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">AppSecret</label>
          <Input value={c.appSecret} onChange={(e) => onChange({ dingtalk: { ...c, appSecret: e.target.value } })} type="password" className="h-8 text-sm" />
        </div>
      </div>
    )
  }
  if (source === "feishu") {
    const c = settings.feishu!
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">App ID</label>
          <Input value={c.appId} onChange={(e) => onChange({ feishu: { ...c, appId: e.target.value } })} className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">App Secret</label>
          <Input value={c.appSecret} onChange={(e) => onChange({ feishu: { ...c, appSecret: e.target.value } })} type="password" className="h-8 text-sm" />
        </div>
      </div>
    )
  }
  if (source === "scim") {
    const c = settings.scim!
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
          SCIM 2.0 使用推送模式：在您的 IdP（如 Okta、Azure AD）中配置以下端点，变更会自动推送到 Cove。
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">SCIM Endpoint（提供给 IdP）</label>
          <div className="flex gap-2">
            <Input value={c.endpointUrl} readOnly className="h-8 text-sm font-mono bg-muted/50 flex-1" />
            <Button variant="outline" size="sm" className="h-8 text-xs shrink-0"
              onClick={() => navigator.clipboard.writeText(c.endpointUrl)}>复制</Button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Bearer Token（提供给 IdP）</label>
          <div className="flex gap-2">
            <Input value={c.bearerToken} readOnly className="h-8 text-sm font-mono bg-muted/50 flex-1" />
            <Button variant="outline" size="sm" className="h-8 text-xs shrink-0"
              onClick={() => navigator.clipboard.writeText(c.bearerToken)}>复制</Button>
          </div>
        </div>
      </div>
    )
  }
  if (source === "custom_api") {
    const c = settings.customApi!
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs text-muted-foreground">API Base URL</label>
          <Input value={c.baseUrl} onChange={(e) => onChange({ customApi: { ...c, baseUrl: e.target.value } })} className="h-8 text-sm font-mono" placeholder="https://oa.corp.ai" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">API Key</label>
          <Input value={c.apiKey} onChange={(e) => onChange({ customApi: { ...c, apiKey: e.target.value } })} type="password" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">组织数据路径</label>
          <Input value={c.syncPath} onChange={(e) => onChange({ customApi: { ...c, syncPath: e.target.value } })} className="h-8 text-sm font-mono" placeholder="/api/org/export" />
        </div>
      </div>
    )
  }
  return null
}

export function OrgSyncCard() {
  const { data: settings, isLoading } = useOrgSyncSettings()
  const { data: logs = [], isLoading: loadingLogs } = useSyncLogs()
  const saveMutation = useSaveOrgSyncSettings()
  const testMutation = useTestOrgSyncConnection()
  const triggerMutation = useTriggerOrgSync()
  const [draft, setDraft] = useState<typeof settings | null>(null)

  const current = draft ?? settings
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
  if (!current) return null

  const patch = (p: object) => setDraft({ ...current, ...p })
  const statusCfg = STATUS_CFG[current.lastSyncStatus]

  return (
    <div className="space-y-6">
      {/* 最近同步状态 */}
      <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
        <statusCfg.icon className={cn("size-4 shrink-0", statusCfg.cls)} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{statusCfg.label}</span>
          {current.lastSyncAt && (
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(current.lastSyncAt).toLocaleString("zh-CN")}
            </span>
          )}
          {current.lastSyncStats && (
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span className="text-green-600">+{current.lastSyncStats.added} 新增</span>
              <span>~{current.lastSyncStats.updated} 更新</span>
              {current.lastSyncStats.disabled > 0 && <span className="text-orange-500">−{current.lastSyncStats.disabled} 停用</span>}
              {current.lastSyncStats.errors > 0 && <span className="text-destructive">{current.lastSyncStats.errors} 错误</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {testMutation.data && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-200">{testMutation.data.message}</Badge>
          )}
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"
            onClick={() => testMutation.mutate()} disabled={testMutation.isPending}>
            <TestTube2 className="size-3.5" />{testMutation.isPending ? "检测中…" : "测试连接"}
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs"
            onClick={() => triggerMutation.mutate()} disabled={triggerMutation.isPending}>
            <RefreshCw className={cn("size-3.5", triggerMutation.isPending && "animate-spin")} />
            {triggerMutation.isPending ? "同步中…" : "立即同步"}
          </Button>
        </div>
      </div>

      {/* 数据源选择 */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">数据来源</p>
        <div className="grid grid-cols-5 gap-2">
          {SOURCES.map((s) => (
            <button
              key={s.value}
              onClick={() => patch({ source: s.value })}
              className={cn(
                "text-left p-3 rounded-xl border transition-all",
                current.source === s.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-muted hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 连接配置 */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">连接配置</p>
        <SourceConfigForm source={current.source} settings={current} onChange={patch} />
      </div>

      {/* 同步设置 */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">同步设置</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">启用自动同步</p>
              <p className="text-xs text-muted-foreground mt-0.5">OA 侧变更后自动同步至 Cove，无需手动维护</p>
            </div>
            <Switch checked={current.isEnabled} onCheckedChange={(v) => patch({ isEnabled: v })} />
          </div>
          {current.isEnabled && (
            <div className="flex items-center gap-3 pl-4">
              <span className="text-sm text-muted-foreground w-16 shrink-0">同步频率</span>
              <Select value={current.frequency} onValueChange={(v) => patch({ frequency: v as SyncFrequency })}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(FREQ_LABELS) as [SyncFrequency, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* 保存 */}
      <div className="flex justify-end pt-1">
        <Button size="sm" onClick={() => { saveMutation.mutate(current); setDraft(null) }} disabled={saveMutation.isPending} className="gap-1.5">
          {saveMutation.isPending ? "保存中…" : "保存配置"}
        </Button>
      </div>

      {/* 同步日志 */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">同步历史</p>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">时间</TableHead>
                <TableHead className="w-20">触发方式</TableHead>
                <TableHead>统计</TableHead>
                <TableHead className="w-16">耗时</TableHead>
                <TableHead className="w-16">状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingLogs ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
                  </TableRow>
                ))
              ) : logs.map((log) => {
                const sc = STATUS_CFG[log.status]
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.triggeredAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {{ auto: "定时", manual: "手动", webhook: "Webhook" }[log.triggeredBy]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.stats ? (
                        <span className="text-xs text-muted-foreground space-x-2">
                          <span className="text-green-600">+{log.stats.added}</span>
                          <span>~{log.stats.updated}</span>
                          {log.stats.disabled > 0 && <span className="text-orange-500">−{log.stats.disabled}</span>}
                          {log.stats.errors > 0 && <span className="text-destructive">{log.stats.errors} 错</span>}
                          {log.errorMessage && <span className="text-destructive">· {log.errorMessage}</span>}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-1 text-xs", sc.cls)}>
                        <sc.icon className="size-3 shrink-0" />
                        {sc.label}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
