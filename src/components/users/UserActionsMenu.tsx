import { useState } from "react"
import { MoreHorizontal, Ban, CheckCircle, KeyRound, ScrollText, Pencil, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { BanUserDialog } from "./BanUserDialog"
import { ResetPasswordDialog } from "./ResetPasswordDialog"
import { EditMemberDialog } from "./EditMemberDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import type { User } from "@/types/user"

interface UserActionsMenuProps {
  user: User
}

export function UserActionsMenu({ user }: UserActionsMenuProps) {
  const navigate = useNavigate()
  const [banOpen, setBanOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-4" />
            编辑信息
          </DropdownMenuItem>
          {user.status === "disabled" ? (
            <DropdownMenuItem onClick={() => setBanOpen(true)}>
              <CheckCircle className="mr-2 size-4" />
              启用账号
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setBanOpen(true)} className="text-destructive focus:text-destructive">
              <Ban className="mr-2 size-4" />
              禁用账号
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            <KeyRound className="mr-2 size-4" />
            重置密码
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate(`/audit-logs?userId=${user.id}`)}>
            <ScrollText className="mr-2 size-4" />
            查看日志
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 size-4" />
            删除成员
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditMemberDialog member={user} open={editOpen} onOpenChange={setEditOpen} />
      <BanUserDialog user={user} open={banOpen} onOpenChange={setBanOpen} />
      <ResetPasswordDialog userId={user.id} open={resetOpen} onOpenChange={setResetOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="删除成员"
        description={`确认删除成员 ${user.name}（${user.loginName}）？此操作不可撤销。`}
        confirmVariant="destructive"
        confirmLabel="确认删除"
        onConfirm={() => setDeleteOpen(false)}
      />
    </>
  )
}
