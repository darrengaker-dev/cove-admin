import { useState } from "react"
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePushUpdate as useTriggerUpdate } from "@/hooks/useVersions"
import { cn } from "@/lib/utils"
import type { UpdateStatus } from "@/types/version"

interface UpdateButtonProps {
  hasUpdate: boolean
}

export function UpdateButton({ hasUpdate }: UpdateButtonProps) {
  const [status, setStatus] = useState<UpdateStatus>("idle")
  const [progress, setProgress] = useState(0)
  const mutation = useTriggerUpdate()

  const handleUpdate = async () => {
    if (!hasUpdate) {
      setStatus("checking")
      setTimeout(() => setStatus("up-to-date"), 1500)
      return
    }

    setStatus("downloading")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90 }
        return p + Math.floor(Math.random() * 15 + 5)
      })
    }, 300)

    try {
      await mutation.mutateAsync()
      clearInterval(interval)
      setProgress(100)
      setStatus("done")
    } catch {
      clearInterval(interval)
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 text-success text-sm">
        <CheckCircle2 className="size-4" />
        升级完成，请重启应用以使用新版本
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <AlertCircle className="size-4" />
        升级失败，请稍后重试
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>重试</Button>
      </div>
    )
  }

  if (status === "downloading" || status === "installing") {
    return (
      <div className="space-y-2 w-56">
        <div className="text-sm text-muted-foreground">
          {status === "downloading" ? "正在下载..." : "正在安装..."} {progress}%
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    )
  }

  return (
    <Button
      onClick={handleUpdate}
      disabled={mutation.isPending || status === "checking"}
      variant={hasUpdate ? "default" : "outline"}
      size="sm"
      className={cn(hasUpdate && "bg-brand hover:bg-brand-hover")}
    >
      <RefreshCw className={cn("mr-2 size-4", (mutation.isPending || status === "checking") && "animate-spin")} />
      {status === "checking" ? "检查中..." : (hasUpdate ? "立即升级" : "检查更新")}
      {status === "up-to-date" && "（已是最新）"}
    </Button>
  )
}
