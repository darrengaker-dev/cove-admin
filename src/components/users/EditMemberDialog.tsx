import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { MOCK_DEPTS } from "@/mocks/data/users"
import type { Member, MemberStatus } from "@/types/user"

interface EditMemberDialogProps {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const [name, setName] = useState("")
  const [loginName, setLoginName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [employeeNo, setEmployeeNo] = useState("")
  const [deptId, setDeptId] = useState("")
  const [status, setStatus] = useState<MemberStatus>("active")

  useEffect(() => {
    if (!open || !member) return
    setName(member.name)
    setLoginName(member.loginName)
    setEmail(member.email ?? "")
    setMobile(member.mobile ?? "")
    setJobTitle(member.jobTitle ?? "")
    setEmployeeNo(member.employeeNo ?? "")
    setDeptId(member.primaryDeptId)
    setStatus(member.status)
  }, [open, member])

  const canSave = name.trim() && loginName.trim() && deptId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>编辑成员</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* 第一行：姓名 + 账号 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name">
                姓名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="loginName">
                登录账号 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="loginName"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="如：user001"
              />
            </div>
          </div>

          {/* 第二行：邮箱 + 手机 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="mobile">手机号</Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="请输入手机号"
              />
            </div>
          </div>

          {/* 第三行：部门 + 职称 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>
                所属部门 <span className="text-destructive">*</span>
              </Label>
              <Select value={deptId} onValueChange={setDeptId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_DEPTS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="jobTitle">职称</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="如：高级工程师"
              />
            </div>
          </div>

          {/* 第四行：工号 + 状态 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="employeeNo">工号</Label>
              <Input
                id="employeeNo"
                value={employeeNo}
                onChange={(e) => setEmployeeNo(e.target.value)}
                placeholder="如：EMP1001"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>状态</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">在职</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                  <SelectItem value="resigned">已离职</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={!canSave} onClick={() => onOpenChange(false)}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
