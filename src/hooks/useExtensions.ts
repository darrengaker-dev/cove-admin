import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getExtensions, createExtension, updateExtension, deleteExtension,
  getPendingApprovals, reviewApproval,
  getTaskTypes, createTaskType, updateTaskType, deleteTaskType,
} from "@/lib/api/extensions"
import type {
  UpdateExtensionRequest,
  ReviewApprovalRequest,
  CreateTaskTypeRequest,
  UpdateTaskTypeRequest,
} from "@/types/extension"

export const useExtensions = () =>
  useQuery({ queryKey: ["extensions"], queryFn: getExtensions, staleTime: 30_000 })

export const useCreateExtension = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateExtensionRequest) => createExtension(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["extensions"] }),
  })
}

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

export const useTaskTypes = () =>
  useQuery({ queryKey: ["extensions", "task-types"], queryFn: getTaskTypes, staleTime: 30_000 })

export const useCreateTaskType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTaskTypeRequest) => createTaskType(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["extensions", "task-types"] }),
  })
}

export const useUpdateTaskType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTaskTypeRequest }) => updateTaskType(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["extensions", "task-types"] }),
  })
}

export const useDeleteTaskType = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTaskType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extensions", "task-types"] })
      qc.invalidateQueries({ queryKey: ["extensions"] })
    },
  })
}
