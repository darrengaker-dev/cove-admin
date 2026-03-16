// ── SSO / 认证 ─────────────────────────────────────────────
export type SSOProvider = "ldap" | "saml" | "oidc" | "cas" | "none"
export type ConnectionStatus = "connected" | "error" | "not_configured"

export interface LDAPAttrMapping {
  loginName: string   // Cove 账号 ← LDAP 属性
  name: string
  email: string
  mobile: string
  employeeNo: string
  deptName: string
}

export interface LDAPConfig {
  serverUrl: string
  port: number
  tlsEnabled: boolean
  bindDN: string
  bindPassword: string
  baseDN: string
  userFilter: string
  attrMapping: LDAPAttrMapping
}

export interface SAMLConfig {
  idpMetadataUrl: string
  entityId: string
  assertionConsumerUrl: string
  certificate: string
  signRequests: boolean
  nameIdFormat: string
}

export interface OIDCConfig {
  issuer: string
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string
}

export interface SSOSettings {
  provider: SSOProvider
  status: ConnectionStatus
  lastTestedAt?: string
  ldap?: LDAPConfig
  saml?: SAMLConfig
  oidc?: OIDCConfig
}

// ── 组织架构同步 ────────────────────────────────────────────
export type OASyncSource = "wecom" | "dingtalk" | "feishu" | "scim" | "custom_api"
export type SyncFrequency = "realtime" | "hourly" | "daily" | "manual"
export type SyncStatus = "idle" | "running" | "success" | "error"

export interface WeComConfig {
  corpId: string
  secret: string
  webhookToken?: string
}

export interface DingTalkConfig {
  appKey: string
  appSecret: string
  webhookToken?: string
}

export interface FeishuConfig {
  appId: string
  appSecret: string
}

export interface SCIMConfig {
  endpointUrl: string   // 只读 — 我方提供
  bearerToken: string   // 只读 — 生成
}

export interface CustomAPIConfig {
  baseUrl: string
  apiKey: string
  syncPath: string
}

export interface OrgSyncSettings {
  source: OASyncSource
  isEnabled: boolean
  frequency: SyncFrequency
  syncScope: "all" | "selected"
  selectedDepts?: string[]
  lastSyncAt?: string
  lastSyncStatus: SyncStatus
  lastSyncStats?: { added: number; updated: number; disabled: number; errors: number }
  wecom?: WeComConfig
  dingtalk?: DingTalkConfig
  feishu?: FeishuConfig
  scim?: SCIMConfig
  customApi?: CustomAPIConfig
}

export interface SyncLogEntry {
  id: string
  triggeredBy: "auto" | "manual" | "webhook"
  triggeredAt: string
  completedAt?: string
  durationMs?: number
  status: SyncStatus
  stats?: { added: number; updated: number; disabled: number; errors: number }
  errorMessage?: string
}
