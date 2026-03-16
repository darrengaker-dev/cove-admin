import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getSSOSettings, saveSSOSettings, testSSOConnection,
  getOrgSyncSettings, saveOrgSyncSettings, testOrgSyncConnection,
  triggerOrgSync, getSyncLogs,
} from "@/lib/api/identity-sync"
import type { SSOSettings, OrgSyncSettings } from "@/types/identity-sync"

export const useSSOSettings = () =>
  useQuery({ queryKey: ["sso-settings"], queryFn: getSSOSettings })

export const useSaveSSOSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<SSOSettings>) => saveSSOSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sso-settings"] }),
  })
}

export const useTestSSOConnection = () =>
  useMutation({ mutationFn: testSSOConnection })

export const useOrgSyncSettings = () =>
  useQuery({ queryKey: ["org-sync-settings"], queryFn: getOrgSyncSettings })

export const useSaveOrgSyncSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<OrgSyncSettings>) => saveOrgSyncSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["org-sync-settings"] }),
  })
}

export const useTestOrgSyncConnection = () =>
  useMutation({ mutationFn: testOrgSyncConnection })

export const useTriggerOrgSync = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: triggerOrgSync,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-sync-settings"] })
      qc.invalidateQueries({ queryKey: ["sync-logs"] })
    },
  })
}

export const useSyncLogs = () =>
  useQuery({ queryKey: ["sync-logs"], queryFn: getSyncLogs })
