import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSavePolicy } from "@/hooks/useVersions"
import type { UpdatePolicy } from "@/types/version"

interface UpdatePolicyFormProps {
  defaultValues: UpdatePolicy
}

export function UpdatePolicyForm({ defaultValues }: UpdatePolicyFormProps) {
  const [values, setValues] = useState<UpdatePolicy>(defaultValues)
  const [saved, setSaved] = useState(false)
  const mutation = useSavePolicy()

  const set = <K extends keyof UpdatePolicy>(key: K, value: UpdatePolicy[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    mutation.mutate(values, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  return (
    <div className="space-y-0">
      {/* 自动更新 */}
      <div className="flex items-center justify-between py-3.5">
        <div>
          <div className="text-sm font-medium">自动更新</div>
          <div className="text-xs text-muted-foreground mt-0.5">客户端在后台自动下载并安装新版本，无需管理员逐台操作</div>
        </div>
        <Switch checked={values.autoUpdate} onCheckedChange={(v) => set("autoUpdate", v)} />
      </div>
      <Separator />

      {/* 更新渠道 */}
      <div className="flex items-center justify-between py-3.5">
        <div>
          <div className="text-sm font-medium">更新渠道</div>
          <div className="text-xs text-muted-foreground mt-0.5">稳定版适合生产环境，测试版包含最新特性但可能不稳定</div>
        </div>
        <Select value={values.channel} onValueChange={(v) => set("channel", v as UpdatePolicy["channel"])}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stable">稳定版</SelectItem>
            <SelectItem value="beta">测试版</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />

      {/* 强制最低版本 */}
      <div className="flex items-center justify-between py-3.5">
        <div>
          <div className="text-sm font-medium">强制最低版本</div>
          <div className="text-xs text-muted-foreground mt-0.5">低于此版本的客户端将强制弹窗提示升级，不可跳过或推迟</div>
        </div>
        <Input
          value={values.forceMinVersion}
          onChange={(e) => set("forceMinVersion", e.target.value)}
          className="w-28 h-8 text-sm font-mono text-right"
          placeholder="1.0.0"
        />
      </div>
      <Separator />

      {/* 安装方式 */}
      <div className="flex items-center justify-between py-3.5">
        <div>
          <div className="text-sm font-medium">安装方式</div>
          <div className="text-xs text-muted-foreground mt-0.5">控制新版本在终端上的安装时机，建议使用静默安装</div>
        </div>
        <Select value={values.installMode} onValueChange={(v) => set("installMode", v as UpdatePolicy["installMode"])}>
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="silent_restart">静默下载，重启后生效</SelectItem>
            <SelectItem value="next_launch">下次启动时安装</SelectItem>
            <SelectItem value="immediate">立即静默安装</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />

      {/* 计划更新窗口 */}
      <div className="flex items-start justify-between py-3.5">
        <div>
          <div className="text-sm font-medium">计划更新窗口</div>
          <div className="text-xs text-muted-foreground mt-0.5">仅在指定时间段内推送更新，降低对用户工作的干扰</div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={values.scheduledEnabled} onCheckedChange={(v) => set("scheduledEnabled", v)} />
          {values.scheduledEnabled && (
            <>
              <Input
                type="time"
                value={values.scheduledStart}
                onChange={(e) => set("scheduledStart", e.target.value)}
                className="w-24 h-8 text-sm"
              />
              <span className="text-sm text-muted-foreground">至</span>
              <Input
                type="time"
                value={values.scheduledEnd}
                onChange={(e) => set("scheduledEnd", e.target.value)}
                className="w-24 h-8 text-sm"
              />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t">
        {saved && (
          <div className="flex items-center gap-1.5 text-success text-sm">
            <CheckCircle2 className="size-4" />
            策略已保存
          </div>
        )}
        <Button size="sm" onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? "保存中..." : "保存策略"}
        </Button>
      </div>
    </div>
  )
}
