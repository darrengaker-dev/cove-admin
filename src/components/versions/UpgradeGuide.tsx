import { useState } from "react"
import { Copy, Check, CheckCircle2, Terminal, MonitorCheck, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { usePushUpdate } from "@/hooks/useVersions"
import type { AppVersion, ClientStats } from "@/types/version"

const UPGRADE_CMD = "bash <(curl -fsSL https://update.cove.app/upgrade)"

interface UpgradeGuideProps {
  current?: AppVersion
  latest?: AppVersion
  clients?: ClientStats
}

interface StepItemProps {
  num: number
  icon: React.ElementType
  title: string
  description: string
  isLast?: boolean
  children?: React.ReactNode
}

function StepItem({ num, icon: Icon, title, description, isLast, children }: StepItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {num}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1.5" style={{ minHeight: 20 }} />}
      </div>
      <div className={cn("flex-1 min-w-0", isLast ? "pb-0" : "pb-5")}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        {children && <div className="mt-2.5">{children}</div>}
      </div>
    </div>
  )
}

export function UpgradeGuide({ current, latest, clients }: UpgradeGuideProps) {
  const [copied, setCopied] = useState(false)
  const [pushDone, setPushDone] = useState(false)
  const pushMutation = usePushUpdate()

  const hasUpdate = !!(current && latest && current.version !== latest.version)

  const handleCopy = () => {
    navigator.clipboard.writeText(UPGRADE_CMD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePush = () => {
    pushMutation.mutate(undefined, {
      onSuccess: () => {
        setPushDone(true)
        setTimeout(() => setPushDone(false), 4000)
      },
    })
  }

  return (
    <div>
      <StepItem
        num={1}
        icon={Terminal}
        title="部署服务端新版本"
        description="SSH 登录服务器，执行以下升级命令，服务端将自动完成版本切换，无需手动操作文件或配置，全程约 2-5 分钟。"
      >
        <div className="flex items-center gap-2 rounded-lg bg-muted/70 px-3 py-2">
          <span className="text-muted-foreground font-mono text-xs select-none">$</span>
          <code className="flex-1 font-mono text-xs text-foreground">{UPGRADE_CMD}</code>
          <button
            onClick={handleCopy}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="复制命令"
          >
            {copied
              ? <Check className="size-3.5 text-success" />
              : <Copy className="size-3.5" />
            }
          </button>
        </div>
      </StepItem>

      <StepItem
        num={2}
        icon={MonitorCheck}
        title="确认服务端部署结果"
        description="刷新本页，查看左上角「当前服务版本」是否已更新为最新版本号。若未变化，请检查服务器日志后重试。"
      >
        {current && latest && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1">
              <span className="text-xs text-muted-foreground">当前</span>
              <span className="text-xs font-mono font-medium">v{current.version}</span>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
            <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1">
              <span className="text-xs text-muted-foreground">最新</span>
              <span className="text-xs font-mono font-medium">v{latest.version}</span>
            </div>
            {hasUpdate ? (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300 dark:text-yellow-400 dark:border-yellow-700">
                待升级
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-success border-success/30">
                <CheckCircle2 className="size-3 mr-1" />已同步
              </Badge>
            )}
          </div>
        )}
      </StepItem>

      <StepItem
        num={3}
        icon={Send}
        title="推送客户端升级"
        description="服务端就绪后，点击按钮向全部在线终端下发升级通知，同时更新新用户的安装包下载地址为最新版本。"
      >
        <div className="space-y-1.5">
          {pushDone ? (
            <div className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" />
              已成功推送至 {clients?.pendingClients} 台终端
            </div>
          ) : (
            <Button
              size="sm"
              className="h-8 gap-1.5"
              onClick={handlePush}
              disabled={pushMutation.isPending}
            >
              <Send className="size-3.5" />
              {pushMutation.isPending ? "推送中..." : "立即推送至客户端用户"}
            </Button>
          )}
          {hasUpdate && !pushDone && (
            <p className="text-xs text-muted-foreground">
              服务端尚未升级至最新版本，建议先完成步骤 1-2 再推送
            </p>
          )}
        </div>
      </StepItem>

      <StepItem
        num={4}
        icon={Users}
        title="用户完成升级"
        description="已安装客户端的用户将在 5-10 分钟内收到升级提示，点击「立即升级」完成安装；已开启自动更新的终端将在计划时间窗口内静默完成，无需任何操作。新用户使用管理员分发的最新安装包直接安装即可。"
        isLast
      />
    </div>
  )
}
