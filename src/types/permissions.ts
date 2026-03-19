export type RoleType = "three_element" | "builtin" | "custom"

// Admin side permissions are grouped by left menu items.
export type PermissionModule =
  | "users"
  | "models"
  | "extensions"
  | "dlp"
  | "audit_logs"
  | "versions"
  | "license"
  | "brand"
  | "rules"
  | "permissions"
  | "sso"
  | "enduser" // terminal user capabilities (not part of admin sidebar)

export type AdminPermissionModule = Exclude<PermissionModule, "enduser">

export type ThreeElementMode = "three_element" | "simplified"

export interface PermissionDef {
  id: string
  module: PermissionModule
  label: string
  desc: string
}

export interface RoleUser {
  id: string
  displayName: string
  email: string
  assignedAt: string
}

export interface Role {
  id: string
  name: string
  type: RoleType
  description: string
  color: string
  isLocked: boolean
  permissionIds: string[]
  userCount: number
  users: RoleUser[]
}

export interface CreateRoleRequest {
  name: string
  description: string
  permissionIds: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissionIds?: string[]
}

export interface ThreeElementStatus {
  mode: ThreeElementMode
  isCompliant: boolean
  conflicts: { userId: string; userEmail: string; roleIds: string[] }[]
}

// Menu order (nav + settings), excluding dashboard.
export const MODULE_ORDER: AdminPermissionModule[] = [
  "users",
  "extensions",
  "models",
  "dlp",
  "audit_logs",
  "versions",
  "license",
  "brand",
  "rules",
  "permissions",
  "sso",
]

export const MODULE_LABELS: Record<AdminPermissionModule, string> = {
  users: "用户管理",
  models: "模型配置",
  extensions: "扩展管理",
  dlp: "DLP 配置",
  audit_logs: "操作日志",
  versions: "版本升级",
  license: "授权管理",
  brand: "品牌设置",
  rules: "规则设置",
  permissions: "权限设置",
  sso: "SSO 设置",
}

function readonlyDesc(label: string) {
  return `仅可查看「${label}」相关信息，不可新增或修改配置。`
}

function readwriteDesc(label: string) {
  return `可查看并管理「${label}」相关配置（含新增、编辑、删除等操作）。`
}

// Admin permission registry: each menu item has read/write.
export const PERMISSION_REGISTRY: PermissionDef[] = MODULE_ORDER.flatMap((mod): PermissionDef[] => {
  const label = MODULE_LABELS[mod]

  // "操作日志" only supports view (no edit actions in admin UI).
  if (mod === "audit_logs") {
    return [
      { id: `${mod}.read`, module: mod, label: "查看", desc: readonlyDesc(label) },
    ]
  }

  return [
    { id: `${mod}.read`, module: mod, label: "查看", desc: readonlyDesc(label) },
    { id: `${mod}.write`, module: mod, label: "编辑", desc: readwriteDesc(label) },
  ]
})

// Terminal user capabilities (for dept_admin).
export const ENDUSER_ROLE_IDS = ["dept_admin"] as const

export const ENDUSER_PERMISSION_REGISTRY: PermissionDef[] = [
  { id: "skills.read", module: "enduser", label: "技能", desc: "仅可查看技能（Skills）列表与详情，不可新增或修改配置。" },
  { id: "skills.write", module: "enduser", label: "技能", desc: "可管理技能（Skills）（含新增、编辑、删除、上架范围等）。" },
]

/** 三元管理互斥对：任意两者之间不能兼任 */
export const THREE_ELEMENT_ROLE_IDS = ["sys_admin", "sec_admin", "audit_admin"] as const
