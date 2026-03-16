import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Platform } from "@/types/model"

interface PlatformDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: Platform
  nextNumericId: number
  onSave: (data: Omit<Platform, "id" | "modelCount" | "clientModelCount">) => void
}

export function PlatformDialog({ open, onOpenChange, initial, nextNumericId, onSave }: PlatformDialogProps) {
  const [form, setForm] = useState(() => initial
    ? {
        numericId: initial.numericId,
        name: initial.name,
        displayName: initial.displayName,
        baseUrl: initial.baseUrl,
        chatApiPath: initial.chatApiPath,
        isEnabled: initial.isEnabled,
        defaultModelId: initial.defaultModelId ?? "",
      }
    : {
        numericId: nextNumericId,
        name: "",
        displayName: "",
        baseUrl: "https://api.openai.com",
        chatApiPath: "/v1/chat/completions",
        isEnabled: true,
        defaultModelId: "",
      }
  )

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.baseUrl.trim()) return
    onSave({
      ...form,
      defaultModelId: form.defaultModelId.trim() || null,
    })
    onOpenChange(false)
  }

  const isEdit = !!initial

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑平台" : "新增平台"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Row label="平台 ID">
            <Input
              type="number"
              value={form.numericId}
              onChange={(e) => set("numericId", +e.target.value)}
              disabled={isEdit}
              className={isEdit ? "bg-muted" : ""}
            />
          </Row>

          <Row label={<Required>平台名称</Required>}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="如 OpenAiProtocolPlatform"
            />
          </Row>

          <Row label={<Required>客户端显示名称</Required>}>
            <Input
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="如 兼容 OpenAI 协议平台"
            />
          </Row>

          <Row label={<Required>接口基础地址</Required>}>
            <Input
              value={form.baseUrl}
              onChange={(e) => set("baseUrl", e.target.value)}
              placeholder="https://api.openai.com"
            />
          </Row>

          <Row label={<Required>对话 API 路径</Required>}>
            <Input
              value={form.chatApiPath}
              onChange={(e) => set("chatApiPath", e.target.value)}
              placeholder="/v1/chat/completions"
            />
          </Row>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-center gap-3">
      <Label className="text-right text-sm">{label}</Label>
      {children}
    </div>
  )
}

function Required({ children }: { children: React.ReactNode }) {
  return <><span className="text-destructive mr-0.5">*</span>{children}</>
}
