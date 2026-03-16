import { cn } from "@/lib/utils"
import type { ForwardRefExoticComponent, SVGProps, RefAttributes } from "react"

import Anthropic from "@lobehub/icons/es/Anthropic"
import AlibabaCloud from "@lobehub/icons/es/AlibabaCloud"
import Azure from "@lobehub/icons/es/Azure"
import DeepSeek from "@lobehub/icons/es/DeepSeek"
import Google from "@lobehub/icons/es/Google"
import Groq from "@lobehub/icons/es/Groq"
import Mistral from "@lobehub/icons/es/Mistral"
import Minimax from "@lobehub/icons/es/Minimax"
import Moonshot from "@lobehub/icons/es/Moonshot"
import Ollama from "@lobehub/icons/es/Ollama"
import OpenAI from "@lobehub/icons/es/OpenAI"
import OpenRouter from "@lobehub/icons/es/OpenRouter"
import TencentCloud from "@lobehub/icons/es/TencentCloud"
import Volcengine from "@lobehub/icons/es/Volcengine"
import Vllm from "@lobehub/icons/es/Vllm"

type SvgIcon = ForwardRefExoticComponent<SVGProps<SVGSVGElement> & { size?: string | number } & RefAttributes<SVGSVGElement>>

const PROVIDER_ICONS: Record<string, SvgIcon> = {
  anthropic:        Anthropic,
  aliyun:           AlibabaCloud,
  azure:            Azure,
  deepseek:         DeepSeek,
  google:           Google,
  groq:             Groq,
  mistral:          Mistral,
  minimax:          Minimax,
  moonshot:         Moonshot,
  ollama:           Ollama,
  openai:           OpenAI,
  openrouter:       OpenRouter,
  "tencent-cloud":  TencentCloud,
  "volcengine-ark": Volcengine,
  vllm:             Vllm,
  custom:           OpenAI,
}

export function ProviderIcon({ type, className }: { type: string; className?: string }) {
  const Icon = PROVIDER_ICONS[type]
  if (!Icon) {
    return (
      <div className={cn("flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-muted-foreground bg-muted", className)}>
        {type.slice(0, 2).toUpperCase()}
      </div>
    )
  }
  return <Icon className={cn("size-4 shrink-0", className)} />
}
