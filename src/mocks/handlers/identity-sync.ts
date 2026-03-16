import { http, HttpResponse } from "msw"
import { mockSSOSettings, mockOrgSyncSettings, mockSyncLogs } from "@/mocks/data/identity-sync"
import type { SSOSettings, OrgSyncSettings } from "@/types/identity-sync"

let ssoSettings = { ...mockSSOSettings }
let orgSyncSettings = { ...mockOrgSyncSettings }
const syncLogs = [...mockSyncLogs]

export const identitySyncHandlers = [
  http.get("/api/settings/sso", () => HttpResponse.json(ssoSettings)),

  http.put("/api/settings/sso", async ({ request }) => {
    const body = await request.json() as Partial<SSOSettings>
    ssoSettings = { ...ssoSettings, ...body }
    return HttpResponse.json(ssoSettings)
  }),

  http.post("/api/settings/sso/test", async () => {
    await new Promise((r) => setTimeout(r, 1200))
    return HttpResponse.json({
      success: true,
      message: "连接成功，找到 247 个用户对象",
      testedAt: new Date().toISOString(),
    })
  }),

  http.get("/api/settings/org-sync", () => HttpResponse.json(orgSyncSettings)),

  http.put("/api/settings/org-sync", async ({ request }) => {
    const body = await request.json() as Partial<OrgSyncSettings>
    orgSyncSettings = { ...orgSyncSettings, ...body }
    return HttpResponse.json(orgSyncSettings)
  }),

  http.post("/api/settings/org-sync/test", async () => {
    await new Promise((r) => setTimeout(r, 800))
    return HttpResponse.json({ success: true, message: "API 连接正常，共发现 3 个根部门" })
  }),

  http.post("/api/settings/org-sync/trigger", async () => {
    await new Promise((r) => setTimeout(r, 1500))
    const entry = {
      id: `log_${Date.now()}`,
      triggeredBy: "manual" as const,
      triggeredAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1480,
      status: "success" as const,
      stats: { added: 0, updated: 4, disabled: 0, errors: 0 },
    }
    syncLogs.unshift(entry)
    orgSyncSettings.lastSyncAt = entry.triggeredAt
    orgSyncSettings.lastSyncStatus = "success"
    orgSyncSettings.lastSyncStats = entry.stats
    return HttpResponse.json(entry)
  }),

  http.get("/api/settings/org-sync/logs", () => HttpResponse.json(syncLogs)),
]
