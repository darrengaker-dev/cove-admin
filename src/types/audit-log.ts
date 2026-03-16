export type LogCategory = "security" | "content" | "usage"
export type LogResult = "success" | "fail"
export type LogSource = "desktop" | "web" | "plugin" | "admin" | "api"
export type LogRisk = "critical" | "warning" | "info"

export type AuditAction =
  // security
  | "auth.login" | "auth.logout" | "auth.login_failed"
  | "auth.password_reset" | "auth.force_logout"
  | "user.create" | "user.update" | "user.delete"
  | "role.assign" | "role.revoke"
  | "apikey.create" | "apikey.delete"
  | "data.export" | "system.config_change" | "content.flagged"
  // content
  | "message.send" | "message.delete"
  | "conversation.create" | "conversation.delete"
  | "file.upload" | "file.delete"
  | "command.execute" | "skill.run"
  // usage
  | "model.switch" | "assistant.switch"
  | "workspace.open" | "settings.change" | "feature.use"

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  userDisplayName: string
  action: AuditAction
  category: LogCategory
  result: LogResult
  source: LogSource
  riskLevel: LogRisk
  resourceType?: string
  resourceId?: string
  resourceTitle?: string
  errorMessage?: string
  requestId?: string
  clientVersion?: string
  detail: Record<string, unknown>
  ip: string
  userAgent: string
  createdAt: string
}

export interface AuditLogFilter {
  page: number
  limit: number
  userId?: string
  action?: AuditAction
  category?: LogCategory
  result?: LogResult
  source?: LogSource
  startDate?: string
  endDate?: string
}
