export type ExtensionType = "skill" | "tool" | "connector" | "agent"
export type ExtensionSource = "builtin" | "shared" | "admin"
export type ExtensionScope = "all" | "dept" | "admin"
export type ExtensionTerminal = "desktop" | "word" | "excel" | "ppt"
export type ExtensionStatus = "enabled" | "disabled"
export type ApprovalStatus = "pending" | "approved" | "rejected"

export const EXTENSION_TYPE_LABELS: Record<ExtensionType, string> = {
  skill: "技能",
  tool: "工具",
  connector: "连接器",
  agent: "智能体",
}

export const EXTENSION_TYPE_COLORS: Record<ExtensionType, string> = {
  skill: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300",
  tool: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
  connector: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
  agent: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
}

export const EXTENSION_SOURCE_LABELS: Record<ExtensionSource, string> = {
  builtin: "内置",
  shared: "用户分享",
  admin: "管理员创建",
}

export const EXTENSION_SCOPE_LABELS: Record<ExtensionScope, string> = {
  all: "全员可用",
  dept: "指定部门/成员",
  admin: "仅管理员",
}

export const EXTENSION_TERMINAL_LABELS: Record<ExtensionTerminal, string> = {
  desktop: "桌面端",
  word: "Word插件",
  excel: "Excel插件",
  ppt: "PPT插件",
}

export interface Extension {
  id: string
  name: string
  description: string
  icon: string
  systemPrompt?: string
  type: ExtensionType
  source: ExtensionSource
  developer: string
  scope: ExtensionScope
  terminals: ExtensionTerminal[]
  scopeDepts?: string[]
  scopeDeptIds?: string[]
  scopeMemberIds?: string[]
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
  name?: string
  description?: string
  icon?: string
  systemPrompt?: string
  status?: ExtensionStatus
  scope?: ExtensionScope
  terminals?: ExtensionTerminal[]
  scopeDepts?: string[]
  scopeDeptIds?: string[]
  scopeMemberIds?: string[]
}

export interface ReviewApprovalRequest {
  status: "approved" | "rejected"
  reviewNote?: string
}
