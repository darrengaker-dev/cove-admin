import { useState } from "react"
import { Copy, Check } from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useResetPassword } from "@/hooks/useUsers"

interface ResetPasswordDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetPasswordDialog({ userId, open, onOpenChange }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const mutation = useResetPassword()

  const handleReset = async () => {
    const result = await mutation.mutateAsync(userId)
    setPassword(result.temporaryPassword)
  }

  const handleCopy = () => {
    if (!password) return
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => { setPassword(null); setCopied(false) }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
          <DialogDescription>
            {password ? "密码已重置，请将临时密码发送给用户。" : "将为该用户生成一个临时密码，用户登录后需修改。"}
          </DialogDescription>
        </DialogHeader>

        {password ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
            <code className="flex-1 font-mono text-sm select-all">{password}</code>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            </Button>
          </div>
        ) : null}

        <DialogFooter>
          {password ? (
            <Button onClick={handleClose}>完成</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>取消</Button>
              <Button onClick={handleReset} disabled={mutation.isPending}>
                {mutation.isPending ? "生成中..." : "生成临时密码"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
