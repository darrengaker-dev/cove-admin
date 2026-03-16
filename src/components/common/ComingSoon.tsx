import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ComingSoonProps {
  title?: string
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32">
      <Lock className="mb-4 size-12 text-muted-foreground/30" strokeWidth={1} />
      <Badge variant="secondary" className="mb-3">Coming Soon</Badge>
      <h2 className="text-base font-semibold text-foreground">{title ?? "企业版功能"}</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs text-center">
        该功能将在企业版中提供，支持多租户、组织架构管理和合规审计等能力。
      </p>
    </div>
  )
}
