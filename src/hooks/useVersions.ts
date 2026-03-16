import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getCurrentVersion, getLatestVersion, getClientStats,
  getVersionPolicy, saveVersionPolicy, pushUpdate, getVersionHistory,
} from "@/lib/api/versions"
import type { UpdatePolicy } from "@/types/version"

export function useCurrentVersion() {
  return useQuery({ queryKey: ["versions", "current"], queryFn: getCurrentVersion })
}

export function useLatestVersion() {
  return useQuery({ queryKey: ["versions", "latest"], queryFn: getLatestVersion })
}

export function useClientStats() {
  return useQuery({ queryKey: ["versions", "clients"], queryFn: getClientStats })
}

export function useVersionPolicy() {
  return useQuery({ queryKey: ["versions", "policy"], queryFn: getVersionPolicy })
}

export function useSavePolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdatePolicy) => saveVersionPolicy(body),
    onSuccess: (data) => qc.setQueryData(["versions", "policy"], data),
  })
}

export function usePushUpdate() {
  return useMutation({ mutationFn: pushUpdate })
}

export function useVersionHistory() {
  return useQuery({ queryKey: ["versions", "history"], queryFn: getVersionHistory })
}
