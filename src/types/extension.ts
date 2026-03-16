export type ExtensionType = "skill" | "tool" | "connector" | "agent"
export type ExtensionSource = "builtin" | "uploaded" | "marketplace"
export type ExtensionScope = "all" | "dept" | "admin"
export type ExtensionStatus = "enabled" | "disabled"
export type ApprovalStatus = "pending" | "approved" | "rejected"

export const EXTENSION_TYPE_LABELS: Record<ExtensionType, string> = {
  skill:     "Skill",
  tool:      "工具",
  connector: "连接器",
  agent:     "Agent",
}

export const EXTENSION_TYPE_COLORS: Record<ExtensionType, string> = {
  skill:     "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300",
  tool:      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
  connector: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
  agent:     "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
}

export const EXTENSION_SOURCE_LABELS: Record<ExtensionSource, string> = {
  builtin:     "内置",
  uploaded:    "用户上传",
  marketplace: "扩展市场",
}

export const EXTENSION_SCOPE_LABELS: Record<ExtensionScope, string> = {
  all:   "全员可用",
  dept:  "指定部门",
  admin: "仅管理员",
}

export interface Extension {
  id: string
  name: string
  description: string
  icon: string
  type: ExtensionType
  source: ExtensionSource
  developer: string
  scope: ExtensionScope
  scopeDepts?: string[]
  status: ExtensionStatus
  version: string
  installedAt: string
  usageCount: number
}

export interface ExtensionApproval {
  id: string
  name: string
  description: string
  icon: string
  type: ExtensionType
  submittedBy: string
  submittedByEmail: string
  submittedAt: string
  requestedScope: ExtensionScope
  status: ApprovalStatus
  reviewNote?: string
}

export interface UpdateExtensionRequest {
  status?: ExtensionStatus
  scope?: ExtensionScope
  scopeDepts?: string[]
}

export interface ReviewApprovalRequest {
  status: "approved" | "rejected"
  reviewNote?: string
}
