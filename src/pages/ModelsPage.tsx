import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { ModelConfigForm } from "@/components/models/ModelConfigForm"
import { UsageChart } from "@/components/models/UsageChart"
import { ModelListCard } from "@/components/models/ModelListCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProviderIcon } from "@/components/common/ProviderIcon"
import { cn } from "@/lib/utils"
import { useModelConfigs } from "@/hooks/useModels"

const PROVIDER_LABELS: Record<string, string> = {
  anthropic:        "Anthropic",
  aliyun:           "阿里云百炼",
  deepseek:         "DeepSeek",
  google:           "Google AI",
  minimax:          "MiniMax",
  moonshot:         "Moonshot",
  openai:           "OpenAI",
  openrouter:       "OpenRouter",
  "tencent-cloud":  "腾讯云混元",
  "volcengine-ark": "火山引擎 Ark",
  ollama:           "Ollama",
  vllm:             "vLLM",
  groq:             "Groq",
  mistral:          "Mistral",
  azure:            "Azure OpenAI",
  custom:           "自定义",
}

const PROVIDER_DESCRIPTIONS: Record<string, string> = {
  anthropic:        "Claude 系列模型，长上下文与强推理能力",
  aliyun:           "阿里云百炼（通义千问）OpenAI 兼容接口",
  deepseek:         "探索未至之境",
  google:           "Gemini 系列多模态模型",
  minimax:          "与所有人共创智能",
  moonshot:         "寻求将能源转化为智能的最优解",
  openai:           "GPT 与 o 系列模型",
  openrouter:       "多模型统一 API 网关",
  "tencent-cloud":  "腾讯云混元 OpenAI 兼容接口",
  "volcengine-ark": "火山方舟大模型服务平台 OpenAI 兼容接口",
  ollama:           "本地运行的开源模型",
  vllm:             "高性能大模型本地推理引擎",
  groq:             "Groq 高速推理 API",
  mistral:          "Mistral 大模型 API",
  azure:            "通过 Azure 使用的 OpenAI 模型",
  custom:           "自定义 OpenAI 兼容接口",
}

const PROVIDER_TO_PLATFORM: Record<string, string> = {
  anthropic:        "platform-anthropic",
  aliyun:           "platform-alibaba",
  deepseek:         "platform-deepseek",
  google:           "platform-google",
  minimax:          "platform-minimax",
  moonshot:         "platform-moonshot",
  openai:           "platform-openai",
  openrouter:       "platform-openrouter",
  "tencent-cloud":  "platform-tencent",
  "volcengine-ark": "platform-volcengine",
  ollama:           "platform-ollama",
  vllm:             "platform-vllm",
  groq:             "platform-groq",
  mistral:          "platform-mistral",
  azure:            "platform-azure",
  custom:           "platform-openai-compat",
}

const PROVIDER_ORDER = [
  "ollama", "vllm",
  "aliyun", "deepseek", "tencent-cloud", "volcengine-ark",
  "moonshot", "minimax", "openrouter",
  "anthropic", "openai", "google", "groq", "mistral", "azure", "custom",
]

export function ModelsPage() {
  const { data: configs, isLoading } = useModelConfigs()
  const [activeProvider, setActiveProvider] = useState<string | undefined>(undefined)

  if (isLoading) {
    return (
      <div>
        <PageHeader title="模型配置" description="配置 AI 模型供应商的 API Key 和默认参数" />
        <div className="p-6"><Skeleton className="h-96 w-full" /></div>
      </div>
    )
  }
  if (!configs) return null

  const sorted = [...configs].sort((a, b) => {
    const ai = PROVIDER_ORDER.indexOf(a.provider)
    const bi = PROVIDER_ORDER.indexOf(b.provider)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  const current = activeProvider ?? sorted[0]?.provider
  const activeConfig = configs.find((c) => c.provider === current)

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="模型配置" description="配置 AI 模型供应商的 API Key 和默认参数" />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 左侧提供商列表 */}
        <aside className="w-52 shrink-0 border-r flex flex-col overflow-y-auto">
          <div className="p-2 space-y-0.5">
            {sorted.map((config) => (
              <button
                key={config.provider}
                onClick={() => setActiveProvider(config.provider)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors duration-150",
                  current === config.provider
                    ? "bg-muted text-foreground font-medium"
                    : "hover:bg-muted/60 text-foreground"
                )}
              >
                <ProviderIcon type={config.provider} />
                <span className="flex-1 truncate">
                  {PROVIDER_LABELS[config.provider] ?? config.provider}
                </span>
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    config.isEnabled
                      ? current === config.provider
                        ? "bg-foreground/40"
                        : "bg-success"
                      : "opacity-0"
                  )}
                />
              </button>
            ))}
          </div>
        </aside>

        {/* 右侧配置区域 */}
        {activeConfig ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 提供商标题 */}
            <div className="flex items-center gap-3">
              <ProviderIcon type={activeConfig.provider} className="size-6" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">
                    {PROVIDER_LABELS[activeConfig.provider] ?? activeConfig.provider}
                  </h2>
                  {activeConfig.isEnabled && (
                    <Badge className="bg-success/10 text-success border-success/20 text-xs">已启用</Badge>
                  )}
                </div>
                {PROVIDER_DESCRIPTIONS[activeConfig.provider] && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {PROVIDER_DESCRIPTIONS[activeConfig.provider]}
                  </p>
                )}
              </div>
            </div>

            {/* API 配置 + 用量统计 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border p-4">
                <ModelConfigForm config={activeConfig} allConfigs={configs} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">用量统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <UsageChart />
                </CardContent>
              </Card>
            </div>

            {/* 模型列表 */}
            <ModelListCard
              platformId={PROVIDER_TO_PLATFORM[activeConfig.provider] ?? activeConfig.provider}
              providerName={PROVIDER_LABELS[activeConfig.provider] ?? activeConfig.provider}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
