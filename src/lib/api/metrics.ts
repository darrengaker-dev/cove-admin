import { get } from "./client";
import type { MetricSummary, DauMetric, MessageMetric, TokenMetric, FeatureUsage, ActiveUserMetrics, RetentionMetrics, RetentionCohortData, RetentionCohortType, LeaderboardUser, ToolLeaderboardItem } from "@/types/metrics";

export const getMetricSummary = () =>
  get<MetricSummary>("/api/metrics/summary");

export const getDauMetrics = (days: number) =>
  get<DauMetric[]>("/api/metrics/dau", { days });

export const getMessageMetrics = (days: number) =>
  get<MessageMetric[]>("/api/metrics/messages", { days });

export const getTokenMetrics = (days: number) =>
  get<TokenMetric[]>("/api/metrics/tokens", { days });

export const getFeatureUsage = () =>
  get<FeatureUsage[]>("/api/metrics/feature-usage");

export const getActiveUserMetrics = () =>
  get<ActiveUserMetrics>("/api/metrics/active-users");

export const getRetentionMetrics = () =>
  get<RetentionMetrics>("/api/metrics/retention");

export const getRetentionCohort = (params: { days: number; type: RetentionCohortType }) =>
  get<RetentionCohortData>("/api/metrics/retention-cohort", params);

export const getUsageLeaderboard = () =>
  get<LeaderboardUser[]>("/api/metrics/leaderboard/usage");

export const getTokenLeaderboard = () =>
  get<LeaderboardUser[]>("/api/metrics/leaderboard/tokens");

export const getToolLeaderboard = () =>
  get<ToolLeaderboardItem[]>("/api/metrics/leaderboard/tools");
