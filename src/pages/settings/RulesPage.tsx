import { useState, useEffect } from "react"
import { CheckCircle2, RotateCcw } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useSystemRules, useSaveSystemRules } from "@/hooks/useEnterpriseSettings"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OutputStyle } from "@/types/enterprise-settings"

const OUTPUT_STYLES: { value: OutputStyle; label: string; desc: string }[] = [
  { value: "formal",       label: "正式",   desc: "严谨、规范、措辞得体，适合政府/大型企业" },
  { value: "professional", label: "专业",   desc: "清晰、精准、以结果为导向，适合商业场景" },
  { value: "concise",      label: "简洁",   desc: "直接给出结论，减少冗余说明，适合高效工作流" },
  { value: "custom",       label: "自定义", desc: "完全按照下方系统提示词中的风格要求输出" },
]

const DEFAULT_PROMPT = "你是一个专业、严谨的企业级 AI 助手。请用正式、简洁的语言回答用户问题，避免使用口语化表达。涉及敏感信息时，须提示用户注意信息安全合规要求。"

const MAX_CHARS = 4000

export function RulesPage() {
  const { data, isLoading } = useSystemRules()
  const saveMutation = useSaveSystemRules()
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState<OutputStyle>("professional")
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (data && !dirty) {
      setPrompt(data.systemPrompt)
      setStyle(data.outputStyle)
    }
  }, [data, dirty])

  const handleSave = () => {
    saveMutation.mutate({ systemPrompt: prompt, outputStyle: style }, {
      onSuccess: () => {
        setSaved(true)
        setDirty(false)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT)
    setStyle("professional")
    setDirty(true)
    setSaved(false)
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="规则设置" description="配置全局系统提示词，定制 AI 助手的输出风格与合规规则" />
        <div className="p-6 space-y-5">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="规则设置"
        description="配置全局系统提示词，定制 AI 助手的输出风格与合规规则，对所有用户的对话生效"
      />

      <div className="p-6 space-y-5">
        {/* Output style */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">输出风格</CardTitle>
            <CardDescription className="text-xs">快捷预设，选择后自动生成对应的基础提示词风格要求</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {OUTPUT_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setStyle(s.value); setDirty(true); setSaved(false) }}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    style === s.value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn("text-sm font-medium mb-1", style === s.value && "text-primary")}>
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{s.desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System prompt */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-sm font-medium">全局系统提示词</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  对所有用户的每次对话生效，注入在 system 消息最前。过长会消耗更多 context，建议控制在 1000 字以内。
                </CardDescription>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-4"
              >
                <RotateCcw className="size-3" />恢复默认
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); setDirty(true); setSaved(false) }}
                rows={10}
                maxLength={MAX_CHARS}
                className="w-full resize-none rounded-lg border bg-muted/30 px-3 py-2.5 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30 transition-shadow font-mono"
                placeholder="输入系统提示词..."
              />
              <div className={cn(
                "absolute bottom-2 right-3 text-xs tabular-nums",
                prompt.length > MAX_CHARS * 0.9 ? "text-yellow-600" : "text-muted-foreground"
              )}>
                {prompt.length} / {MAX_CHARS}
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 px-3 py-2.5 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">写作建议</p>
              <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                <li>明确身份定位："你是 XX 公司的企业 AI 助手"</li>
                <li>设定语言和格式要求：使用正式中文、避免使用 Emoji</li>
                <li>列出禁止事项：不允许讨论竞品、不允许透露内部信息</li>
                <li>添加合规说明：如涉及敏感数据需提示用户注意安全</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {data?.updatedAt && (
              <>上次保存：{formatDate(data.updatedAt)} · {data.updatedBy}</>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="size-4" />已保存
              </span>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending || !dirty}
            >
              {saveMutation.isPending ? "保存中..." : "保存规则"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
