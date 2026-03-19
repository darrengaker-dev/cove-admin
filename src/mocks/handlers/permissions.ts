import { http, HttpResponse } from "msw"
import type { Role, CreateRoleRequest, UpdateRoleRequest, ThreeElementStatus } from "@/types/permissions"

let roles: Role[] = [
  {
    id: "super_admin", name: "超级管理员", type: "builtin", color: "#111827",
    description: "拥有管理后台全部功能权限（含用户、扩展、配置、审计查看等）",
    isLocked: true,
    permissionIds: ["users.read", "users.write", "extensions.read", "extensions.write", "models.read", "models.write", "dlp.read", "dlp.write", "audit_logs.read", "versions.read", "versions.write", "license.read", "license.write", "brand.read", "brand.write", "rules.read", "rules.write", "permissions.read", "permissions.write", "sso.read", "sso.write", "skills.read", "skills.write"],
    userCount: 1,
    users: [{ id: "u-root", displayName: "超级管理员", email: "root@corp.ai", assignedAt: "2025-09-01T09:00:00Z" }],
  },
  {
    id: "sys_admin", name: "系统管理员", type: "three_element", color: "#2563EB",
    description: "负责用户账号与系统基础配置，不得修改安全策略/DLP规则或查看审计日志",
    isLocked: true,
    permissionIds: ["users.read", "users.write", "models.read", "models.write", "versions.read", "versions.write", "license.read", "license.write", "brand.read", "brand.write", "sso.read", "sso.write"],
    userCount: 1,
    users: [{ id: "u-sys", displayName: "李明", email: "liming@corp.ai", assignedAt: "2025-09-01T09:00:00Z" }],
  },
  {
    id: "sec_admin", name: "安全管理员", type: "three_element", color: "#DC2626",
    description: "负责 DLP 规则与访问控制策略，不得管理用户账号、系统配置或查看审计日志",
    isLocked: true,
    permissionIds: ["dlp.read", "dlp.write", "rules.read", "rules.write"],
    userCount: 1,
    users: [{ id: "u-sec", displayName: "王芳", email: "wangfang@corp.ai", assignedAt: "2025-09-01T09:00:00Z" }],
  },
  {
    id: "audit_admin", name: "审计管理员", type: "three_element", color: "#7C3AED",
    description: "负责查看全量审计记录和导出报告，不得修改任何配置或管理账号",
    isLocked: true,
    permissionIds: ["audit_logs.read"],
    userCount: 1,
    users: [{ id: "u-audit", displayName: "张磊", email: "zhanglei@corp.ai", assignedAt: "2025-09-01T09:00:00Z" }],
  },
  {
    id: "dept_admin", name: "部门管理员", type: "builtin", color: "#059669",
    description: "管理本部门成员和知识库，审批部门 Skill 申请",
    isLocked: true,
    permissionIds: ["users.write", "extensions.write"],
    userCount: 8,
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
      isLocked: true,
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
