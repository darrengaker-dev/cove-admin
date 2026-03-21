import { useState, useEffect } from "react"
import { CheckCircle2, Upload, X } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandRulesTabs } from "@/components/settings/BrandRulesTabs"
import { useBrandSettings, useSaveBrandSettings } from "@/hooks/useEnterpriseSettings"
import type { BrandSettings } from "@/types/enterprise-settings"

const DEFAULT_PRIMARY = "#2563EB"
const DEFAULT_ACCENT  = "#7C3AED"

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="size-8 shrink-0 rounded-md border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label}`)?.click()}
        />
        <input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 font-mono text-xs w-32"
          maxLength={7}
        />
      </div>
    </div>
  )
}

function LogoUploadArea({
  label,
  bg,
  value,
  onChange,
}: {
  label: string
  bg: string
  value: string
  onChange: (v: string) => void
}) {
  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div
        className={`relative flex items-center justify-center rounded-xl border-2 border-dashed h-20 w-40 cursor-pointer hover:border-muted-foreground/50 transition-colors ${bg}`}
        onClick={() => document.getElementById(`logo-${label}`)?.click()}
      >
        <input
          id={`logo-${label}`}
          type="file"
          accept="image/png,image/svg+xml"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {value ? (
          <>
            <img src={value} alt="logo" className="max-h-12 max-w-32 object-contain" />
            <button
              className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 hover:bg-background"
              onClick={(e) => { e.stopPropagation(); onChange("") }}
            >
              <X className="size-3" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <Upload className="size-4 mx-auto text-muted-foreground mb-1" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground">PNG / SVG</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function BrandPage() {
  const { data, isLoading } = useBrandSettings()
  const saveMutation = useSaveBrandSettings()
  const [form, setForm] = useState<BrandSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data && !form) setForm(data)
  }, [data, form])

  const set = (key: keyof BrandSettings, value: string) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev)
    setSaved(false)
  }

  const handleSave = () => {
    if (!form) return
    saveMutation.mutate(form, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      },
    })
  }

  if (isLoading || !form) {
    return (
      <div>
        <PageHeader
          title="品牌设置"
          description="自定义产品标识、品牌色调与企业信息"
          actions={<BrandRulesTabs />}
        />
        <div className="p-6 space-y-5">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="品牌设置"
        description="自定义产品标识、品牌色调与企业信息，修改后客户端界面将同步更新"
        actions={<BrandRulesTabs />}
      />

      <div className="p-6 space-y-5">
        {/* Brand identity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">品牌标识</CardTitle>
            <CardDescription className="text-xs">出现在客户端顶栏、登录页、关于页等核心位置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <LogoUploadArea
                label="亮色模式 Logo"
                bg="bg-white"
                value={form.logoLightUrl}
                onChange={(v) => set("logoLightUrl", v)}
              />
              <LogoUploadArea
                label="暗色模式 Logo"
                bg="bg-zinc-900"
                value={form.logoDarkUrl}
                onChange={(v) => set("logoDarkUrl", v)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">产品名称</Label>
                <Input
                  value={form.productName}
                  onChange={(e) => set("productName", e.target.value)}
                  placeholder="例：某企业智能助手"
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">显示在客户端顶栏和标题栏</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">登录页备案/版权文字（可选）</Label>
                <Input
                  value={form.footerText}
                  onChange={(e) => set("footerText", e.target.value)}
                  placeholder="例：© 2026 某企业  京ICP备XXXXXXXX号"
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">显示在登录页底部</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color palette */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">品牌色调</CardTitle>
            <CardDescription className="text-xs">影响按钮、高亮、链接等界面元素的颜色</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-8">
              <ColorInput label="主色调" value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
              <ColorInput label="辅色调" value={form.accentColor} onChange={(v) => set("accentColor", v)} />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">预览</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    className="h-8 px-3 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    主按钮
                  </button>
                  <button
                    className="h-8 px-3 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: form.accentColor }}
                  >
                    辅助按钮
                  </button>
                  <span className="text-sm" style={{ color: form.primaryColor }}>
                    链接文字
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-muted-foreground">重置</p>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => { set("primaryColor", DEFAULT_PRIMARY); set("accentColor", DEFAULT_ACCENT) }}
                >
                  恢复默认色
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">企业信息</CardTitle>
            <CardDescription className="text-xs">显示在帮助页、邮件签名和客户端关于页</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">单位名称</Label>
                <Input
                  value={form.orgName}
                  onChange={(e) => set("orgName", e.target.value)}
                  placeholder="例：某科技有限公司"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">技术支持邮箱</Label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  placeholder="support@example.com"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">技术支持电话（可选）</Label>
                <Input
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  placeholder="400-XXX-XXXX"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "保存中..." : "保存设置"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="size-4" />已保存
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
