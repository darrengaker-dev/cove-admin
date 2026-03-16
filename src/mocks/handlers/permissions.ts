import { http, HttpResponse } from "msw"
import type { Role, CreateRoleRequest, UpdateRoleRequest, ThreeElementStatus } from "@/types/permissions"

let roles: Role[] = [
  {
    id: "sys_admin", name: "系统管理员", type: "three_element", color: "#2563EB",
    description: "负责用户账号和系统基础配置，不得修改安全策略或查看审计日志",
    isLocked: true,
    permissionIds: ["user.create", "user.disable", "user.reset_pwd", "dept.manage", "system.config", "model.manage", "version.manage", "settings.manage"],
    userCount: 1,
    users: [{ id: "u-sys", displayName: "李明", email: "liming@corp.ai", assignedAt: "2025-09-01T09:00:00Z" }],
  },
  {
    id: "sec_admin", name: "安全管理员", type: "three_element", color: "#DC2626",
    description: "负责安全策略和 DLP 规则，不得管理用户账号或查看审计日志",
    isLocked: true,
    permissionIds: ["dlp.manage", "access.policy", "risk.switches", "security.alerts"],
    userCount: 1,
    users: [{ id: "u-sec", displayName: "王芳", email: "wangfang@corp.ai", assignedAt: "2025-09-01T09:00:00Z" }],
  },
  {
    id: "audit_admin", name: "审计管理员", type: "three_element", color: "#7C3AED",
    description: "负责查看全量审计记录和导出报告，不得修改任何配置或管理账号",
    isLocked: true,
    permissionIds: ["audit.view", "audit.export", "audit.alert_push", "security.alerts"],
    userCount: 1,
    users: [{ id: "u-audit", displayName: "张磊", email: "zhanglei@corp.ai", assignedAt: "2025-09-01T09:00:00Z" }],
  },
  {
    id: "dept_admin", name: "部门管理员", type: "builtin", color: "#059669",
    description: "管理本部门成员和知识库，审批部门 Skill 申请",
    isLocked: true,
    permissionIds: ["ai.chat", "ai.workspace", "skill.use", "skill.manage_dept", "kb.personal", "kb.dept"],
    userCount: 8,
    users: [],
  },
  {
    id: "normal_user", name: "普通用户", type: "builtin", color: "#6B7280",
    description: "使用 AI 对话、工作区和个人知识库，不可访问管理功能",
    isLocked: true,
    permissionIds: ["ai.chat", "ai.workspace", "skill.use", "kb.personal"],
    userCount: 304,
    users: [],
  },
  {
    id: "custom-hr", name: "HR 专员", type: "custom", color: "#D97706",
    description: "仅限 HR 部门，可管理用户账号但不可修改系统配置",
    isLocked: false,
    permissionIds: ["user.create", "user.disable", "user.reset_pwd", "ai.chat", "ai.workspace", "kb.personal"],
    userCount: 3,
    users: [],
  },
]

let threeElementStatus: ThreeElementStatus = {
  mode: "three_element",
  isCompliant: true,
  conflicts: [],
}

export const permissionHandlers = [
  http.get("/api/permissions/roles", () => HttpResponse.json<Role[]>(roles)),

  http.get("/api/permissions/roles/:id", ({ params }) => {
    const role = roles.find((r) => r.id === params.id)
    if (!role) return HttpResponse.json({ error: "Not found" }, { status: 404 })
    return HttpResponse.json<Role>(role)
  }),

  http.post("/api/permissions/roles", async ({ request }) => {
    const body = await request.json() as CreateRoleRequest
    const newRole: Role = {
      id: `custom-${Date.now()}`,
      name: body.name,
      description: body.description,
      type: "custom",
      color: "#6B7280",
      isLocked: false,
      permissionIds: body.permissionIds,
      userCount: 0,
      users: [],
    }
    roles = [...roles, newRole]
    return HttpResponse.json<Role>(newRole, { status: 201 })
  }),

  http.put("/api/permissions/roles/:id", async ({ params, request }) => {
    const body = await request.json() as UpdateRoleRequest
    roles = roles.map((r) =>
      r.id === params.id && !r.isLocked ? { ...r, ...body } : r
    )
    const updated = roles.find((r) => r.id === params.id)
    return HttpResponse.json<Role>(updated!)
  }),

  http.delete("/api/permissions/roles/:id", ({ params }) => {
    const role = roles.find((r) => r.id === params.id)
    if (role?.isLocked) return HttpResponse.json({ error: "Cannot delete locked role" }, { status: 403 })
    roles = roles.filter((r) => r.id !== params.id)
    return HttpResponse.json({ ok: true })
  }),

  http.get("/api/permissions/three-element", () =>
    HttpResponse.json<ThreeElementStatus>(threeElementStatus)
  ),

  http.put("/api/permissions/three-element/mode", async ({ request }) => {
    const { mode } = await request.json() as { mode: string }
    threeElementStatus = { ...threeElementStatus, mode: mode as "three_element" | "simplified" }
    return HttpResponse.json<ThreeElementStatus>(threeElementStatus)
  }),
]
