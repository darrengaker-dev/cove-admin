import { useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useBanUser, useUnbanUser } from "@/hooks/useUsers"
import type { User } from "@/types/user"

interface BanUserDialogProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BanUserDialog({ user, open, onOpenChange }: BanUserDialogProps) {
  const [reason, setReason] = useState("")
  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()

  const isDisabled = user.status === "disabled"

  const handleConfirm = async () => {
    if (isDisabled) {
      await unbanMutation.mutateAsync(user.id)
    } else {
      if (!reason.trim()) return
      await banMutation.mutateAsync({ id: user.id, body: { reason: reason.trim() } })
    }
    onOpenChange(false)
    setReason("")
  }

  const isLoading = banMutation.isPending || unbanMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isDisabled ? "启用账号" : "禁用账号"}</DialogTitle>
          <DialogDescription>
            {isDisabled
              ? `确认启用 ${user.name}（${user.loginName}）的账号？`
              : `禁用后该用户将无法登录。请填写禁用原因。`}
          </DialogDescription>
        </DialogHeader>

        {!isDisabled && (
          <div className="grid gap-2">
            <Label htmlFor="reason">禁用原因 <span className="text-destructive">*</span></Label>
            <Textarea
              id="reason"
              placeholder="请输入禁用原因..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>取消</Button>
          <Button
            variant={isDisabled ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isLoading || (!isDisabled && !reason.trim())}
          >
            {isLoading ? "处理中..." : (isDisabled ? "启用账号" : "确认禁用")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
