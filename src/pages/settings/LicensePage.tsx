import { useRef, useState } from "react"
import { Upload, Copy, Check, AlertTriangle, CheckCircle2, Clock, Server, Users, Layers, Key } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useLicense, useLicenseHistory, useActivateLicense } from "@/hooks/useEnterpriseSettings"
import { formatDate, formatDateShort } from "@/lib/format"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  active:    { label: "授权有效", className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300", icon: CheckCircle2 },
  expiring:  { label: "即将到期", className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300", icon: AlertTriangle },
  expired:   { label: "已过期",   className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300", icon: AlertTriangle },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="复制"
    >
      {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
    </button>
  )
}

export function LicensePage() {
  const { data: license, isLoading } = useLicense()
  const { data: history, isLoading: loadingHistory } = useLicenseHistory()
  const activateMutation = useActivateLicense()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    setFileName(file.name)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleActivate = () => {
    activateMutation.mutate(undefined, {
      onSuccess: () => setFileName(null),
    })
  }

  const status = license ? STATUS_CONFIG[license.status] : null
  const StatusIcon = status?.icon ?? CheckCircle2

  const daysUntilExpiry = license
    ? Math.ceil((new Date(license.expiresAt).getTime() - Date.now()) / 86400000)
    : 0

  return (
    <div>
      <PageHeader
        title="授权管理"
        description="查看当前授权信息，上传新的 License 文件完成授权激活"
      />

      <div className="p-6 space-y-5">
        {/* Status banner */}
        {license && license.status !== "active" && (
          <div className={cn(
            "rounded-xl border p-4 flex items-start gap-3",
            license.status === "expiring"
              ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
          )}>
            <AlertTriangle className={cn("size-4 shrink-0 mt-0.5", license.status === "expiring" ? "text-yellow-600" : "text-red-600")} />
            <div>
              <p className="text-sm font-medium">
                {license.status === "expiring" ? `授权将在 ${daysUntilExpiry} 天后到期` : "授权已过期，客户端功能受限"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">请联系销售获取新的 License 文件并上传激活</p>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Clock className="size-3.5" strokeWidth={1.5} />授权时间
            </div>
            {isLoading ? <Skeleton className="h-10 w-full" /> : (
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground">
                  {formatDateShort(license?.activatedAt ?? "")} — {formatDateShort(license?.expiresAt ?? "")}
                </div>
                {status && (
                  <Badge variant="outline" className={`text-xs mt-1 ${status.className}`}>
                    <StatusIcon className="size-3 mr-1" />{status.label}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <Server className="size-3.5" strokeWidth={1.5} />绑定服务器
            </div>
            {isLoading ? <Skeleton className="h-7 w-full" /> : (
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-medium">{license?.serverId}</span>
                <CopyButton text={license?.serverId ?? ""} />
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Users className="size-3.5" strokeWidth={1.5} />用户授权数
            </div>
            {isLoading ? <Skeleton className="h-10 w-full" /> : (
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tabular-nums">{license?.usedUsers}</span>
                  <span className="text-sm text-muted-foreground">/ {license?.maxUsers}</span>
                </div>
                <Progress
                  value={license ? Math.round((license.usedUsers / license.maxUsers) * 100) : 0}
                  className="h-1.5"
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Layers className="size-3.5" strokeWidth={1.5} />应用授权数
            </div>
            {isLoading ? <Skeleton className="h-10 w-full" /> : (
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tabular-nums">{license?.usedApps}</span>
                  <span className="text-sm text-muted-foreground">/ {license?.maxApps}</span>
                </div>
                <Progress
                  value={license ? Math.round((license.usedApps / license.maxApps) * 100) : 0}
                  className="h-1.5"
                />
              </div>
            )}
          </div>
        </div>

        {/* Upload license */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">上传 License 文件</CardTitle>
            <CardDescription className="text-xs">支持 .lic 格式，上传后自动解析授权信息并激活</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer",
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".lic"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              <Upload className="size-8 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />
              {fileName ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-muted-foreground">点击更换文件</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">拖拽文件到此处，或点击选择</p>
                  <p className="text-xs text-muted-foreground">仅支持 .lic 格式</p>
                </div>
              )}
            </div>

            {fileName && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleActivate}
                disabled={activateMutation.isPending}
              >
                <Key className="size-3.5" />
                {activateMutation.isPending ? "激活中..." : "立即激活"}
              </Button>
            )}

            {activateMutation.isSuccess && (
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="size-4" />授权激活成功
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activation history */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">激活历史</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">激活时间</TableHead>
                  <TableHead className="whitespace-nowrap">授权版本</TableHead>
                  <TableHead className="whitespace-nowrap">授权截止</TableHead>
                  <TableHead className="whitespace-nowrap">操作人</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory
                  ? Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                  : history?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(item.activatedAt)}</TableCell>
                      <TableCell className="text-sm">{item.plan}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateShort(item.expiresAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.operator}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Key className="size-3.5" strokeWidth={1.5} />
          当前授权版本：<span className="font-medium text-foreground">{license?.plan ?? "—"}</span>
          <span className="text-muted-foreground/50">·</span>
          License ID：<span className="font-mono">{license?.id ?? "—"}</span>
        </div>
      </div>
    </div>
  )
}
