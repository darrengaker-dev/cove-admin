import { useState, useRef } from "react"
import { Upload, Download, CheckCircle2, AlertCircle, AlertTriangle, FileSpreadsheet, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockImportPreview } from "@/mocks/data/registrations"
import { cn } from "@/lib/utils"

type Step = "upload" | "preview" | "done"

const STATUS_CONFIG = {
  ok:        { icon: CheckCircle2, label: "正常",  cls: "text-green-600" },
  duplicate: { icon: AlertTriangle, label: "重复", cls: "text-yellow-600" },
  error:     { icon: AlertCircle, label: "错误",   cls: "text-destructive" },
}

interface BatchImportDialogProps {
  open: boolean
  onClose: () => void
}

export function BatchImportDialog({ open, onClose }: BatchImportDialogProps) {
  const [step, setStep] = useState<Step>("upload")
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const preview = mockImportPreview
  const okCount = preview.filter((r) => r.status === "ok").length
  const dupCount = preview.filter((r) => r.status === "duplicate").length
  const errCount = preview.filter((r) => r.status === "error").length

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) return
    setFileName(file.name)
    setTimeout(() => setStep("preview"), 600)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = () => {
    setImporting(true)
    setTimeout(() => { setImporting(false); setStep("done") }, 1200)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => { setStep("upload"); setFileName(null) }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>批量导入成员</DialogTitle>

          {/* 步骤指示 */}
          <div className="flex items-center gap-2 pt-2">
            {(["upload", "preview", "done"] as Step[]).map((s, i) => {
              const labels = ["上传文件", "预览确认", "导入完成"]
              const active = s === step
              const done = (step === "preview" && i === 0) || step === "done"
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-colors",
                    active ? "bg-primary text-primary-foreground" :
                    done ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                    "text-muted-foreground"
                  )}>
                    <span className={cn("size-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                      active ? "bg-white/20" : done ? "bg-green-600 text-white" : "bg-muted"
                    )}>{done ? "✓" : i + 1}</span>
                    {labels[i]}
                  </div>
                  {i < 2 && <ArrowRight className="size-3 text-muted-foreground/50" />}
                </div>
              )
            })}
          </div>
        </DialogHeader>

        {/* Step 1: 上传 */}
        {step === "upload" && (
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <FileSpreadsheet className="size-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">拖拽文件到此处，或点击选择</p>
              <p className="text-xs text-muted-foreground mt-1">支持 .xlsx、.xls、.csv 格式</p>
              {fileName && (
                <Badge variant="secondary" className="mt-3 text-xs gap-1">
                  <FileSpreadsheet className="size-3" />{fileName}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
              <Download className="size-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground flex-1">
                请按照标准模板格式填写，确保字段完整
              </span>
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                <Download className="size-3" />下载模板
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: 预览 */}
        {step === "preview" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded-full">
                <CheckCircle2 className="size-3" />{okCount} 条正常
              </div>
              {dupCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-950/50 px-2 py-1 rounded-full">
                  <AlertTriangle className="size-3" />{dupCount} 条重复（将跳过）
                </div>
              )}
              {errCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/5 px-2 py-1 rounded-full">
                  <AlertCircle className="size-3" />{errCount} 条错误（将跳过）
                </div>
              )}
            </div>

            <div className="rounded-xl border overflow-hidden max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 sticky top-0 bg-background">行号</TableHead>
                    <TableHead className="sticky top-0 bg-background">姓名</TableHead>
                    <TableHead className="sticky top-0 bg-background">账户ID</TableHead>
                    <TableHead className="sticky top-0 bg-background">部门</TableHead>
                    <TableHead className="sticky top-0 bg-background">职称</TableHead>
                    <TableHead className="w-24 sticky top-0 bg-background">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row) => {
                    const cfg = STATUS_CONFIG[row.status]
                    return (
                      <TableRow key={row.rowNo} className={row.status !== "ok" ? "opacity-60" : ""}>
                        <TableCell className="text-xs text-muted-foreground">{row.rowNo}</TableCell>
                        <TableCell className="text-sm">{row.name}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{row.loginName || <span className="text-destructive">空</span>}</TableCell>
                        <TableCell className="text-xs">{row.deptName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.jobTitle ?? "—"}</TableCell>
                        <TableCell>
                          <div className={cn("flex items-center gap-1 text-xs", cfg.cls)}>
                            <cfg.icon className="size-3 shrink-0" />
                            <span>{row.errorMsg ?? cfg.label}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Step 3: 完成 */}
        {step === "done" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="size-14 mx-auto text-green-500" />
            <div>
              <p className="text-base font-semibold">导入完成</p>
              <p className="text-sm text-muted-foreground mt-1">
                成功导入 <span className="font-medium text-foreground">{okCount}</span> 名成员
                {(dupCount + errCount) > 0 && `，跳过 ${dupCount + errCount} 条异常数据`}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" size="sm" onClick={handleClose}>取消</Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep("upload")}>返回重传</Button>
              <Button size="sm" onClick={handleImport} disabled={importing} className="gap-1.5">
                {importing ? "导入中..." : <><Upload className="size-3.5" />确认导入 {okCount} 条</>}
              </Button>
            </>
          )}
          {step === "done" && (
            <Button size="sm" onClick={handleClose}>完成</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
