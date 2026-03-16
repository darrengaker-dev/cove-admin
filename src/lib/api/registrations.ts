import { request } from "./client"
import type { RegistrationRequest, AutoApprovalRule } from "@/types/user"

export const getPendingRegistrations = (): Promise<RegistrationRequest[]> =>
  request("/api/users/registrations")

export const reviewRegistration = (id: string, status: "approved" | "rejected", reviewNote?: string) =>
  request<RegistrationRequest>(`/api/users/registrations/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ status, reviewNote }),
  })

export const batchReviewRegistrations = (ids: string[], status: "approved" | "rejected") =>
  request<{ success: boolean; count: number }>("/api/users/registrations/batch-review", {
    method: "POST",
    body: JSON.stringify({ ids, status }),
  })

export const getAutoApprovalRules = (): Promise<AutoApprovalRule[]> =>
  request("/api/users/auto-approval-rules")

export const createAutoApprovalRule = (body: Omit<AutoApprovalRule, "id" | "createdAt">) =>
  request<AutoApprovalRule>("/api/users/auto-approval-rules", {
    method: "POST",
    body: JSON.stringify(body),
  })

export const updateAutoApprovalRule = (id: string, body: Partial<AutoApprovalRule>) =>
  request<AutoApprovalRule>(`/api/users/auto-approval-rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })

export const deleteAutoApprovalRule = (id: string) =>
  request<void>(`/api/users/auto-approval-rules/${id}`, { method: "DELETE" })
