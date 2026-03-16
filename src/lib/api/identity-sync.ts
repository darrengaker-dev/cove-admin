import { request } from "./client"
import type { SSOSettings, OrgSyncSettings, SyncLogEntry } from "@/types/identity-sync"

export const getSSOSettings = (): Promise<SSOSettings> => request("/api/settings/sso")
export const saveSSOSettings = (body: Partial<SSOSettings>): Promise<SSOSettings> =>
  request("/api/settings/sso", { method: "PUT", body: JSON.stringify(body) })
export const testSSOConnection = (): Promise<{ success: boolean; message: string; testedAt: string }> =>
  request("/api/settings/sso/test", { method: "POST" })

export const getOrgSyncSettings = (): Promise<OrgSyncSettings> => request("/api/settings/org-sync")
export const saveOrgSyncSettings = (body: Partial<OrgSyncSettings>): Promise<OrgSyncSettings> =>
  request("/api/settings/org-sync", { method: "PUT", body: JSON.stringify(body) })
export const testOrgSyncConnection = (): Promise<{ success: boolean; message: string }> =>
  request("/api/settings/org-sync/test", { method: "POST" })
export const triggerOrgSync = (): Promise<SyncLogEntry> =>
  request("/api/settings/org-sync/trigger", { method: "POST" })
export const getSyncLogs = (): Promise<SyncLogEntry[]> => request("/api/settings/org-sync/logs")
