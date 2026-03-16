import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getRoles, createRole, updateRole, deleteRole, getThreeElement, setThreeElementMode } from "@/lib/api/permissions"
import type { CreateRoleRequest, UpdateRoleRequest } from "@/types/permissions"

const ROLES_KEY = ["permissions", "roles"] as const
const THREE_KEY = ["permissions", "three-element"] as const

export function useRoles() {
  return useQuery({ queryKey: ROLES_KEY, queryFn: getRoles })
}

export function useThreeElement() {
  return useQuery({ queryKey: THREE_KEY, queryFn: getThreeElement })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRoleRequest) => createRole(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRoleRequest }) => updateRole(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  })
}

export function useSetThreeElementMode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (mode: string) => setThreeElementMode(mode),
    onSuccess: () => qc.invalidateQueries({ queryKey: THREE_KEY }),
  })
}
