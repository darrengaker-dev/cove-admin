import { get, post, put } from "./client"
import type { LicenseInfo, LicenseActivation, BrandSettings, SystemRules } from "@/types/enterprise-settings"

export const getLicense          = ()                    => get<LicenseInfo>("/api/settings/license")
export const activateLicense     = ()                    => post<LicenseInfo>("/api/settings/license/activate", {})
export const getLicenseHistory   = ()                    => get<LicenseActivation[]>("/api/settings/license/history")
export const getBrandSettings    = ()                    => get<BrandSettings>("/api/settings/brand")
export const saveBrandSettings   = (body: BrandSettings) => put<BrandSettings>("/api/settings/brand", body)
export const getSystemRules      = ()                    => get<SystemRules>("/api/settings/rules")
export const saveSystemRules     = (body: Partial<SystemRules>) => put<SystemRules>("/api/settings/rules", body)
