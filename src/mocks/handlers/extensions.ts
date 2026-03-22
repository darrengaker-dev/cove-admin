import { http, HttpResponse } from "msw"
import { mockExtensions, mockApprovals, mockTaskTypes } from "@/mocks/data/extensions"
import type {
  UpdateExtensionRequest,
  ReviewApprovalRequest,
  CreateTaskTypeRequest,
  UpdateTaskTypeRequest,
} from "@/types/extension"

const extensions = [...mockExtensions]
const approvals = [...mockApprovals]
const taskTypes = [...mockTaskTypes]

export const extensionHandlers = [
  http.get("/api/extensions", () => {
    return HttpResponse.json(extensions)
  }),

  http.post("/api/extensions", async ({ request }) => {
    const body = await request.json() as UpdateExtensionRequest
    const next = {
      id: `ext_${Date.now()}`,
      name: body.name ?? "未命名快捷指令",
      description: body.description ?? "",
      icon: body.icon ?? "✨",
      type: body.type ?? "agent",
      categoryId: body.categoryId,
      starterPrompt: body.starterPrompt,
      bindingKind: body.bindingKind,
      bindingTarget: body.bindingTarget,
      recommended: body.recommended ?? false,
      source: body.source ?? "admin",
      developer: body.developer ?? "管理员",
      scope: body.scope ?? "all",
      terminals: body.terminals ?? ["desktop"],
      scopeDeptIds: body.scopeDeptIds ?? [],
      scopeMemberIds: body.scopeMemberIds ?? [],
      status: body.status ?? "enabled",
      version: "1.0.0",
      installedAt: new Date().toISOString(),
      usageCount: 0,
    }
    extensions.unshift(next)
    return HttpResponse.json(next)
  }),

  http.patch("/api/extensions/:id", async ({ params, request }) => {
    const body = await request.json() as UpdateExtensionRequest
    const idx = extensions.findIndex((e) => e.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: "not found" }, { status: 404 })
    extensions[idx] = { ...extensions[idx], ...body }
    return HttpResponse.json(extensions[idx])
  }),

  http.delete("/api/extensions/:id", ({ params }) => {
    const idx = extensions.findIndex((e) => e.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: "not found" }, { status: 404 })
    extensions.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),

  http.get("/api/extensions/approvals", () => {
    return HttpResponse.json(approvals.filter((a) => a.status === "pending"))
  }),

  http.get("/api/extensions/task-types", () => {
    return HttpResponse.json(taskTypes.sort((a, b) => a.sortOrder - b.sortOrder))
  }),

  http.post("/api/extensions/task-types", async ({ request }) => {
    const body = await request.json() as CreateTaskTypeRequest
    const next = {
      id: `task_${Date.now()}`,
      ...body,
      sortOrder: taskTypes.length + 1,
    }
    taskTypes.push(next)
    return HttpResponse.json(next)
  }),

  http.patch("/api/extensions/task-types/:id", async ({ params, request }) => {
    const body = await request.json() as UpdateTaskTypeRequest
    const idx = taskTypes.findIndex((item) => item.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: "not found" }, { status: 404 })
    taskTypes[idx] = { ...taskTypes[idx], ...body }
    return HttpResponse.json(taskTypes[idx])
  }),

  http.delete("/api/extensions/task-types/:id", ({ params }) => {
    const idx = taskTypes.findIndex((item) => item.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: "not found" }, { status: 404 })
    taskTypes.splice(idx, 1)
    extensions.forEach((item) => {
      if (item.categoryId === params.id) item.categoryId = undefined
    })
    return HttpResponse.json({ success: true })
  }),

  http.post("/api/extensions/approvals/:id/review", async ({ params, request }) => {
    const body = await request.json() as ReviewApprovalRequest
    const idx = approvals.findIndex((a) => a.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: "not found" }, { status: 404 })
    approvals[idx] = { ...approvals[idx], status: body.status, reviewNote: body.reviewNote }
    if (body.status === "approved") {
      const approval = approvals[idx]
      extensions.push({
        id: `ext_${approval.id}`,
        name: approval.name,
        description: approval.description,
        icon: approval.icon,
        type: approval.type,
        source: "shared",
        developer: approval.submittedBy,
        scope: approval.requestedScope,
        terminals: ["desktop", "word", "excel", "ppt"],
        scopeDeptIds: [],
        scopeMemberIds: [],
        status: "enabled",
        version: "1.0.0",
        installedAt: new Date().toISOString(),
        usageCount: 0,
      })
    }
    return HttpResponse.json(approvals[idx])
  }),
]
