import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DlpRule } from "@/types/dlp"

const schema = z.object({
  name:        z.string().min(2, "规则名称至少2个字符"),
  description: z.string().optional(),
  category:    z.enum(["identity", "financial", "credential", "classified", "custom"]),
  matchMode:   z.enum(["regex", "keyword"]),
  pattern:     z.string().min(1, "请输入匹配内容"),
  sensitivity: z.enum(["info", "warning", "block"]),
})
type FormValues = z.infer<typeof schema>

const CATEGORY_OPTIONS = [
  { value: "identity",   label: "身份信息" },
  { value: "financial",  label: "金融信息" },
  { value: "credential", label: "密钥凭证" },
  { value: "classified", label: "涉密信息" },
  { value: "custom",     label: "自定义" },
]

const SENSITIVITY_OPTIONS = [
  { value: "info",    label: "信息提示（蓝色）" },
  { value: "warning", label: "确认警告（黄色）" },
  { value: "block",   label: "直接拦截（红色）" },
]

interface DlpRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editRule?: DlpRule | null
  onSubmit: (values: FormValues) => void
  isPending?: boolean
}

export function DlpRuleDialog({ open, onOpenChange, editRule, onSubmit, isPending }: DlpRuleDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", category: "custom", matchMode: "keyword", pattern: "", sensitivity: "info" },
  })

  useEffect(() => {
    if (editRule) {
      form.reset({
        name: editRule.name,
        description: editRule.description,
        category: editRule.category,
        matchMode: editRule.matchMode,
        pattern: editRule.pattern,
        sensitivity: editRule.sensitivity,
      })
    } else {
      form.reset({ name: "", description: "", category: "custom", matchMode: "keyword", pattern: "", sensitivity: "info" })
    }
  }, [editRule, open, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{editRule ? "编辑规则" : "新增自定义规则"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>规则名称</FormLabel>
                <FormControl><Input placeholder="如：内部项目代号" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>描述 <span className="text-muted-foreground text-xs">（可选）</span></FormLabel>
                <FormControl><Textarea placeholder="简要描述规则用途" rows={2} className="resize-none" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="matchMode" render={({ field }) => (
                <FormItem>
                  <FormLabel>匹配模式</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="keyword">关键词</SelectItem>
                      <SelectItem value="regex">正则表达式</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="pattern" render={({ field }) => (
              <FormItem>
                <FormLabel>匹配内容</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={form.watch("matchMode") === "regex" ? "输入正则表达式，如 \\d{18}" : "多个关键词用 | 分隔，如 机密|内部"}
                    rows={3}
                    className="font-mono text-sm resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sensitivity" render={({ field }) => (
              <FormItem>
                <FormLabel>敏感等级</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {SENSITIVITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "保存中..." : "保存"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
