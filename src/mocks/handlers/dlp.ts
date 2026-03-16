import { http, HttpResponse } from "msw"
import type { DlpRule, DlpStats, CreateDlpRuleBody, UpdateDlpRuleBody } from "@/types/dlp"
import { MOCK_DLP_RULES, getMockDlpStats } from "../data/dlp"

let rules = [...MOCK_DLP_RULES]

export const dlpHandlers = [
  http.get("/api/dlp/stats", () => {
    const stats: DlpStats = {
      ...getMockDlpStats(),
      totalRules: rules.length,
      enabledRules: rules.filter((r) => r.isEnabled).length,
    }
    return HttpResponse.json<DlpStats>(stats)
  }),

  http.get("/api/dlp/rules", ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get("category") ?? ""
    const sensitivity = url.searchParams.get("sensitivity") ?? ""
    const type = url.searchParams.get("type") ?? ""

    let filtered = rules
    if (category)    filtered = filtered.filter((r) => r.category === category)
    if (sensitivity) filtered = filtered.filter((r) => r.sensitivity === sensitivity)
    if (type)        filtered = filtered.filter((r) => r.type === type)

    return HttpResponse.json<DlpRule[]>(filtered)
  }),

  http.post("/api/dlp/rules", async ({ request }) => {
    const body = await request.json() as CreateDlpRuleBody
    const now = new Date().toISOString()
    const next: DlpRule = {
      ...body,
      description: body.description ?? "",
      id: `dlp-custom-${Date.now()}`,
      type: "custom",
      isEnabled: true,
      matchCount: 0,
      blockCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    rules = [...rules, next]
    return HttpResponse.json<DlpRule>(next, { status: 201 })
  }),

  http.patch("/api/dlp/rules/:id", async ({ params, request }) => {
    const body = await request.json() as UpdateDlpRuleBody
    rules = rules.map((r) =>
      r.id === params["id"] ? { ...r, ...body, updatedAt: new Date().toISOString() } : r
    )
    const updated = rules.find((r) => r.id === params["id"])
    if (!updated) return HttpResponse.json({ message: "Not found" }, { status: 404 })
    return HttpResponse.json<DlpRule>(updated)
  }),

  http.delete("/api/dlp/rules/:id", ({ params }) => {
    const rule = rules.find((r) => r.id === params["id"])
    if (!rule) return HttpResponse.json({ message: "Not found" }, { status: 404 })
    if (rule.type === "builtin") return HttpResponse.json({ message: "内置规则不可删除" }, { status: 403 })
    rules = rules.filter((r) => r.id !== params["id"])
    return HttpResponse.json({ success: true })
  }),
]
