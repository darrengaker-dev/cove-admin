import { http, HttpResponse } from "msw";
import type { MetricSummary, DauMetric, MessageMetric, TokenMetric, FeatureUsage, ActiveUserMetrics, RetentionMetrics, RetentionCohortData, RetentionCohortType, LeaderboardUser, ToolLeaderboardItem } from "@/types/metrics";
import { MOCK_SUMMARY, MOCK_FEATURE_USAGE, MOCK_ACTIVE_USERS, MOCK_RETENTION, MOCK_USAGE_LEADERBOARD, MOCK_TOKEN_LEADERBOARD, MOCK_TOOL_LEADERBOARD, generateDauSeries, generateMessageSeries, generateTokenSeries, generateRetentionCohort } from "../data/metrics";

export const metricHandlers = [
  http.get("/api/metrics/summary", () => HttpResponse.json<MetricSummary>(MOCK_SUMMARY)),

  http.get("/api/metrics/dau", ({ request }) => {
    const days = parseInt(new URL(request.url).searchParams.get("days") ?? "30");
    return HttpResponse.json<DauMetric[]>(generateDauSeries(days));
  }),

  http.get("/api/metrics/messages", ({ request }) => {
    const days = parseInt(new URL(request.url).searchParams.get("days") ?? "30");
    return HttpResponse.json<MessageMetric[]>(generateMessageSeries(days));
  }),

  http.get("/api/metrics/tokens", ({ request }) => {
    const days = parseInt(new URL(request.url).searchParams.get("days") ?? "30");
    return HttpResponse.json<TokenMetric[]>(generateTokenSeries(days));
  }),

  http.get("/api/metrics/feature-usage", () => HttpResponse.json<FeatureUsage[]>(MOCK_FEATURE_USAGE)),

  http.get("/api/metrics/active-users", () => HttpResponse.json<ActiveUserMetrics>(MOCK_ACTIVE_USERS)),

  http.get("/api/metrics/retention", () => HttpResponse.json<RetentionMetrics>(MOCK_RETENTION)),

  http.get("/api/metrics/retention-cohort", ({ request }) => {
    const params = new URL(request.url).searchParams;
    const days = parseInt(params.get("days") ?? "7");
    const type = (params.get("type") ?? "new_user") as RetentionCohortType;
    return HttpResponse.json<RetentionCohortData>(generateRetentionCohort(days, type));
  }),

  http.get("/api/metrics/leaderboard/usage", () =>
    HttpResponse.json<LeaderboardUser[]>(MOCK_USAGE_LEADERBOARD)),

  http.get("/api/metrics/leaderboard/tokens", () =>
    HttpResponse.json<LeaderboardUser[]>(MOCK_TOKEN_LEADERBOARD)),

  http.get("/api/metrics/leaderboard/tools", () =>
    HttpResponse.json<ToolLeaderboardItem[]>(MOCK_TOOL_LEADERBOARD)),
];
