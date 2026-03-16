import { ArrowUpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateShort } from "@/lib/format"
import type { AppVersion } from "@/types/version"

interface VersionCardProps {
  label: string
  version: AppVersion | undefined
  isLoading: boolean
  highlight?: boolean
}

export function VersionCard({ label, version, isLoading, highlight }: VersionCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
        <CardContent><Skeleton className="h-8 w-32" /></CardContent>
      </Card>
    )
  }
  if (!version) return null

  return (
    <Card className={highlight ? "border-brand/40" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
          {label}
          {highlight && <ArrowUpCircle className="size-4 text-brand" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-mono">v{version.version}</span>
          <StatusBadge status={version.channel} />
        </div>
        <div className="text-xs text-muted-foreground">发布于 {formatDateShort(version.releaseDate)}</div>
        {version.releaseNotes && (
          <p className="text-sm text-muted-foreground border-l-2 pl-3">{version.releaseNotes}</p>
        )}
      </CardContent>
    </Card>
  )
}
