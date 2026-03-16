import { http, HttpResponse } from "msw"
import type { LicenseInfo, LicenseActivation, BrandSettings, SystemRules } from "@/types/enterprise-settings"

let license: LicenseInfo = {
  id: "LIC-2024-COVE-ENT-001",
  plan: "企业版",
  status: "active",
  activatedAt: "2025-09-01T00:00:00Z",
  expiresAt: "2026-08-31T23:59:59Z",
  serverId: "SRV-A1B2C3D4E5F6",
  maxUsers: 500,
  usedUsers: 312,
  maxApps: 20,
  usedApps: 7,
  maxSeats: 500,
  usedSeats: 312,
}

const activationHistory: LicenseActivation[] = [
  {
    id: "act-1",
    activatedAt: "2025-09-01T09:30:00Z",
    expiresAt: "2026-08-31T23:59:59Z",
    plan: "企业版",
    operator: "admin@cove.ai",
  },
  {
    id: "act-2",
    activatedAt: "2024-09-01T10:00:00Z",
    expiresAt: "2025-08-31T23:59:59Z",
    plan: "标准版",
    operator: "admin@cove.ai",
  },
]

let brand: BrandSettings = {
  productName: "Cove",
  orgName: "",
  contactEmail: "support@cove.ai",
  contactPhone: "",
  footerText: "",
  primaryColor: "#2563EB",
  accentColor: "#7C3AED",
  logoLightUrl: "",
  logoDarkUrl: "",
}

let rules: SystemRules = {
  systemPrompt: "你是一个专业、严谨的企业级 AI 助手。请用正式、简洁的语言回答用户问题，避免使用口语化表达。涉及敏感信息时，须提示用户注意信息安全合规要求。",
  outputStyle: "professional",
  updatedAt: "2026-03-10T14:00:00Z",
  updatedBy: "admin@cove.ai",
}

export const enterpriseSettingsHandlers = [
  http.get("/api/settings/license", () => HttpResponse.json<LicenseInfo>(license)),

  http.post("/api/settings/license/activate", async () => {
    await new Promise((r) => setTimeout(r, 1200))
    license = { ...license, status: "active", activatedAt: new Date().toISOString() }
    return HttpResponse.json<LicenseInfo>(license)
  }),

  http.get("/api/settings/license/history", () =>
    HttpResponse.json<LicenseActivation[]>(activationHistory)
  ),

  http.get("/api/settings/brand", () => HttpResponse.json<BrandSettings>(brand)),

  http.put("/api/settings/brand", async ({ request }) => {
    brand = await request.json() as BrandSettings
    return HttpResponse.json<BrandSettings>(brand)
  }),

  http.get("/api/settings/rules", () => HttpResponse.json<SystemRules>(rules)),

  http.put("/api/settings/rules", async ({ request }) => {
    const body = await request.json() as Partial<SystemRules>
    rules = {
      ...rules,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin@cove.ai",
    }
    return HttpResponse.json<SystemRules>(rules)
  }),
]
