import { http, HttpResponse } from "msw"
import { mockRegistrations, mockAutoApprovalRules } from "@/mocks/data/registrations"
import type { AutoApprovalRule } from "@/types/user"

const registrations = [...mockRegistrations]
const autoRules = [...mockAutoApprovalRules]

export const registrationHandlers = [
  http.get("/api/users/registrations", () => {
    return HttpResponse.json(registrations.filter((r) => r.status === "pending"))
  }),

  http.post("/api/users/registrations/:id/review", async ({ params, request }) => {
    const body = await request.json() as { status: "approved" | "rejected"; reviewNote?: string }
    const idx = registrations.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: "not found" }, { status: 404 })
    registrations[idx] = { ...registrations[idx], status: body.status, reviewNote: body.reviewNote }
    return HttpResponse.json(registrations[idx])
  }),

  http.post("/api/users/registrations/batch-review", async ({ request }) => {
    const body = await request.json() as { ids: string[]; status: "approved" | "rejected" }
    body.ids.forEach((id) => {
      const idx = registrations.findIndex((r) => r.id === id)
      if (idx !== -1) registrations[idx] = { ...registrations[idx], status: body.status }
    })
    return HttpResponse.json({ success: true, count: body.ids.length })
  }),

  http.get("/api/users/auto-approval-rules", () => {
    return HttpResponse.json(autoRules)
  }),

  http.post("/api/users/auto-approval-rules", async ({ request }) => {
    const body = await request.json() as Omit<AutoApprovalRule, "id" | "createdAt">
    const rule: AutoApprovalRule = {
      ...body,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    autoRules.push(rule)
    return HttpResponse.json(rule)
  }),

  http.patch("/api/users/auto-approval-rules/:id", async ({ params, request }) => {
    const body = await request.json() as Partial<AutoApprovalRule>
    const idx = autoRules.findIndex((r) => r.id === params.id)
    if (idx === -1) return HttpResponse.json({ error: "not found" }, { status: 404 })
    autoRules[idx] = { ...autoRules[idx], ...body }
    return HttpResponse.json(autoRules[idx])
  }),

  http.delete("/api/users/auto-approval-rules/:id", ({ params }) => {
    const idx = autoRules.findIndex((r) => r.id === params.id)
    if (idx !== -1) autoRules.splice(idx, 1)
    return HttpResponse.json({ success: true })
  }),
]
