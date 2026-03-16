import { useState, useCallback } from "react"
import { Download } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { LogFilter, type LogFilterValues } from "@/components/audit-logs/LogFilter"
import { LogTable } from "@/components/audit-logs/LogTable"
import { LogDetailSheet } from "@/components/audit-logs/LogDetailSheet"
import { Button } from "@/components/ui/button"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import type { AuditLog, LogCategory, LogResult, LogSource } from "@/types/audit-log"

const LIMIT = 20

export function AuditLogsPage() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [filter, setFilter] = useState({
    search: "",
    category: "all",
    result: "all",
    source: "all",
    startDate: "",
    endDate: "",
    userId: searchParams.get("userId") ?? "",
  })

  const { data, isLoading } = useAuditLogs({
    page,
    limit: LIMIT,
    userId: filter.userId || undefined,
    category: (filter.category !== "all" ? filter.category as LogCategory : undefined),
    result: (filter.result !== "all" ? filter.result as LogResult : undefined),
    source: (filter.source !== "all" ? filter.source as LogSource : undefined),
    startDate: filter.startDate || undefined,
    endDate: filter.endDate || undefined,
  })

  const handleFilter = useCallback((f: LogFilterValues) => {
    setFilter((prev) => ({ ...prev, ...f }))
    setPage(1)
  }, [])

  const handleExport = () => {
    // Mock: in production this would trigger a CSV download
    const rows = data?.data ?? []
    const csv = [
      "时间,用户,邮箱,分类,操作,操作对象,结果,来源,IP",
      ...rows.map((l) => [
        l.createdAt, l.userDisplayName, l.userEmail, l.category,
        l.action, l.resourceTitle ?? "", l.result, l.source, l.ip,
      ].join(",")),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="操作日志"
        description="记录所有用户的操作行为，支持合规审计与行为分析"
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} className="h-8 gap-1.5">
            <Download className="size-3.5" />
            导出 CSV
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <LogFilter onFilter={handleFilter} />
        <div className="rounded-lg border overflow-hidden">
          <LogTable
            data={data?.data ?? []}
            total={data?.total ?? 0}
            page={page}
            limit={LIMIT}
            onPageChange={setPage}
            isLoading={isLoading}
            onRowClick={setSelectedLog}
          />
        </div>
      </div>
      <LogDetailSheet log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
