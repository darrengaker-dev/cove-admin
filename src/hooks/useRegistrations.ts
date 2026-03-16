import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPendingRegistrations,
  reviewRegistration,
  batchReviewRegistrations,
  getAutoApprovalRules,
  createAutoApprovalRule,
  updateAutoApprovalRule,
  deleteAutoApprovalRule,
} from "@/lib/api/registrations"
import type { AutoApprovalRule } from "@/types/user"

export const usePendingRegistrations = () =>
  useQuery({ queryKey: ["registrations", "pending"], queryFn: getPendingRegistrations, staleTime: 30_000 })

export const useReviewRegistration = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: "approved" | "rejected"; note?: string }) =>
      reviewRegistration(id, status, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registrations"] }),
  })
}

export const useBatchReviewRegistrations = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: "approved" | "rejected" }) =>
      batchReviewRegistrations(ids, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registrations"] }),
  })
}

export const useAutoApprovalRules = () =>
  useQuery({ queryKey: ["auto-approval-rules"], queryFn: getAutoApprovalRules })

export const useCreateAutoApprovalRule = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Omit<AutoApprovalRule, "id" | "createdAt">) => createAutoApprovalRule(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auto-approval-rules"] }),
  })
}

export const useUpdateAutoApprovalRule = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AutoApprovalRule> }) => updateAutoApprovalRule(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auto-approval-rules"] }),
  })
}

export const useDeleteAutoApprovalRule = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAutoApprovalRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auto-approval-rules"] }),
  })
}
