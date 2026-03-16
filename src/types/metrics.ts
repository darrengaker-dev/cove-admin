export interface MetricSummary {
  dau: number;
  dauChange: number;
  wau: number;          // 周活跃用户（北极星指标）
  wauChange: number;    // 较上周变化%
  mau: number;          // 月活跃用户
  mauChange: number;    // 较上月变化%
  totalMessages: number;
  messagesChange: number;
  totalUsers: number;
  usersChange: number;
  totalTokens: number;  // Token 总消耗量
  tokensChange: number; // 较上期变化%
}

export interface DauMetric {
  date: string;
  dau: number;
  wau: number;       // 滚动7日周活跃用户
  newUsers: number;
  desktop: number;   // Cove 桌面端
  word: number;      // Cove in Word
  excel: number;     // Cove in Excel
  ppt: number;       // Cove in PPT
  browser: number;   // Cove in Browser
}

export interface MessageMetric {
  date: string;
  totalMessages: number;
  aiResponses: number;
}

export interface TokenMetric {
  date: string;
  totalTokens: number;
}

export interface FeatureUsage {
  feature: string;
  label: string;
  count: number;
  percentage: number;
}

export interface PlatformBreakdown {
  desktop: number;   // Cove 桌面端
  word: number;      // Cove in Word
  excel: number;     // Cove in Excel
  ppt: number;       // Cove in PPT
  browser: number;   // Cove in Browser
}

export interface ActiveUserMetrics {
  dau: number;
  dauChange: number;
  wau: number;
  wauChange: number;
  mau: number;
  mauChange: number;
  stickiness: number;    // DAU/MAU * 100
  newUsers: number;      // 今日新增
  newUserRatio: number;  // 新用户占比 %
  platforms: PlatformBreakdown;
}

export interface RetentionPoint {
  day: number;
  rate: number;
}

export interface RetentionMetrics {
  day1: number;
  day1Change: number;
  day7: number;
  day7Change: number;
  day30: number;
  day30Change: number;
  curve: RetentionPoint[];
}

// Cohort retention table (新/活跃用户留存分析)
export type RetentionCohortType = "new_user" | "active_user";
export type RetentionPlatform = "all" | "desktop" | "word" | "excel" | "ppt" | "browser";

// Leaderboard types
export interface LeaderboardUser {
  rank: number;
  userId: string;
  displayName: string;
  email: string;
  value: number;
}

export type ToolType = "skill" | "tool" | "connector";

export interface ToolLeaderboardItem {
  rank: number;
  toolName: string;
  toolType: ToolType;
  callCount: number;
  userCount: number;
}

export interface RetentionCohortRow {
  date: string;                          // "任意事件" | "MM-DD"
  newUsers: number;
  retention: (number | null)[];          // percentage, null = no data yet
  retentionCounts: (number | null)[];
}

export interface RetentionCohortData {
  type: RetentionCohortType;
  days: number;
  columns: string[];                     // ["次日","第3日","第4日",...]
  summary: RetentionCohortRow;
  rows: RetentionCohortRow[];
}
