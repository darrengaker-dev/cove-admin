export type UpdateChannel = "stable" | "beta"
export type UpdateStatus = "idle" | "checking" | "available" | "up-to-date" | "downloading" | "installing" | "done" | "error"
export type InstallMode = "silent_restart" | "next_launch" | "immediate"

export interface AppVersion {
  version: string
  releaseDate: string
  releaseNotes: string
  channel: UpdateChannel
}

export interface UpdatePolicy {
  autoUpdate: boolean
  channel: UpdateChannel
  forceMinVersion: string
  installMode: InstallMode
  scheduledEnabled: boolean
  scheduledStart: string  // "22:00"
  scheduledEnd: string    // "06:00"
}

export interface ClientDistributionItem {
  version: string
  count: number
  isLatest: boolean
}

export interface OsDistributionItem {
  os: string
  count: number
}

export interface ClientStats {
  totalClients: number
  updatedClients: number
  pendingClients: number
  distribution: ClientDistributionItem[]
  osDistribution: OsDistributionItem[]
}

export interface UpdateRecord {
  id: string
  fromVersion: string
  toVersion: string
  updatedAt: string
  clientCount: number
  status: "success" | "failed" | "partial"
  errorMessage: string | null
  releaseNotes?: string
}
