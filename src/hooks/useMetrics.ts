import { useQuery } from "@tanstack/react-query";
import { getMetricSummary, getDauMetrics, getMessageMetrics, getTokenMetrics, getFeatureUsage, getActiveUserMetrics, getRetentionMetrics, getRetentionCohort, getUsageLeaderboard, getTokenLeaderboard, getToolLeaderboard } from "@/lib/api/metrics";
import type { RetentionCohortType } from "@/types/metrics";

export function useMetricSummary() {
  return useQuery({ queryKey: ["metrics", "summary"], queryFn: getMetricSummary });
}

export function useDauMetrics(days: number) {
  return useQuery({ queryKey: ["metrics", "dau", days], queryFn: () => getDauMetrics(days) });
}

export function useMessageMetrics(days: number) {
  return useQuery({ queryKey: ["metrics", "messages", days], queryFn: () => getMessageMetrics(days) });
}

export function useTokenMetrics(days: number) {
  return useQuery({ queryKey: ["metrics", "tokens", days], queryFn: () => getTokenMetrics(days) });
}

export function useFeatureUsage() {
  return useQuery({ queryKey: ["metrics", "feature-usage"], queryFn: getFeatureUsage });
}

export function useActiveUserMetrics() {
  return useQuery({ queryKey: ["metrics", "active-users"], queryFn: getActiveUserMetrics });
}

export function useRetentionMetrics() {
  return useQuery({ queryKey: ["metrics", "retention"], queryFn: getRetentionMetrics });
}

export function useRetentionCohort(params: { days: number; type: RetentionCohortType }) {
  return useQuery({
    queryKey: ["metrics", "retention-cohort", params.days, params.type],
    queryFn: () => getRetentionCohort(params),
  });
}

export function useUsageLeaderboard() {
  return useQuery({ queryKey: ["metrics", "leaderboard", "usage"], queryFn: getUsageLeaderboard });
}

export function useTokenLeaderboard() {
  return useQuery({ queryKey: ["metrics", "leaderboard", "tokens"], queryFn: getTokenLeaderboard });
}

export function useToolLeaderboard() {
  return useQuery({ queryKey: ["metrics", "leaderboard", "tools"], queryFn: getToolLeaderboard });
}
