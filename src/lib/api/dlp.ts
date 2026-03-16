import { get, post, patch } from "./client"
import type { DlpRule, DlpStats, CreateDlpRuleBody, UpdateDlpRuleBody } from "@/types/dlp"

export const getDlpStats = () => get<DlpStats>("/api/dlp/stats")

export const getDlpRules = (params?: { category?: string; sensitivity?: string; type?: string }) =>
  get<DlpRule[]>("/api/dlp/rules", params as Record<string, string>)

export const createDlpRule = (body: CreateDlpRuleBody) => post<DlpRule>("/api/dlp/rules", body)

export const updateDlpRule = (id: string, body: UpdateDlpRuleBody) =>
  patch<DlpRule>(`/api/dlp/rules/${id}`, body)

export async function deleteDlpRule(id: string): Promise<void> {
  const res = await fetch(`/api/dlp/rules/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "删除失败" }))
    throw new Error((err as { message?: string }).message ?? "删除失败")
  }
}
