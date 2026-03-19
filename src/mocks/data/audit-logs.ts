import type { AuditLog, AuditAction, LogCategory, LogResult, LogSource, LogRisk } from "@/types/audit-log";
import { MOCK_USERS } from "./users";

type ActionMeta = {
  category: LogCategory
  riskLevel: LogRisk
  resourceType?: string
  detailFn: () => Record<string, unknown>
  resourceTitleFn?: () => string
  weight: number
}

const ACTION_META: Record<AuditAction, ActionMeta> = {
  // ── security ────────────────────────────────────────
  "auth.login":           { category: "security", riskLevel: "info",     weight: 8,  detailFn: () => ({}) },
  "auth.logout":          { category: "security", riskLevel: "info",     weight: 4,  detailFn: () => ({ reason: "manual" }) },
  "auth.login_failed":    { category: "security", riskLevel: "warning",  weight: 2,  detailFn: () => ({ attempts: Math.floor(Math.random() * 3) + 1, reason: "invalid_password" }) },
  "auth.password_reset":  { category: "security", riskLevel: "warning",  weight: 1,  detailFn: () => ({ triggeredBy: "admin" }) },
  "auth.force_logout":    { category: "security", riskLevel: "warning",  weight: 1,  detailFn: () => ({ reason: "admin_action" }) },
  "user.create":          { category: "security", riskLevel: "warning",  weight: 1,  resourceType: "user", resourceTitleFn: () => `user_${Math.floor(Math.random()*100)}@example.com`, detailFn: () => ({ role: "member" }) },
  "user.update":          { category: "security", riskLevel: "info",     weight: 1,  resourceType: "user", resourceTitleFn: () => `user_${Math.floor(Math.random()*100)}@example.com`, detailFn: () => ({ field: "displayName" }) },
  "user.delete":          { category: "security", riskLevel: "critical", weight: 1,  resourceType: "user", resourceTitleFn: () => `user_${Math.floor(Math.random()*100)}@example.com`, detailFn: () => ({}) },
  "role.assign":          { category: "security", riskLevel: "warning",  weight: 1,  resourceType: "role", resourceTitleFn: () => ["admin", "editor", "viewer"][Math.floor(Math.random()*3)]!, detailFn: () => ({}) },
  "role.revoke":          { category: "security", riskLevel: "warning",  weight: 1,  resourceType: "role", resourceTitleFn: () => ["admin", "editor", "viewer"][Math.floor(Math.random()*3)]!, detailFn: () => ({}) },
  "apikey.create":        { category: "security", riskLevel: "warning",  weight: 1,  resourceType: "apikey", resourceTitleFn: () => `key-${Math.random().toString(36).slice(2,8)}`, detailFn: () => ({ provider: "openai" }) },
  "apikey.delete":        { category: "security", riskLevel: "critical", weight: 1,  resourceType: "apikey", resourceTitleFn: () => `key-${Math.random().toString(36).slice(2,8)}`, detailFn: () => ({}) },
  "data.export":          { category: "security", riskLevel: "critical", weight: 1,  resourceType: "export", resourceTitleFn: () => `audit_logs_${new Date().toISOString().slice(0,10)}.csv`, detailFn: () => ({ rows: Math.floor(Math.random()*5000+100), format: "csv" }) },
  "system.config_change": { category: "security", riskLevel: "critical", weight: 1,  detailFn: () => ({ field: "retention_days", oldValue: 90, newValue: 180 }) },
  "content.flagged":      { category: "security", riskLevel: "warning",  weight: 1,  detailFn: () => ({ rule: "sensitive_keywords", keywords: ["机密"] }) },
  // ── content ─────────────────────────────────────────
  "message.send":         { category: "content",  riskLevel: "info",     weight: 40, resourceType: "conversation", resourceTitleFn: () => ["季度工作总结", "代码 Review", "市场分析报告", "技术方案讨论"][Math.floor(Math.random()*4)]!, detailFn: () => ({ model: "claude-sonnet-4-6", inputTokens: Math.floor(Math.random()*1500+50), outputTokens: Math.floor(Math.random()*800+50) }) },
  "message.delete":       { category: "content",  riskLevel: "info",     weight: 2,  resourceType: "message", detailFn: () => ({ messageId: `msg-${Math.random().toString(36).slice(2)}` }) },
  "conversation.create":  { category: "content",  riskLevel: "info",     weight: 8,  resourceType: "conversation", resourceTitleFn: () => ["新对话", "技术讨论", "需求分析", "周报撰写"][Math.floor(Math.random()*4)]!, detailFn: () => ({}) },
  "conversation.delete":  { category: "content",  riskLevel: "info",     weight: 2,  resourceType: "conversation", resourceTitleFn: () => ["旧对话", "测试会话"][Math.floor(Math.random()*2)]!, detailFn: () => ({}) },
  "file.upload":          { category: "content",  riskLevel: "info",     weight: 5,  resourceType: "file", resourceTitleFn: () => [`报告_${Math.floor(Math.random()*100)}.pdf`, `数据_${Math.floor(Math.random()*100)}.xlsx`, `设计稿.png`][Math.floor(Math.random()*3)]!, detailFn: () => ({ size: Math.floor(Math.random()*5000000+10000) }) },
  "file.delete":          { category: "content",  riskLevel: "warning",  weight: 1,  resourceType: "file", resourceTitleFn: () => `old_file_${Math.floor(Math.random()*100)}.docx`, detailFn: () => ({}) },
  "command.execute":      { category: "content",  riskLevel: "warning",  weight: 3,  detailFn: () => ({ command: ["ls -la", "git log --oneline -10", "cat README.md"][Math.floor(Math.random()*3)]!, exitCode: 0 }) },
  "skill.run":            { category: "content",  riskLevel: "info",     weight: 5,  resourceType: "skill", resourceTitleFn: () => ["report-proofreader", "pdf", "docx", "xlsx"][Math.floor(Math.random()*4)]!, detailFn: () => ({ duration: Math.floor(Math.random()*5000+500) }) },
  // ── usage ────────────────────────────────────────────
  "model.switch":         { category: "usage",    riskLevel: "info",     weight: 6,  resourceType: "model", resourceTitleFn: () => ["claude-sonnet-4-6", "deepseek-chat", "qwen3-max", "gpt-4o"][Math.floor(Math.random()*4)]!, detailFn: () => ({ from: "gpt-4o", to: "claude-sonnet-4-6" }) },
  "assistant.switch":     { category: "usage",    riskLevel: "info",     weight: 4,  resourceType: "assistant", resourceTitleFn: () => ["默认助手", "代码助手", "写作助手"][Math.floor(Math.random()*3)]!, detailFn: () => ({}) },
  "workspace.open":       { category: "usage",    riskLevel: "info",     weight: 8,  resourceType: "file", resourceTitleFn: () => [`项目说明.md`, `src/main.ts`, `README.md`][Math.floor(Math.random()*3)]!, detailFn: () => ({}) },
  "settings.change":      { category: "usage",    riskLevel: "info",     weight: 2,  detailFn: () => ({ field: "theme", oldValue: "light", newValue: "dark" }) },
  "feature.use":          { category: "usage",    riskLevel: "info",     weight: 10, detailFn: () => ({ feature: ["mention", "file-preview", "version-history", "skill-creator"][Math.floor(Math.random()*4)]! }) },
}

const ACTION_POOL: AuditAction[] = (Object.entries(ACTION_META) as [AuditAction, ActionMeta][])
  .flatMap(([action, meta]) => Array.from({ length: meta.weight }, () => action))

const SOURCES: LogSource[] = ["desktop", "desktop", "web", "plugin", "admin", "api"]
const IPS = Array.from({ length: 20 }, (_, i) => `192.168.1.${i + 10}`)

export function generateLogs(n: number): AuditLog[] {
  return Array.from({ length: n }, (_, i) => {
    const user = MOCK_USERS[i % MOCK_USERS.length]!
    const action = ACTION_POOL[i % ACTION_POOL.length]!
    const meta = ACTION_META[action]
    const date = new Date(Date.now() - i * 900000 - Math.floor(Math.random() * 300000))

    const result: LogResult =
      action === "auth.login_failed" ? "fail"
      : meta.riskLevel === "critical" && Math.random() < 0.05 ? "fail"
      : Math.random() < 0.02 ? "fail"
      : "success"

    return {
      id: `log-${i + 1}`,
      userId: user.id,
      userEmail: user.email ?? "",
      userDisplayName: user.name,
      action,
      category: meta.category,
      result,
      source: SOURCES[i % SOURCES.length]!,
      riskLevel: meta.riskLevel,
      resourceType: meta.resourceType,
      resourceId: meta.resourceType ? `${meta.resourceType}-${Math.floor(Math.random()*1000)}` : undefined,
      resourceTitle: meta.resourceTitleFn?.(),
      errorMessage: result === "fail" ? "操作失败：权限不足或服务异常" : undefined,
      requestId: `req-${Math.random().toString(36).slice(2, 12)}`,
      clientVersion: ["1.0.10", "1.0.9", "1.0.8"][i % 3]!,
      detail: meta.detailFn(),
      ip: IPS[i % IPS.length]!,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      createdAt: date.toISOString(),
    }
  })
}

function generateCoverageLogs(): AuditLog[] {
  const actionsByCategory: Record<LogCategory, AuditAction[]> = {
    security: [],
    content: [],
    usage: [],
  }

  for (const action of Object.keys(ACTION_META) as AuditAction[]) {
    actionsByCategory[ACTION_META[action].category].push(action)
  }

  // Interleave categories so the first page shows variety.
  const ordered: AuditAction[] = []
  const cats: LogCategory[] = ["security", "content", "usage"]
  while (cats.some((c) => actionsByCategory[c].length > 0)) {
    for (const c of cats) {
      const next = actionsByCategory[c].shift()
      if (next) ordered.push(next)
    }
  }

  return ordered.map((action, i) => {
    const meta = ACTION_META[action]
    const user = MOCK_USERS[i % MOCK_USERS.length]!
    const date = new Date(Date.now() - i * 120000 - Math.floor(Math.random() * 30000))

    const result: LogResult =
      action === "auth.login_failed" ? "fail"
      : meta.riskLevel === "critical" && i % 13 === 0 ? "fail"
      : "success"

    return {
      id: `cov-${action}-${i + 1}`,
      userId: user.id,
      userEmail: user.email ?? "",
      userDisplayName: user.name,
      action,
      category: meta.category,
      result,
      source: SOURCES[i % SOURCES.length]!,
      riskLevel: meta.riskLevel,
      resourceType: meta.resourceType,
      resourceId: meta.resourceType ? `${meta.resourceType}-${Math.floor(Math.random() * 1000)}` : undefined,
      resourceTitle: meta.resourceTitleFn?.(),
      errorMessage: result === "fail" ? "操作失败：权限不足或服务异常" : undefined,
      requestId: `req-${Math.random().toString(36).slice(2, 12)}`,
      clientVersion: ["1.0.10", "1.0.9", "1.0.8"][i % 3]!,
      detail: meta.detailFn(),
      ip: IPS[i % IPS.length]!,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      createdAt: date.toISOString(),
    }
  })
}

const COVERAGE_LOGS = generateCoverageLogs()

export const MOCK_LOGS = [
  ...COVERAGE_LOGS,
  ...generateLogs(Math.max(0, 300 - COVERAGE_LOGS.length)),
]

