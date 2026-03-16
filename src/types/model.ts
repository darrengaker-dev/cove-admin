export type ModelProvider =
  | "openai" | "anthropic" | "deepseek" | "google" | "azure" | "custom"
  | "aliyun" | "minimax" | "moonshot" | "openrouter"
  | "tencent-cloud" | "volcengine-ark" | "ollama" | "vllm" | "groq" | "mistral";

export interface ModelConfig {
  provider: ModelProvider;
  name: string;
  apiKey: string;
  baseUrl: string | null;
  defaultModel: string;
  isEnabled: boolean;
  availableModels: string[];
}

export interface UsageStat {
  date: string;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
  estimatedCost: number;
}

// ── 平台管理（新架构）──────────────────────────────────

export interface Platform {
  id: string;
  numericId: number;          // 展示用 ID，如 200、300
  name: string;               // 内部名称，如 "OpenAiProtocolPlatform"
  displayName: string;        // 客户端显示名称
  baseUrl: string;            // 默认接口地址
  chatApiPath: string;        // 默认对话路径，如 /v1/chat/completions
  defaultModelId: string | null;
  isEnabled: boolean;
  modelCount: number;         // 已配置模型数
  clientModelCount: number;   // 客户端可用模型数
}

export interface PlatformAccount {
  id: string;
  platformId: string;
  name: string;        // 账号名
  apiId?: string;      // API ID（部分平台需要）
  apiKey: string;      // 已脱敏显示
  apiSecret?: string;
}

export interface PlatformModel {
  id: string;
  platformId: string;
  accountId: string;
  clientName: string;       // 客户端模型名称（别名）
  platformName: string;     // 平台模型名称（与 API model 参数一致）
  baseUrl?: string;         // 可覆盖平台默认 URL
  maxInputTokens: number;   // 上下文长度
  maxOutputTokens: number;  // 最大输出 Tokens
  isClientVisible: boolean;
  // 模型能力
  supportsVision: boolean;
  supportsTools: boolean;
  supportsReasoning: boolean;
  supportsEmbedding: boolean;
}
