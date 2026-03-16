import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { OrgDept } from "@/types/user"

interface DeptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  dept?: OrgDept          // 编辑时传入
  parentDept?: OrgDept    // 新增子部门时预填父级
  allDepts: OrgDept[]
}

export function DeptDialog({ open, onOpenChange, mode, dept, parentDept, allDepts }: DeptDialogProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [parentId, setParentId] = useState<string>("none")

  useEffect(() => {
    if (!open) return
    if (mode === "edit" && dept) {
      setName(dept.name)
      setCode(dept.code ?? "")
      setParentId(dept.parentId ?? "none")
    } else {
      setName("")
      setCode("")
      setParentId(parentDept?.id ?? "none")
    }
  }, [open, mode, dept, parentDept])

  const title = mode === "edit" ? "编辑部门" : "新增部门"
  const canConfirm = name.trim().length > 0

  // 过滤掉自身及自身子孙，防止循环引用
  const availableParents = allDepts.filter((d) => d.id !== dept?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="dept-name">
              部门名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dept-name"
              placeholder="如：技术部"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dept-code">部门编码</Label>
            <Input
              id="dept-code"
              placeholder="如：TECH（选填）"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>上级部门</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="无（顶级部门）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无（顶级部门）</SelectItem>
                {availableParents.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={!canConfirm} onClick={() => onOpenChange(false)}>
            {mode === "edit" ? "保存" : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
