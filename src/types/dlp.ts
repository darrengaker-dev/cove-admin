export type DlpCategory = "identity" | "financial" | "credential" | "classified" | "custom"
export type DlpSensitivity = "info" | "warning" | "block"
export type DlpRuleType = "builtin" | "custom"
export type DlpMatchMode = "regex" | "keyword"

export interface DlpRule {
  id: string
  name: string
  description: string
  category: DlpCategory
  type: DlpRuleType
  matchMode: DlpMatchMode
  pattern: string
  sensitivity: DlpSensitivity
  isEnabled: boolean
  matchCount: number
  blockCount: number
  lastMatchAt?: string
  createdAt: string
  updatedAt: string
}

export interface DlpStats {
  totalRules: number
  enabledRules: number
  todayBlocked: number
  todayWarned: number
}

export interface CreateDlpRuleBody {
  name: string
  description?: string
  category: DlpCategory
  matchMode: DlpMatchMode
  pattern: string
  sensitivity: DlpSensitivity
}

export interface UpdateDlpRuleBody {
  name?: string
  description?: string
  sensitivity?: DlpSensitivity
  isEnabled?: boolean
  pattern?: string
}
