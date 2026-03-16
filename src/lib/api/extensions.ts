import { request } from "./client"
import type { Extension, ExtensionApproval, UpdateExtensionRequest, ReviewApprovalRequest } from "@/types/extension"

export const getExtensions = (): Promise<Extension[]> =>
  request("/api/extensions")

export const updateExtension = (id: string, body: UpdateExtensionRequest): Promise<Extension> =>
  request(`/api/extensions/${id}`, { method: "PATCH", body: JSON.stringify(body) })

export const deleteExtension = (id: string): Promise<void> =>
  request(`/api/extensions/${id}`, { method: "DELETE" })

export const getPendingApprovals = (): Promise<ExtensionApproval[]> =>
  request("/api/extensions/approvals")

export const reviewApproval = (id: string, body: ReviewApprovalRequest): Promise<ExtensionApproval> =>
  request(`/api/extensions/approvals/${id}/review`, { method: "POST", body: JSON.stringify(body) })
