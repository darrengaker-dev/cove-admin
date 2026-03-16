import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, Wrench, Brain, Package } from "lucide-react"
import { ModelDialog } from "./ModelDialog"
import { AccountDialog } from "./AccountDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import {
  usePlatformAccounts, usePlatformModels,
  useCreateModel, useUpdateModel, useDeleteModel,
  useCreateAccount, useDeleteAccount,
} from "@/hooks/useModels"
import type { Platform, PlatformModel } from "@/types/model"

interface Props {
  platform: Platform
}

export function PlatformExpandedRow({ platform }: Props) {
  const { data: accounts = [] } = usePlatformAccounts(platform.id)
  const { data: models = [] } = usePlatformModels(platform.id)

  const createModel = useCreateModel(platform.id)
  const updateModel = useUpdateModel(platform.id)
  const deleteModel = useDeleteModel(platform.id)
  const createAccount = useCreateAccount(platform.id)
  const deleteAccount = useDeleteAccount(platform.id)

  const [modelDialog, setModelDialog] = useState<{ open: boolean; initial?: PlatformModel }>({ open: false })
  const [accountDialog, setAccountDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: "model" | "account"; id: string; name: string } | null>(null)

  function handleSaveModel(data: Omit<PlatformModel, "id" | "platformId">) {
    if (modelDialog.initial) {
      updateModel.mutate({ id: modelDialog.initial.id, ...data })
    } else {
      createModel.mutate(data)
    }
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    if (deleteTarget.type === "model") deleteModel.mutate(deleteTarget.id)
    else deleteAccount.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="bg-muted/30 border-t px-6 py-4 space-y-5">
      {/* 账号 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API 账号</h4>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAccountDialog(true)}>
            <Plus className="h-3 w-3" />新增账号
          </Button>
        </div>
        {accounts.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">暂无账号</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs">
                  <Th>账号名</Th><Th>API ID</Th><Th>API Key</Th><Th>API Secret</Th><Th>操作</Th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-muted/20">
                    <Td>{a.name}</Td>
                    <Td className="text-muted-foreground">{a.apiId || "—"}</Td>
                    <Td className="font-mono text-xs text-muted-foreground">{maskKey(a.apiKey)}</Td>
                    <Td className="text-muted-foreground">{a.apiSecret ? maskKey(a.apiSecret) : "—"}</Td>
                    <Td>
                      <Button
                        size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget({ type: "account", id: a.id, name: a.name })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 模型 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">模型列表</h4>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
            onClick={() => setModelDialog({ open: true })}>
            <Plus className="h-3 w-3" />新增模型
          </Button>
        </div>
        {models.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">暂无模型</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs">
                  <Th>客户端名称</Th><Th>平台模型名称</Th><Th>上下文</Th><Th>最大输出</Th><Th>能力</Th><Th>客户端可用</Th><Th>操作</Th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-muted/20">
                    <Td className="font-medium">{m.clientName}</Td>
                    <Td className="font-mono text-xs text-muted-foreground">{m.platformName}</Td>
                    <Td className="text-muted-foreground">{formatTokens(m.maxInputTokens)}</Td>
                    <Td className="text-muted-foreground">{formatTokens(m.maxOutputTokens)}</Td>
                    <Td><CapabilityIcons model={m} /></Td>
                    <Td>
                      <Badge variant={m.isClientVisible ? "default" : "secondary"} className="text-xs">
                        {m.isClientVisible ? "是" : "否"}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6"
                          onClick={() => setModelDialog({ open: true, initial: m })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget({ type: "model", id: m.id, name: m.clientName })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* dialogs */}
      <ModelDialog
        open={modelDialog.open}
        onOpenChange={(v) => setModelDialog({ open: v })}
        platformNumericId={platform.numericId}
        accounts={accounts}
        initial={modelDialog.initial}
        onSave={handleSaveModel}
      />
      <AccountDialog
        open={accountDialog}
        onOpenChange={setAccountDialog}
        onSave={(data) => createAccount.mutate(data)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title={`删除${deleteTarget?.type === "model" ? "模型" : "账号"}`}
        description={`确定删除「${deleteTarget?.name}」？此操作不可恢复。`}
        confirmVariant="destructive"
        confirmLabel="删除"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium">{children}</th>
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className ?? ""}`}>{children}</td>
}

function CapabilityIcons({ model }: { model: PlatformModel }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {model.supportsVision && <Eye className="h-3.5 w-3.5" aria-label="视觉" />}
      {model.supportsTools && <Wrench className="h-3.5 w-3.5" aria-label="工具调用" />}
      {model.supportsReasoning && <Brain className="h-3.5 w-3.5" aria-label="推理" />}
      {model.supportsEmbedding && <Package className="h-3.5 w-3.5" aria-label="嵌入" />}
      {!model.supportsVision && !model.supportsTools && !model.supportsReasoning && !model.supportsEmbedding && (
        <span className="text-xs">—</span>
      )}
    </div>
  )
}

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••"
  return key.slice(0, 4) + "••••••••" + key.slice(-4)
}

function formatTokens(n: number): string {
  if (n === 0) return "—"
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
