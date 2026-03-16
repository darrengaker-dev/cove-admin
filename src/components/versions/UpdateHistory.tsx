import { useState, Fragment } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { useVersionHistory } from "@/hooks/useVersions"

const STATUS_CONFIG = {
  success: { label: "成功",    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300" },
  failed:  { label: "失败",    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300" },
  partial: { label: "部分成功", className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300" },
}

export function UpdateHistory() {
  const { data, isLoading } = useVersionHistory()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">升级历史</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">时间</TableHead>
            <TableHead className="whitespace-nowrap">从版本</TableHead>
            <TableHead className="whitespace-nowrap">升级到</TableHead>
            <TableHead className="whitespace-nowrap text-right">影响终端</TableHead>
            <TableHead className="whitespace-nowrap">状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            : data?.map((record) => {
                const s = STATUS_CONFIG[record.status]
                const isExpanded = expanded.has(record.id)
                const hasNotes = !!record.releaseNotes

                return (
                  <Fragment key={record.id}>
                    <TableRow className={cn(hasNotes && "border-b-0")}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(record.updatedAt)}</TableCell>
                      <TableCell className="font-mono text-sm">v{record.fromVersion}</TableCell>
                      <TableCell className="font-mono text-sm">v{record.toVersion}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{record.clientCount} 台</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <Badge variant="outline" className={`text-xs ${s.className}`}>{s.label}</Badge>
                          {record.errorMessage && (
                            <div className="text-xs text-muted-foreground">{record.errorMessage}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {hasNotes && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="pt-0 pb-3">
                          <p className={cn(
                            "text-xs text-muted-foreground leading-relaxed",
                            !isExpanded && "line-clamp-2"
                          )}>
                            {record.releaseNotes}
                          </p>
                          <button
                            onClick={() => toggle(record.id)}
                            className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-600 mt-1 transition-colors"
                          >
                            {isExpanded
                              ? <><ChevronUp className="size-3" />收起</>
                              : <><ChevronDown className="size-3" />查看更多</>
                            }
                          </button>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })}
        </TableBody>
      </Table>
    </div>
  )
}
