import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface InfoTooltipProps {
  text: string
  maxWidth?: number
  side?: "top" | "bottom" | "left" | "right"
}

export function InfoTooltip({ text, maxWidth = 220, side = "top" }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help shrink-0 transition-colors" />
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="leading-relaxed text-center"
        style={{ maxWidth }}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
