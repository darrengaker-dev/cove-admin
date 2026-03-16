import type { DauMetric, MessageMetric, TokenMetric, FeatureUsage, MetricSummary, ActiveUserMetrics, RetentionMetrics, RetentionCohortData, RetentionCohortType, LeaderboardUser, ToolLeaderboardItem } from "@/types/metrics";

export function generateDauSeries(days: number): DauMetric[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const dau = Math.floor(Math.random() * 300 + 200 + i * 2);
    const newUsers = Math.floor(Math.random() * 30 + 5);
    // 桌面端~42%  Word~20%  Excel~15%  PPT~11%  Browser~12%
    const desktop = Math.floor(dau * (0.38 + Math.random() * 0.08));
    const word    = Math.floor(dau * (0.17 + Math.random() * 0.06));
    const excel   = Math.floor(dau * (0.12 + Math.random() * 0.06));
    const ppt     = Math.floor(dau * (0.09 + Math.random() * 0.04));
    const browser = dau - desktop - word - excel - ppt;
    // rolling 7-day WAU ≈ 3.3–3.8× DAU
    const wau     = Math.floor(dau * (3.3 + Math.random() * 0.5));
    return {
      date: date.toISOString().slice(0, 10),
      dau, wau, newUsers, desktop, word, excel, ppt, browser,
    };
  });
}

export function generateTokenSeries(days: number): TokenMetric[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const total = Math.floor(Math.random() * 300000 + 400000 + i * 2000);
    return {
      date: date.toISOString().slice(0, 10),
      totalTokens: total,
    };
  });
}

export function generateMessageSeries(days: number): MessageMetric[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const total = Math.floor(Math.random() * 3000 + 1000 + i * 20);
    return {
      date: date.toISOString().slice(0, 10),
      totalMessages: total,
      aiResponses: Math.floor(total * 0.98),
    };
  });
}

export const MOCK_FEATURE_USAGE: FeatureUsage[] = [
  { feature: "chat", label: "AI 对话", count: 12453, percentage: 54 },
  { feature: "workspace", label: "工作区", count: 5821, percentage: 25 },
  { feature: "skills", label: "技能", count: 2910, percentage: 13 },
  { feature: "search", label: "网络搜索", count: 1847, percentage: 8 },
];

export const MOCK_SUMMARY: MetricSummary = {
  dau: 342,
  dauChange: 8.5,
  wau: 1248,
  wauChange: 4.2,
  mau: 3821,
  mauChange: 2.8,
  totalMessages: 28910,
  messagesChange: 12.3,
  totalUsers: 1247,
  usersChange: 5.2,
  totalTokens: 18420000,
  tokensChange: 9.7,
};

export const MOCK_ACTIVE_USERS: ActiveUserMetrics = {
  dau: 342, dauChange: 8.5,
  wau: 1248, wauChange: 4.2,
  mau: 3821, mauChange: 2.8,
  stickiness: 32.7,     // WAU/MAU = 1248/3821
  newUsers: 47,
  newUserRatio: 13.7,   // 47/342
  platforms: { desktop: 142, word: 68, excel: 52, ppt: 38, browser: 42 },
};

// Deterministic pseudo-random based on seed
function dr(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function generateRetentionCohort(days: number, type: RetentionCohortType): RetentionCohortData {
  const today = new Date();

  // Column headers: 次日, 第3日, 第4日, ... up to Day 30
  const colCount = Math.min(days, 30);
  const columns: string[] = ["次日"];
  for (let d = 3; d <= colCount + 1; d++) columns.push(`第${d}日`);

  // Base D+n retention rates (30 entries: D+1 through D+30)
  const base = type === "new_user"
    ? [0.600, 0.352, 0.248, 0.182, 0.141, 0.112, 0.090,
       0.078, 0.070, 0.063, 0.058, 0.054, 0.050, 0.047,
       0.044, 0.042, 0.040, 0.038, 0.036, 0.035, 0.034,
       0.033, 0.032, 0.031, 0.030, 0.029, 0.028, 0.028, 0.027, 0.027]
    : [0.540, 0.308, 0.210, 0.155, 0.120, 0.095, 0.076,
       0.065, 0.058, 0.053, 0.048, 0.045, 0.042, 0.040,
       0.037, 0.035, 0.033, 0.032, 0.030, 0.029, 0.028,
       0.027, 0.026, 0.025, 0.025, 0.024, 0.023, 0.023, 0.022, 0.022];

  const rows = Array.from({ length: days }, (_, idx) => {
    const daysAgo = days - idx; // oldest first
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // Deterministic new user count (700~999)
    const seed0 = d.getDate() + d.getMonth() * 31;
    const newUsers = 700 + Math.floor(dr(seed0) * 300);

    const retention: (number | null)[] = [];
    const retentionCounts: (number | null)[] = [];

    for (let c = 0; c < columns.length; c++) {
      const daysNeeded = c + 2; // D+1 needs cohort to be >= 1 day old, i.e. daysAgo >= 2
      if (daysAgo < daysNeeded) {
        retention.push(null);
        retentionCounts.push(null);
      } else {
        const variance = (dr(seed0 * 7 + c * 13) - 0.5) * 0.08; // ±4%
        const rate = Math.max(0.01, base[c] + variance);
        const pct = Math.round(rate * 1000) / 10;
        retention.push(pct);
        retentionCounts.push(Math.round(newUsers * rate));
      }
    }

    return { date: dateStr, newUsers, retention, retentionCounts };
  });

  // Summary: averages from cohorts that have data for each column
  const totalUsers = rows.reduce((s, r) => s + r.newUsers, 0);
  const summaryRetention: (number | null)[] = columns.map((_, c) => {
    const valid = rows.filter(r => r.retention[c] !== null);
    if (!valid.length) return null;
    return Math.round(valid.reduce((s, r) => s + (r.retention[c] as number), 0) / valid.length * 10) / 10;
  });

  return {
    type, days, columns,
    summary: {
      date: "任意事件",
      newUsers: totalUsers,
      retention: summaryRetention,
      retentionCounts: summaryRetention.map(r => r !== null ? Math.round(totalUsers * r / 100) : null),
    },
    rows,
  };
}

export const MOCK_USAGE_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, userId: "u001", displayName: "张伟",   email: "zhangwei@corp.com",    value: 312 },
  { rank: 2, userId: "u002", displayName: "李静",   email: "lijing@corp.com",      value: 287 },
  { rank: 3, userId: "u003", displayName: "王磊",   email: "wanglei@corp.com",     value: 254 },
  { rank: 4, userId: "u004", displayName: "陈思远", email: "chensiyuan@corp.com",  value: 231 },
  { rank: 5, userId: "u005", displayName: "刘晓凤", email: "liuxiaofeng@corp.com", value: 198 },
  { rank: 6, userId: "u006", displayName: "赵明",   email: "zhaoming@corp.com",    value: 176 },
  { rank: 7, userId: "u007", displayName: "孙悦",   email: "sunyue@corp.com",      value: 153 },
  { rank: 8, userId: "u008", displayName: "周杰",   email: "zhoujie@corp.com",     value: 142 },
  { rank: 9, userId: "u009", displayName: "吴倩",   email: "wuqian@corp.com",      value: 128 },
  { rank: 10, userId: "u010", displayName: "郑强",  email: "zhengqiang@corp.com",  value: 115 },
];

export const MOCK_TOKEN_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, userId: "u003", displayName: "王磊",   email: "wanglei@corp.com",     value: 1842300 },
  { rank: 2, userId: "u001", displayName: "张伟",   email: "zhangwei@corp.com",    value: 1654800 },
  { rank: 3, userId: "u007", displayName: "孙悦",   email: "sunyue@corp.com",      value: 1438200 },
  { rank: 4, userId: "u004", displayName: "陈思远", email: "chensiyuan@corp.com",  value: 1312600 },
  { rank: 5, userId: "u002", displayName: "李静",   email: "lijing@corp.com",      value: 1198400 },
  { rank: 6, userId: "u010", displayName: "郑强",   email: "zhengqiang@corp.com",  value: 987500  },
  { rank: 7, userId: "u005", displayName: "刘晓凤", email: "liuxiaofeng@corp.com", value: 876300  },
  { rank: 8, userId: "u008", displayName: "周杰",   email: "zhoujie@corp.com",     value: 754200  },
  { rank: 9, userId: "u006", displayName: "赵明",   email: "zhaoming@corp.com",    value: 632100  },
  { rank: 10, userId: "u009", displayName: "吴倩",  email: "wuqian@corp.com",      value: 521800  },
];

export const MOCK_TOOL_LEADERBOARD: ToolLeaderboardItem[] = [
  { rank: 1,  toolName: "网络搜索",         toolType: "tool",      callCount: 8432, userCount: 312 },
  { rank: 2,  toolName: "PDF 阅读",          toolType: "skill",     callCount: 6218, userCount: 278 },
  { rank: 3,  toolName: "飞书文档同步",      toolType: "connector", callCount: 5104, userCount: 241 },
  { rank: 4,  toolName: "代码解释器",        toolType: "skill",     callCount: 4897, userCount: 203 },
  { rank: 5,  toolName: "Excel 数据分析",    toolType: "skill",     callCount: 3821, userCount: 187 },
  { rank: 6,  toolName: "Slack 消息推送",    toolType: "connector", callCount: 3214, userCount: 156 },
  { rank: 7,  toolName: "图片生成",          toolType: "skill",     callCount: 2987, userCount: 134 },
  { rank: 8,  toolName: "文件转换",          toolType: "tool",      callCount: 2541, userCount: 118 },
  { rank: 9,  toolName: "Jira 任务创建",     toolType: "connector", callCount: 2103, userCount: 97  },
  { rank: 10, toolName: "数学公式计算",      toolType: "skill",     callCount: 1876, userCount: 84  },
];

export const MOCK_RETENTION: RetentionMetrics = {
  day1: 62.4,
  day1Change: 1.2,
  day7: 38.1,
  day7Change: -0.8,
  day30: 22.3,
  day30Change: 0.5,
  curve: [
    { day: 1,  rate: 62.4 },
    { day: 3,  rate: 52.1 },
    { day: 7,  rate: 38.1 },
    { day: 14, rate: 30.2 },
    { day: 21, rate: 25.8 },
    { day: 30, rate: 22.3 },
  ],
};
