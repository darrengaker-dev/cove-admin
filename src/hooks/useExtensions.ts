import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getExtensions, updateExtension, deleteExtension,
  getPendingApprovals, reviewApproval,
} from "@/lib/api/extensions"
import type { UpdateExtensionRequest, ReviewApprovalRequest } from "@/types/extension"

export const useExtensions = () =>
  useQuery({ queryKey: ["extensions"], queryFn: getExtensions, staleTime: 30_000 })

export const usePendingApprovals = () =>
  useQuery({ queryKey: ["extensions", "approvals"], queryFn: getPendingApprovals, staleTime: 30_000 })

export const useUpdateExtension = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateExtensionRequest }) =>
      updateExtension(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["extensions"] }),
  })
}

export const useDeleteExtension = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExtension(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["extensions"] }),
  })
}

export const useReviewApproval = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReviewApprovalRequest }) =>
      reviewApproval(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extensions", "approvals"] })
      qc.invalidateQueries({ queryKey: ["extensions"] })
    },
  })
}
