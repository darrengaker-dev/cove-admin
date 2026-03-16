import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, Wrench, Brain, Package, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { ModelDialog } from "./ModelDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import {
  usePlatformAccounts, usePlatformModels,
  useCreateModel, useUpdateModel, useDeleteModel,
} from "@/hooks/useModels"
import type { PlatformModel } from "@/types/model"

type TestStatus = "idle" | "testing" | "success" | "failed"

interface ModelListCardProps {
  platformId: string
  providerName: string
}

export function ModelListCard({ platformId, providerName }: ModelListCardProps) {
  const { data: accounts = [] } = usePlatformAccounts(platformId)
  const { data: models = [] } = usePlatformModels(platformId)
  const createModel = useCreateModel(platformId)
  const updateModel = useUpdateModel(platformId)
  const deleteModel = useDeleteModel(platformId)

  const [dialog, setDialog] = useState<{ open: boolean; initial?: PlatformModel }>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<PlatformModel | null>(null)
  const [testStatus, setTestStatus] = useState<Record<string, TestStatus>>({})

  const platformNumericId = 0

  function handleSave(data: Omit<PlatformModel, "id" | "platformId">) {
    if (dialog.initial) {
      updateModel.mutate({ id: dialog.initial.id, ...data })
    } else {
      createModel.mutate(data)
    }
  }

  function handleTest(modelId: string) {
    setTestStatus((prev) => ({ ...prev, [modelId]: "testing" }))
    // Simulate async connectivity test
    setTimeout(() => {
      const ok = Math.random() > 0.2
      setTestStatus((prev) => ({ ...prev, [modelId]: ok ? "success" : "failed" }))
    }, 1200)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium">{providerName} 模型列表</CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
            onClick={() => setDialog({ open: true })}>
            <Plus className="h-3.5 w-3.5" />新增模型
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {models.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              暂无模型配置，点击「新增模型」添加
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-xs border-b">
                    <Th>客户端名称</Th>
                    <Th>平台模型名称</Th>
                    <Th>上下文</Th>
                    <Th>最大输出</Th>
                    <Th>能力</Th>
                    <Th>客户端可用</Th>
                    <Th>连接测试</Th>
                    <Th className="text-right">操作</Th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => {
                    const status = testStatus[m.id] ?? "idle"
                    return (
                      <tr key={m.id} className="border-t hover:bg-muted/30 transition-colors">
                        <Td className="font-medium">{m.clientName}</Td>
                        <Td className="font-mono text-xs text-muted-foreground">{m.platformName}</Td>
                        <Td className="text-muted-foreground">{fmtTokens(m.maxInputTokens)}</Td>
                        <Td className="text-muted-foreground">{fmtTokens(m.maxOutputTokens)}</Td>
                        <Td><Capabilities model={m} /></Td>
                        <Td>
                          <Badge variant={m.isClientVisible ? "default" : "secondary"} className="text-xs">
                            {m.isClientVisible ? "是" : "否"}
                          </Badge>
                        </Td>
                        <Td>
                          <TestCell status={status} onTest={() => handleTest(m.id)} />
                        </Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7"
                              onClick={() => setDialog({ open: true, initial: m })}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(m)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ModelDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog({ open: v })}
        platformNumericId={platformNumericId}
        accounts={accounts}
        initial={dialog.initial}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="删除模型"
        description={`确定删除模型「${deleteTarget?.clientName}」？此操作不可恢复。`}
        confirmVariant="destructive"
        confirmLabel="删除"
        onConfirm={() => {
          if (deleteTarget) deleteModel.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </>
  )
}

function TestCell({ status, onTest }: { status: TestStatus; onTest: () => void }) {
  if (status === "testing") {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>测试中</span>
      </div>
    )
  }
  if (status === "success") {
    return (
      <div className="flex items-center gap-1 text-xs text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>连接正常</span>
      </div>
    )
  }
  if (status === "failed") {
    return (
      <div className="flex items-center gap-1 text-xs text-destructive">
        <XCircle className="h-3.5 w-3.5" />
        <span>连接失败</span>
      </div>
    )
  }
  return (
    <Button size="sm" variant="outline" className="h-6 text-xs px-2"
      onClick={onTest}>
      测试
    </Button>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left font-medium ${className ?? ""}`}>{children}</th>
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className ?? ""}`}>{children}</td>
}

function Capabilities({ model }: { model: PlatformModel }) {
  const items = [
    { flag: model.supportsVision,    icon: <Eye className="h-3.5 w-3.5" />,     label: "视觉" },
    { flag: model.supportsTools,     icon: <Wrench className="h-3.5 w-3.5" />,  label: "工具" },
    { flag: model.supportsReasoning, icon: <Brain className="h-3.5 w-3.5" />,   label: "推理" },
    { flag: model.supportsEmbedding, icon: <Package className="h-3.5 w-3.5" />, label: "嵌入" },
  ]
  const active = items.filter((i) => i.flag)
  if (active.length === 0) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {active.map((i) => (
        <span key={i.label} title={i.label}>{i.icon}</span>
      ))}
    </div>
  )
}

function fmtTokens(n: number): string {
  if (n === 0) return "—"
  return n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)
}
