import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { MetricCard } from "@/components/common/MetricCard"
import { InfoTooltip } from "@/components/common/InfoTooltip"
import { DauChart } from "@/components/metrics/DauChart"
import { TokenChart } from "@/components/metrics/TokenChart"
import { ActiveUsersCard } from "@/components/metrics/ActiveUsersCard"
import { RetentionCard } from "@/components/metrics/RetentionCard"
import { UsageLeaderboardCard, TokenLeaderboardCard, ToolLeaderboardCard } from "@/components/metrics/LeaderboardCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMetricSummary } from "@/hooks/useMetrics"

const TOOLTIPS = {
  wau: "一周内有 2 天及以上访问客户端且完成一次以上对话的用户数（含桌面端和插件端）",
  mau: "当月访问产品的去重用户数",
  users: "系统中当前已注册的账号总数",
  messages: "所选时间范围内用户发送的消息总数",
  tokens: "所选时间范围内所有用户累计消耗的 Token 总量",
  wauTrend: "滚动 7 日周活跃用户数（WAU）的历史变化趋势",
}

function formatTokens(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

export function DashboardPage() {
  const [days, setDays] = useState(30)
  const { data: summary, isLoading } = useMetricSummary()

  return (
    <div>
      <PageHeader
        title="仪表盘"
        description="系统运营数据概览"
        actions={
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">最近 7 天</SelectItem>
              <SelectItem value="30">最近 30 天</SelectItem>
              <SelectItem value="90">最近 90 天</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="p-6 space-y-6">
        {/* Row 1 — 核心指标卡（5 个） */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <MetricCard
            title="周活用户 WAU"
            value={summary?.wau ?? 0}
            change={summary?.wauChange}
            changeLabel="较上周"
            isLoading={isLoading}
            tooltip={TOOLTIPS.wau}
          />
          <MetricCard
            title="月活用户 MAU"
            value={summary?.mau ?? 0}
            change={summary?.mauChange}
            changeLabel="较上月"
            isLoading={isLoading}
            tooltip={TOOLTIPS.mau}
          />
          <MetricCard
            title="注册用户"
            value={summary?.totalUsers ?? 0}
            change={summary?.usersChange}
            isLoading={isLoading}
            tooltip={TOOLTIPS.users}
          />
          <MetricCard
            title="消息总量"
            value={summary?.totalMessages ?? 0}
            change={summary?.messagesChange}
            isLoading={isLoading}
            tooltip={TOOLTIPS.messages}
          />
          <MetricCard
            title="Token 总量"
            value={summary?.totalTokens ?? 0}
            change={summary?.tokensChange}
            isLoading={isLoading}
            tooltip={TOOLTIPS.tokens}
            formatter={formatTokens}
          />
        </div>

        {/* Row 2 — 周活趋势 + Token使用量趋势 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1 text-sm font-medium">
                周活趋势
                <InfoTooltip text={TOOLTIPS.wauTrend} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DauChart days={days} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Token 使用量趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <TokenChart days={days} />
            </CardContent>
          </Card>
        </div>

        {/* Row 3 — 周活用户分布 */}
        <ActiveUsersCard />

        {/* Row 4 — 榜单 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <UsageLeaderboardCard />
          <TokenLeaderboardCard />
          <ToolLeaderboardCard />
        </div>

        {/* Row 5 — 用户留存（全宽） */}
        <RetentionCard />

      </div>
    </div>
  )
}
