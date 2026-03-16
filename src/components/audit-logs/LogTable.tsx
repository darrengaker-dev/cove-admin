import { DataTable, type Column } from "@/components/common/DataTable"
import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import type { AuditLog, AuditAction, LogCategory } from "@/types/audit-log"

export const ACTION_LABELS: Record<AuditAction, string> = {
  "auth.login": "登录", "auth.logout": "退出", "auth.login_failed": "登录失败",
  "auth.password_reset": "密码重置", "auth.force_logout": "强制下线",
  "user.create": "创建用户", "user.update": "更新用户", "user.delete": "删除用户",
  "role.assign": "分配权限", "role.revoke": "撤销权限",
  "apikey.create": "创建 API Key", "apikey.delete": "删除 API Key",
  "data.export": "数据导出", "system.config_change": "系统配置变更", "content.flagged": "内容安全拦截",
  "message.send": "发送消息", "message.delete": "删除消息",
  "conversation.create": "新建会话", "conversation.delete": "删除会话",
  "file.upload": "上传文件", "file.delete": "删除文件",
  "command.execute": "执行命令", "skill.run": "调用技能",
  "model.switch": "切换模型", "assistant.switch": "切换助手",
  "workspace.open": "打开文件", "settings.change": "修改设置", "feature.use": "功能使用",
}

const CATEGORY_CONFIG: Record<LogCategory, { label: string; className: string }> = {
  security: { label: "安全合规", className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300" },
  content:  { label: "内容操作", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300" },
  usage:    { label: "功能使用", className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300" },
}

interface LogTableProps {
  data: AuditLog[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  onRowClick?: (log: AuditLog) => void
}

export function LogTable({ data, total, page, limit, onPageChange, isLoading, onRowClick }: LogTableProps) {
  const columns: Column<AuditLog>[] = [
    {
      key: "time",
      header: "时间",
      width: "152px",
      cell: (row) => <span className="text-sm text-muted-foreground tabular-nums">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "user",
      header: "用户",
      width: "160px",
      cell: (row) => (
        <div>
          <div className="text-sm font-medium leading-tight">{row.userDisplayName}</div>
          <div className="text-xs text-muted-foreground">{row.userEmail}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "分类",
      width: "80px",
      cell: (row) => {
        const cfg = CATEGORY_CONFIG[row.category]
        return <Badge variant="outline" className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
      },
    },
    {
      key: "action",
      header: "操作",
      width: "140px",
      cell: (row) => (
        <span className="text-sm">{ACTION_LABELS[row.action] ?? row.action}</span>
      ),
    },
    {
      key: "resource",
      header: "操作对象",
      cell: (row) => row.resourceTitle
        ? <span className="text-sm text-muted-foreground truncate max-w-[160px] block" title={row.resourceTitle}>{row.resourceTitle}</span>
        : <span className="text-muted-foreground/40 text-sm">—</span>,
    },
    {
      key: "result",
      header: "结果",
      width: "64px",
      cell: (row) => row.result === "success"
        ? <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">成功</Badge>
        : <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">失败</Badge>,
    },
    {
      key: "source",
      header: "来源",
      width: "72px",
      cell: (row) => {
        const labels: Record<string, string> = { desktop: "桌面端", web: "网页端", plugin: "插件端", admin: "管理后台", api: "API" }
        return <span className="text-xs text-muted-foreground">{labels[row.source] ?? row.source}</span>
      },
    },
    {
      key: "ip",
      header: "IP",
      width: "120px",
      cell: (row) => <span className="text-sm text-muted-foreground font-mono">{row.ip}</span>,
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      total={total}
      page={page}
      limit={limit}
      onPageChange={onPageChange}
      isLoading={isLoading}
      onRowClick={onRowClick}
      keyExtractor={(row) => row.id}
    />
  )
}
