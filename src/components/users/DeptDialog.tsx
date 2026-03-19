import { useState, useEffect, useMemo } from "react"
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
  const [parentId, setParentId] = useState<string>("none")

  useEffect(() => {
    if (!open) return
    if (mode === "edit" && dept) {
      setName(dept.name)
      setParentId(dept.parentId ?? "none")
    } else {
      setName("")
      setParentId(parentDept?.id ?? "none")
    }
  }, [open, mode, dept, parentDept])

  const title = mode === "edit" ? "编辑部门" : "新增部门"
  const canConfirm = name.trim().length > 0

  const generatedCode = useMemo(() => {
    const source = name.trim()
    if (!source) return mode === "edit" ? (dept?.code ?? "系统自动生成") : "保存后自动生成"
    const ascii = source
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase()

    if (ascii) return ascii

    const hash = Array.from(source).reduce((acc, char) => {
      return (acc * 31 + char.charCodeAt(0)) % 1000000
    }, 0)

    return `DEPT_${hash.toString().padStart(6, "0")}`
  }, [name, mode, dept?.code])

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
              value={generatedCode}
              readOnly
              className="bg-muted/40 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              由系统根据部门名称自动生成，无需手动填写
            </p>
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
