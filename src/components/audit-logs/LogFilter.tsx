import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export interface LogFilterValues {
  search: string
  category: string
  result: string
  source: string
  startDate: string
  endDate: string
}

interface LogFilterProps {
  onFilter: (filter: LogFilterValues) => void
}

export function LogFilter({ onFilter }: LogFilterProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [result, setResult] = useState("all")
  const [source, setSource] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    onFilter({ search, category, result, source, startDate, endDate })
  }, [search, category, result, source, startDate, endDate, onFilter])

  const handleReset = () => {
    setSearch("")
    setCategory("all")
    setResult("all")
    setSource("all")
    setStartDate("")
    setEndDate("")
  }

  const hasFilter = search || category !== "all" || result !== "all" || source !== "all" || startDate || endDate

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="搜索姓名、账号..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 w-48"
        />
      </div>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue placeholder="日志分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部分类</SelectItem>
          <SelectItem value="security">安全合规</SelectItem>
          <SelectItem value="content">内容操作</SelectItem>
          <SelectItem value="usage">功能使用</SelectItem>
        </SelectContent>
      </Select>

      <Select value={result} onValueChange={setResult}>
        <SelectTrigger className="h-8 w-28">
          <SelectValue placeholder="操作结果" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部结果</SelectItem>
          <SelectItem value="success">成功</SelectItem>
          <SelectItem value="fail">失败</SelectItem>
        </SelectContent>
      </Select>

      <Select value={source} onValueChange={setSource}>
        <SelectTrigger className="h-8 w-28">
          <SelectValue placeholder="来源" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部来源</SelectItem>
          <SelectItem value="desktop">桌面端</SelectItem>
          <SelectItem value="web">网页端</SelectItem>
          <SelectItem value="plugin">插件端</SelectItem>
          <SelectItem value="admin">管理后台</SelectItem>
          <SelectItem value="api">API</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="h-8 w-36"
      />
      <span className="text-muted-foreground text-sm">至</span>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="h-8 w-36"
      />

      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1">
          <X className="size-3" />
          重置
        </Button>
      )}
    </div>
  )
}
