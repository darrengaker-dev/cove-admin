import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getDlpStats, getDlpRules, createDlpRule, updateDlpRule, deleteDlpRule } from "@/lib/api/dlp"
import type { CreateDlpRuleBody, UpdateDlpRuleBody } from "@/types/dlp"

export function useDlpStats() {
  return useQuery({ queryKey: ["dlp-stats"], queryFn: getDlpStats })
}

export function useDlpRules(filter?: { category?: string; sensitivity?: string; type?: string }) {
  return useQuery({
    queryKey: ["dlp-rules", filter],
    queryFn: () => getDlpRules(filter),
  })
}

export function useCreateDlpRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateDlpRuleBody) => createDlpRule(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dlp-rules"] }); qc.invalidateQueries({ queryKey: ["dlp-stats"] }) },
  })
}

export function useUpdateDlpRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDlpRuleBody }) => updateDlpRule(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dlp-rules"] }); qc.invalidateQueries({ queryKey: ["dlp-stats"] }) },
  })
}

export function useDeleteDlpRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDlpRule(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dlp-rules"] }); qc.invalidateQueries({ queryKey: ["dlp-stats"] }) },
  })
}
