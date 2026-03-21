import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getLicense, activateLicense, getLicenseHistory,
  getBrandSettings, saveBrandSettings,
  getSystemRules, saveSystemRules,
  getNavigationSettings, saveNavigationSettings,
} from "@/lib/api/enterprise-settings"
import type { BrandSettings, SystemRules, ExpertNavigationSettings } from "@/types/enterprise-settings"

export function useLicense() {
  return useQuery({ queryKey: ["license"], queryFn: getLicense })
}

export function useLicenseHistory() {
  return useQuery({ queryKey: ["license-history"], queryFn: getLicenseHistory })
}

export function useActivateLicense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: activateLicense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["license"] })
      qc.invalidateQueries({ queryKey: ["license-history"] })
    },
  })
}

export function useBrandSettings() {
  return useQuery({ queryKey: ["brand-settings"], queryFn: getBrandSettings })
}

export function useSaveBrandSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: BrandSettings) => saveBrandSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand-settings"] }),
  })
}

export function useSystemRules() {
  return useQuery({ queryKey: ["system-rules"], queryFn: getSystemRules })
}

export function useSaveSystemRules() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<SystemRules>) => saveSystemRules(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["system-rules"] }),
  })
}

export function useNavigationSettings() {
  return useQuery({ queryKey: ["navigation-settings"], queryFn: getNavigationSettings })
}

export function useSaveNavigationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ExpertNavigationSettings) => saveNavigationSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["navigation-settings"] }),
  })
}
