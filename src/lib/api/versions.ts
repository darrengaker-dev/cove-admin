import { get, post, put } from "./client"
import type { AppVersion, UpdateRecord, UpdatePolicy, ClientStats } from "@/types/version"

export const getCurrentVersion  = () => get<AppVersion>("/api/versions/current")
export const getLatestVersion   = () => get<AppVersion>("/api/versions/latest")
export const getClientStats     = () => get<ClientStats>("/api/versions/clients")
export const getVersionPolicy   = () => get<UpdatePolicy>("/api/versions/policy")
export const saveVersionPolicy  = (body: UpdatePolicy) => put<UpdatePolicy>("/api/versions/policy", body)
export const pushUpdate         = () => post<{ status: string; pushed: number }>("/api/versions/push")
export const triggerUpdate      = () => post<{ status: string }>("/api/versions/update")
export const getVersionHistory  = () => get<UpdateRecord[]>("/api/versions/history")
