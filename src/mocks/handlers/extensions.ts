import { http, HttpResponse } from "msw"
import { mockExtensions, mockApprovals } from "@/mocks/data/extensions"
import type { UpdateExtensionRequest, ReviewApprovalRequest } from "@/types/extension"

const extensions = [...mockExtensions]
const approvals = [...mockApprovals]

export const extensionHandlers = [
  http.get("/api/extensions", () => {
    return HttpResponse.json(extensions)
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
