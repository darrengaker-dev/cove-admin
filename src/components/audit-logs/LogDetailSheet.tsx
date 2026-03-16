import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import { ACTION_LABELS } from "./LogTable"
import type { AuditLog, LogCategory, LogRisk } from "@/types/audit-log"

const CATEGORY_LABELS: Record<LogCategory, string> = {
  security: "安全合规", content: "内容操作", usage: "功能使用",
}

const RISK_CONFIG: Record<LogRisk, { label: string; className: string }> = {
  critical: { label: "高危",  className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300" },
  warning:  { label: "中等",  className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300" },
  info:     { label: "普通",  className: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400" },
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  )
}

interface LogDetailSheetProps {
  log: AuditLog | null
  onClose: () => void
}

export function LogDetailSheet({ log, onClose }: LogDetailSheetProps) {
  return (
    <Sheet open={!!log} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>日志详情</SheetTitle>
          <SheetDescription>操作记录的完整信息</SheetDescription>
        </SheetHeader>
        {log && (
          <div className="mt-4 space-y-5 px-6 pb-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="用户">
                <div className="font-medium">{log.userDisplayName}</div>
                <div className="text-xs text-muted-foreground">{log.userEmail}</div>
              </Field>
              <Field label="操作时间">{formatDate(log.createdAt)}</Field>
              <Field label="操作类型">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.action}</code>
                <span className="ml-1.5 text-muted-foreground text-xs">{ACTION_LABELS[log.action]}</span>
              </Field>
              <Field label="日志分类">{CATEGORY_LABELS[log.category]}</Field>
              <Field label="风险等级">
                <Badge variant="outline" className={`text-xs ${RISK_CONFIG[log.riskLevel].className}`}>
                  {RISK_CONFIG[log.riskLevel].label}
                </Badge>
              </Field>
              <Field label="操作结果">
                {log.result === "success"
                  ? <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">成功</Badge>
                  : <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">失败</Badge>
                }
              </Field>
              {log.resourceTitle && (
                <Field label="操作对象">
                  <span className="break-all">{log.resourceTitle}</span>
                  {log.resourceType && <span className="ml-1 text-xs text-muted-foreground">({log.resourceType})</span>}
                </Field>
              )}
              <Field label="来源">{{ desktop: "桌面端", web: "网页端", plugin: "插件端", admin: "管理后台", api: "API" }[log.source] ?? log.source}</Field>
              <Field label="IP 地址">{log.ip}</Field>
              {log.requestId && (
                <Field label="请求 ID">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded break-all">{log.requestId}</code>
                </Field>
              )}
              {log.clientVersion && <Field label="客户端版本">{log.clientVersion}</Field>}
            </div>

            {/* 失败原因 */}
            {log.result === "fail" && log.errorMessage && (
              <div>
                <div className="text-muted-foreground text-xs mb-1.5">失败原因</div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  {log.errorMessage}
                </div>
              </div>
            )}

            {/* 操作详情 */}
            {Object.keys(log.detail).length > 0 && (
              <div>
                <div className="text-muted-foreground text-xs mb-1.5">操作详情</div>
                <pre className="rounded-lg bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(log.detail, null, 2)}
                </pre>
              </div>
            )}

            {/* User Agent */}
            <div>
              <div className="text-muted-foreground text-xs mb-1">User Agent</div>
              <div className="text-xs text-muted-foreground break-all">{log.userAgent}</div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
