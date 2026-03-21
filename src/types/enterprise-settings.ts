export type LicenseStatus = "active" | "expiring" | "expired"

export interface LicenseInfo {
  id: string
  plan: string
  status: LicenseStatus
  activatedAt: string
  expiresAt: string
  serverId: string
  maxUsers: number
  usedUsers: number
  maxApps: number
  usedApps: number
  maxSeats: number
  usedSeats: number
}

export interface LicenseActivation {
  id: string
  activatedAt: string
  expiresAt: string
  plan: string
  operator: string
}

export type OutputStyle = "formal" | "professional" | "concise" | "custom"

export interface BrandSettings {
  productName: string
  orgName: string
  contactEmail: string
  contactPhone: string
  footerText: string
  primaryColor: string
  accentColor: string
  logoLightUrl: string
  logoDarkUrl: string
}

export interface SystemRules {
  systemPrompt: string
  outputStyle: OutputStyle
  updatedAt: string
  updatedBy: string
}

export type ExpertNavPlatform = "desktop" | "word" | "excel" | "ppt"

export interface ExpertNavItem {
  id: string
  label: string
  visible: boolean
}

export interface ExpertNavigationSettings {
  desktopNav: ExpertNavItem[]
  wordNav: ExpertNavItem[]
  excelNav: ExpertNavItem[]
  pptNav: ExpertNavItem[]
  updatedAt: string
  updatedBy: string
}
