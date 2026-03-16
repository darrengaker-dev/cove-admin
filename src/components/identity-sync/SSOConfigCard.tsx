import { useState } from "react"
import { CheckCircle2, AlertCircle, Wifi, WifiOff, TestTube2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSSOSettings, useSaveSSOSettings, useTestSSOConnection } from "@/hooks/useIdentitySync"
import type { SSOProvider, LDAPConfig, SAMLConfig, OIDCConfig } from "@/types/identity-sync"
import { cn } from "@/lib/utils"

const PROVIDERS: { value: SSOProvider; label: string; desc: string }[] = [
  { value: "ldap", label: "LDAP / AD", desc: "对接企业 Active Directory 或 OpenLDAP" },
  { value: "saml", label: "SAML 2.0", desc: "标准 SAML 协议，支持大多数 IdP" },
  { value: "oidc", label: "OIDC", desc: "OAuth2 / OpenID Connect 现代认证" },
  { value: "cas", label: "CAS", desc: "高校及政府常用单点登录协议" },
  { value: "none", label: "不启用", desc: "用户通过账号密码登录" },
]

const ATTR_ROWS = [
  { key: "loginName" as const, label: "登录账号" },
  { key: "name" as const,      label: "姓名" },
  { key: "email" as const,     label: "邮箱" },
  { key: "mobile" as const,    label: "手机号" },
  { key: "employeeNo" as const,label: "工号" },
  { key: "deptName" as const,  label: "部门名称" },
]

function LDAPForm({ config, onChange }: { config: LDAPConfig; onChange: (c: LDAPConfig) => void }) {
  const set = (patch: Partial<LDAPConfig>) => onChange({ ...config, ...patch })
  const setAttr = (key: keyof LDAPConfig["attrMapping"], val: string) =>
    set({ attrMapping: { ...config.attrMapping, [key]: val } })

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">服务器设置</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground">服务器地址</label>
            <Input value={config.serverUrl} onChange={(e) => set({ serverUrl: e.target.value })} className="h-8 text-sm font-mono" placeholder="ldap://ldap.corp.ai" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">端口</label>
            <Input value={config.port} onChange={(e) => set({ port: Number(e.target.value) })} className="h-8 text-sm font-mono" type="number" />
          </div>
          <div className="col-span-3 flex items-center gap-2">
            <Switch checked={config.tlsEnabled} onCheckedChange={(v) => set({ tlsEnabled: v })} className="scale-90" />
            <span className="text-sm">启用 TLS/SSL 加密</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">绑定凭证</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground">绑定 DN（服务账号）</label>
            <Input value={config.bindDN} onChange={(e) => set({ bindDN: e.target.value })} className="h-8 text-sm font-mono" placeholder="cn=svc-cove,dc=corp,dc=ai" />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground">绑定密码</label>
            <Input value={config.bindPassword} onChange={(e) => set({ bindPassword: e.target.value })} type="password" className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">用户 Base DN</label>
            <Input value={config.baseDN} onChange={(e) => set({ baseDN: e.target.value })} className="h-8 text-sm font-mono" placeholder="ou=users,dc=corp,dc=ai" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">用户过滤条件</label>
            <Input value={config.userFilter} onChange={(e) => set({ userFilter: e.target.value })} className="h-8 text-sm font-mono" placeholder="(&(objectClass=person)(uid=*))" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">属性映射 <span className="normal-case font-normal">Cove 字段 ← LDAP 属性名</span></p>
        <div className="rounded-lg border overflow-hidden">
          {ATTR_ROWS.map((row, i) => (
            <div key={row.key} className={cn("flex items-center gap-3 px-3 py-2", i < ATTR_ROWS.length - 1 && "border-b")}>
              <span className="text-xs text-muted-foreground w-20 shrink-0">{row.label}</span>
              <span className="text-muted-foreground/30 text-sm">←</span>
              <Input
                value={config.attrMapping[row.key]}
                onChange={(e) => setAttr(row.key, e.target.value)}
                className="h-7 text-xs font-mono flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SAMLForm({ config, onChange }: { config: SAMLConfig; onChange: (c: SAMLConfig) => void }) {
  const set = (patch: Partial<SAMLConfig>) => onChange({ ...config, ...patch })
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">IdP 元数据 URL</label>
        <Input value={config.idpMetadataUrl} onChange={(e) => set({ idpMetadataUrl: e.target.value })} className="h-8 text-sm" placeholder="https://idp.corp.ai/metadata.xml" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">SP Entity ID</label>
          <Input value={config.entityId} onChange={(e) => set({ entityId: e.target.value })} className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">断言消费 URL（只读）</label>
          <Input value={config.assertionConsumerUrl} readOnly className="h-8 text-sm font-mono bg-muted/50" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={config.signRequests} onCheckedChange={(v) => set({ signRequests: v })} className="scale-90" />
        <span className="text-sm">对 AuthnRequest 签名</span>
      </div>
    </div>
  )
}

function OIDCForm({ config, onChange }: { config: OIDCConfig; onChange: (c: OIDCConfig) => void }) {
  const set = (patch: Partial<OIDCConfig>) => onChange({ ...config, ...patch })
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Issuer URL</label>
        <Input value={config.issuer} onChange={(e) => set({ issuer: e.target.value })} className="h-8 text-sm font-mono" placeholder="https://idp.corp.ai/oidc" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Client ID</label>
          <Input value={config.clientId} onChange={(e) => set({ clientId: e.target.value })} className="h-8 text-sm font-mono" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Client Secret</label>
          <Input value={config.clientSecret} onChange={(e) => set({ clientSecret: e.target.value })} type="password" className="h-8 text-sm" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Redirect URI（只读）</label>
        <Input value={config.redirectUri} readOnly className="h-8 text-sm font-mono bg-muted/50" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Scopes</label>
        <Input value={config.scopes} onChange={(e) => set({ scopes: e.target.value })} className="h-8 text-sm font-mono" placeholder="openid profile email" />
      </div>
    </div>
  )
}

export function SSOConfigCard() {
  const { data: settings, isLoading } = useSSOSettings()
  const saveMutation = useSaveSSOSettings()
  const testMutation = useTestSSOConnection()
  const [draft, setDraft] = useState<typeof settings | null>(null)

  const current = draft ?? settings
  const provider = current?.provider ?? "none"
  const setProvider = (p: SSOProvider) => setDraft({ ...(current ?? {} as any), provider: p })

  if (isLoading) return <div className="space-y-3 p-1">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
  if (!current) return null

  const statusCfg = {
    connected:      { icon: CheckCircle2, label: "已连接", cls: "text-green-600 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800" },
    error:          { icon: AlertCircle,  label: "连接错误", cls: "text-destructive bg-destructive/5 border-destructive/20" },
    not_configured: { icon: WifiOff,      label: "未配置",  cls: "text-muted-foreground bg-muted/50 border-muted" },
  }[current.status]

  return (
    <div className="space-y-6">
      {/* 状态横幅 */}
      <div className={cn("flex items-center gap-2.5 rounded-xl border px-4 py-2.5", statusCfg.cls)}>
        <statusCfg.icon className="size-4 shrink-0" />
        <div className="flex-1 text-sm font-medium">{statusCfg.label}</div>
        {current.lastTestedAt && (
          <span className="text-xs opacity-70">
            上次测试：{new Date(current.lastTestedAt).toLocaleString("zh-CN")}
          </span>
        )}
      </div>

      {/* 协议选择 */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">认证协议</p>
        <div className="grid grid-cols-5 gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              onClick={() => setProvider(p.value)}
              className={cn(
                "text-left p-3 rounded-xl border transition-all",
                provider === p.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-muted hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="text-sm font-semibold">{p.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 配置表单 */}
      {provider === "ldap" && current.ldap && (
        <LDAPForm config={current.ldap} onChange={(ldap) => setDraft({ ...current, ldap })} />
      )}
      {provider === "saml" && current.saml && (
        <SAMLForm config={current.saml} onChange={(saml) => setDraft({ ...current, saml })} />
      )}
      {provider === "oidc" && current.oidc && (
        <OIDCForm config={current.oidc} onChange={(oidc) => setDraft({ ...current, oidc })} />
      )}
      {provider === "cas" && (
        <div className="text-sm text-muted-foreground text-center py-8 border rounded-xl border-dashed">
          CAS 配置请联系技术支持获取对接文档
        </div>
      )}
      {provider === "none" && (
        <div className="text-sm text-muted-foreground text-center py-8 border rounded-xl border-dashed">
          用户将通过账号 + 密码方式登录，不启用单点认证
        </div>
      )}

      {/* 操作 */}
      {provider !== "none" && provider !== "cas" && (
        <div className="flex items-center gap-2 pt-2">
          {testMutation.data && (
            <Badge variant="outline" className={cn("text-xs gap-1", testMutation.data.success ? "text-green-600 border-green-200" : "text-destructive")}>
              {testMutation.data.success ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
              {testMutation.data.message}
            </Badge>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending}
              className="gap-1.5"
            >
              <TestTube2 className="size-3.5" />
              {testMutation.isPending ? "测试中…" : "测试连接"}
            </Button>
            <Button
              size="sm"
              onClick={() => { saveMutation.mutate(current); setDraft(null) }}
              disabled={saveMutation.isPending}
              className="gap-1.5"
            >
              <Save className="size-3.5" />
              {saveMutation.isPending ? "保存中…" : "保存配置"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
