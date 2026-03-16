export type RoleType = "three_element" | "builtin" | "custom"
export type PermissionModule = "user" | "security" | "audit" | "system" | "ai"
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

export const MODULE_ORDER: PermissionModule[] = ["user", "security", "audit", "system", "ai"]

export const MODULE_LABELS: Record<PermissionModule, string> = {
  user:     "用户管理",
  security: "安全配置",
  audit:    "审计合规",
  system:   "系统配置",
  ai:       "AI 功能",
}

export const PERMISSION_REGISTRY: PermissionDef[] = [
  { id: "user.create",        module: "user",     label: "创建账号",        desc: "新增用户账号" },
  { id: "user.disable",       module: "user",     label: "禁用/启用账号",   desc: "禁用或恢复用户账号" },
  { id: "user.reset_pwd",     module: "user",     label: "重置密码",        desc: "为用户重置临时密码" },
  { id: "dept.manage",        module: "user",     label: "部门管理",        desc: "增删改部门架构" },
  { id: "dlp.manage",         module: "security", label: "DLP 规则管理",    desc: "制定和修改敏感信息识别规则" },
  { id: "access.policy",      module: "security", label: "访问控制策略",    desc: "配置用户和功能的访问控制" },
  { id: "risk.switches",      module: "security", label: "高风险操作开关",  desc: "启用或禁止高风险操作（如命令执行）" },
  { id: "security.alerts",    module: "security", label: "查看安全告警",    desc: "查看安全事件告警列表" },
  { id: "audit.view",         module: "audit",    label: "查看审计日志",    desc: "查看全员全量操作记录（含管理员）" },
  { id: "audit.export",       module: "audit",    label: "导出审计报告",    desc: "导出合规审计报告" },
  { id: "audit.alert_push",   module: "audit",    label: "接收告警推送",    desc: "接收安全事件实时推送" },
  { id: "system.config",      module: "system",   label: "系统基础配置",    desc: "服务器地址、存储路径等基础参数" },
  { id: "model.manage",       module: "system",   label: "模型配置",        desc: "配置 AI 模型和 API Key" },
  { id: "version.manage",     module: "system",   label: "版本升级",        desc: "管理客户端版本和推送升级" },
  { id: "settings.manage",    module: "system",   label: "企业设置",        desc: "品牌、规则、授权等配置" },
  { id: "ai.chat",            module: "ai",       label: "AI 对话",         desc: "使用 AI 对话功能" },
  { id: "ai.workspace",       module: "ai",       label: "工作区",          desc: "访问和使用工作区文件" },
  { id: "skill.use",          module: "ai",       label: "使用 Skills",     desc: "调用团队和个人 Skill" },
  { id: "skill.manage_dept",  module: "ai",       label: "管理部门 Skill",  desc: "审批和管理部门级 Skill" },
  { id: "kb.personal",        module: "ai",       label: "个人知识库",      desc: "管理个人知识库文档" },
  { id: "kb.dept",            module: "ai",       label: "部门知识库",      desc: "管理本部门知识库" },
]

/** 三元管理互斥对：任意两者之间不能兼任 */
export const THREE_ELEMENT_ROLE_IDS = ["sys_admin", "sec_admin", "audit_admin"] as const
