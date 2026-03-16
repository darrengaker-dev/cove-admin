import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PlatformModel, PlatformAccount } from "@/types/model"

interface ModelDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  platformNumericId: number
  accounts: PlatformAccount[]
  initial?: PlatformModel
  onSave: (data: Omit<PlatformModel, "id" | "platformId">) => void
}

type FormState = Omit<PlatformModel, "id" | "platformId"> & { baseUrl: string }

function defaultForm(initial?: PlatformModel): FormState {
  return initial
    ? { ...initial, baseUrl: initial.baseUrl ?? "" }
    : {
        accountId: "",
        clientName: "",
        platformName: "",
        baseUrl: "",
        maxInputTokens: 32768,
        maxOutputTokens: 4096,
        isClientVisible: true,
        supportsVision: false,
        supportsTools: false,
        supportsReasoning: false,
        supportsEmbedding: false,
      }
}

export function ModelDialog({ open, onOpenChange, platformNumericId, accounts, initial, onSave }: ModelDialogProps) {
  const [form, setForm] = useState<FormState>(() => defaultForm(initial))

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function handleSave() {
    if (!form.clientName.trim() || !form.platformName.trim()) return
    const { baseUrl, ...rest } = form
    onSave({ ...rest, baseUrl: baseUrl.trim() || undefined })
    onOpenChange(false)
  }

  const capabilities: { key: keyof FormState; label: string }[] = [
    { key: "supportsVision", label: "视觉" },
    { key: "supportsTools", label: "工具调用" },
    { key: "supportsReasoning", label: "推理" },
    { key: "supportsEmbedding", label: "嵌入" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "编辑模型" : "新增模型"}</DialogTitle>
          <p className="text-sm text-muted-foreground">平台 ID：{platformNumericId}</p>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* API 账号 */}
          <Field label="API 账号" required>
            <Select value={form.accountId} onValueChange={(v) => set("accountId", v)}>
              <SelectTrigger><SelectValue placeholder="请选择账号" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          {/* 客户端模型名称 */}
          <Field label="客户端名称" required hint="客户端展示给用户的模型名称">
            <Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="如 GPT-4o" />
          </Field>

          {/* 平台模型名称 */}
          <Field label="平台模型名称" required hint="与 API 中 model 参数一致">
            <Input value={form.platformName} onChange={(e) => set("platformName", e.target.value)} placeholder="如 gpt-4o" />
          </Field>

          {/* 接口地址（可选覆盖） */}
          <Field label="接口地址" hint="留空则使用平台默认">
            <Input value={form.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} placeholder="https://..." />
          </Field>

          {/* Token 限制 */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="上下文长度" required>
              <Input type="number" value={form.maxInputTokens} onChange={(e) => set("maxInputTokens", +e.target.value)} />
            </Field>
            <Field label="最大输出 Tokens" required>
              <Input type="number" value={form.maxOutputTokens} onChange={(e) => set("maxOutputTokens", +e.target.value)} />
            </Field>
          </div>

          {/* 模型能力 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">模型能力</Label>
            <div className="grid grid-cols-2 gap-2">
              {capabilities.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={form[key] as boolean}
                    onCheckedChange={(v) => set(key, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 客户端可用 */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">客户端可用</p>
              <p className="text-xs text-muted-foreground">允许客户端用户选择此模型</p>
            </div>
            <Switch checked={form.isClientVisible} onCheckedChange={(v) => set("isClientVisible", v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
        {hint && <span className="text-muted-foreground font-normal ml-1.5 text-xs">{hint}</span>}
      </Label>
      {children}
    </div>
  )
}
