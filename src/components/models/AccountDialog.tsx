import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import type { PlatformAccount } from "@/types/model"

interface AccountDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: PlatformAccount
  onSave: (data: Omit<PlatformAccount, "id" | "platformId">) => void
}

export function AccountDialog({ open, onOpenChange, initial, onSave }: AccountDialogProps) {
  const [form, setForm] = useState(() => initial
    ? { name: initial.name, apiId: initial.apiId ?? "", apiKey: initial.apiKey, apiSecret: initial.apiSecret ?? "" }
    : { name: "", apiId: "", apiKey: "", apiSecret: "" }
  )
  const [showKey, setShowKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function handleSave() {
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      apiId: form.apiId.trim() || undefined,
      apiKey: form.apiKey.trim(),
      apiSecret: form.apiSecret.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "编辑账号" : "新增账号"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm"><span className="text-destructive mr-0.5">*</span>账号名称</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="如 account_1"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">API ID</Label>
            <Input
              value={form.apiId}
              onChange={(e) => set("apiId", e.target.value)}
              placeholder="可选"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm"><span className="text-destructive mr-0.5">*</span>API Key</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={form.apiKey}
                onChange={(e) => set("apiKey", e.target.value)}
                placeholder="请输入 API Key"
                className="pr-9"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">API Secret</Label>
            <div className="relative">
              <Input
                type={showSecret ? "text" : "password"}
                value={form.apiSecret}
                onChange={(e) => set("apiSecret", e.target.value)}
                placeholder="可选"
                className="pr-9"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSecret((v) => !v)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
