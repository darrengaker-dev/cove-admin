import { useState } from "react"
import type React from "react"
import { Sparkles, Download, Monitor, Puzzle, ChevronDown, ChevronUp } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { UpgradeGuide } from "@/components/versions/UpgradeGuide"
import { UpdateHistory } from "@/components/versions/UpdateHistory"
import { useCurrentVersion, useLatestVersion, useClientStats } from "@/hooks/useVersions"
import { formatDateShort } from "@/lib/format"
import { cn } from "@/lib/utils"

interface DownloadPkg {
  name: string
  sub: string
  href: string
  size: string
  disabled?: boolean
}

interface DownloadGroupProps {
  icon: React.ElementType
  label: string
  product: string
  packages: DownloadPkg[]
  controls?: React.ReactNode
}

function DownloadGroup({ icon: Icon, label, product, packages, controls }: DownloadGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
        {label && (
          <>
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
          </>
        )}
        <span className="text-xs font-semibold">{product}</span>
      </div>
      {controls && <div className="mb-3">{controls}</div>}
      <div className="grid grid-cols-3 gap-2">
        {packages.map((pkg) => (
          <a
            key={pkg.name}
            href={pkg.disabled ? "#" : pkg.href}
            onClick={(e) => {
              if (pkg.disabled) e.preventDefault()
            }}
            aria-disabled={pkg.disabled}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors group",
              pkg.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
            )}
          >
            <Download className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" strokeWidth={1.5} />
            <div className="min-w-0">
              <div className="text-sm font-medium">{pkg.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{pkg.sub} · {pkg.size}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

type OfficePluginId = "word" | "excel" | "ppt" | "pdf"

const OFFICE_PLUGINS: Array<{ id: OfficePluginId; label: string }> = [
  { id: "word", label: "Word" },
  { id: "excel", label: "Excel" },
  { id: "ppt", label: "PPT" },
  { id: "pdf", label: "PDF" },
]

export function VersionsPage() {
  const { data: current, isLoading: loadingCurrent } = useCurrentVersion()
  const { data: latest,  isLoading: loadingLatest  } = useLatestVersion()
  const { data: clients } = useClientStats()
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [officePluginEnabled, setOfficePluginEnabled] = useState<Record<OfficePluginId, boolean>>({
    word: true,
    excel: true,
    ppt: true,
    pdf: true,
  })

  const hasUpdate = !!(current && latest && current.version !== latest.version)
  const adoptionRate = clients
    ? Math.round((clients.updatedClients / clients.totalClients) * 100)
    : 0
  const selectedOfficePlugins = OFFICE_PLUGINS
    .filter((p) => officePluginEnabled[p.id])
    .map((p) => p.id)
  const officePluginsParam = selectedOfficePlugins.join(",")
  const officeDownloadsDisabled = !latest?.version || selectedOfficePlugins.length === 0
  const showOsDistribution = !!(clients && clients.osDistribution.length > 0)
  const showVersionDistribution = !!(clients && clients.distribution.length > 0)

  return (
    <div>
      <PageHeader
        title="版本升级"
        description="通过策略配置实现客户端无感知自动更新，无需管理员手动部署和实施"
      />

      <div className="p-6 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1.5">当前服务版本</div>
            {loadingCurrent ? <Skeleton className="h-7 w-24" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono">v{current?.version}</span>
                <Badge variant="secondary" className="text-xs">{current?.channel}</Badge>
              </div>
            )}
            {current && <div className="text-xs text-muted-foreground mt-1.5">{formatDateShort(current.releaseDate)}</div>}
          </div>

          <div className={`rounded-xl border p-4 ${hasUpdate ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
            <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              最新可用版本
              {hasUpdate && <Sparkles className="size-3 text-blue-500" />}
            </div>
            {loadingLatest ? <Skeleton className="h-7 w-24" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono">v{latest?.version}</span>
                {hasUpdate
                  ? <Badge className="text-xs bg-blue-500 hover:bg-blue-500 text-white">有更新</Badge>
                  : <Badge variant="secondary" className="text-xs">{latest?.channel}</Badge>
                }
              </div>
            )}
            {latest && <div className="text-xs text-muted-foreground mt-1.5">{formatDateShort(latest.releaseDate)}</div>}
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1.5">已更新终端</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums">{clients?.updatedClients ?? "—"}</span>
              <span className="text-sm text-muted-foreground">台</span>
            </div>
            {clients && (
              <div className="mt-2 space-y-1">
                <Progress value={adoptionRate} className="h-1.5" />
                <div className="text-xs text-muted-foreground">{adoptionRate}% 覆盖率</div>
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground mb-1.5">待更新终端</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold tabular-nums ${(clients?.pendingClients ?? 0) > 0 ? "text-yellow-600 dark:text-yellow-400" : ""}`}>
                {clients?.pendingClients ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground">台</span>
            </div>
            {clients && <div className="text-xs text-muted-foreground mt-1.5">共 {clients.totalClients} 台终端</div>}
          </div>
        </div>

        {/* New version banner — informational */}
        {hasUpdate && latest && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">新版本 v{latest.version} 可用</span>
                  <span className="text-xs text-muted-foreground">{formatDateShort(latest.releaseDate)}</span>
                </div>
                <p className={cn("text-sm text-muted-foreground leading-relaxed", !notesExpanded && "line-clamp-2")}>
                  {latest.releaseNotes}
                </p>
                <button
                  onClick={() => setNotesExpanded(v => !v)}
                  className="flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-600 mt-1 transition-colors"
                >
                  {notesExpanded
                    ? <><ChevronUp className="size-3" />收起</>
                    : <><ChevronDown className="size-3" />查看更多</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade guide */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">升级操作指引</CardTitle>
            <CardDescription className="text-xs">按以下步骤完成服务端部署与客户端推送，全程无需逐台操作</CardDescription>
          </CardHeader>
          <CardContent>
            <UpgradeGuide current={current} latest={latest} clients={clients} />
          </CardContent>
        </Card>

        {/* Client downloads + OS distribution — side by side */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
          <Card className={cn(showOsDistribution ? "lg:col-span-4" : "lg:col-span-7")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">客户端下载</CardTitle>
                  <CardDescription className="text-xs mt-0.5">将最新安装包分发给新用户，或供老用户手动安装</CardDescription>
                </div>
                {latest && (
                  <Badge variant="secondary" className="text-xs font-mono">v{latest.version}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <DownloadGroup
                icon={Monitor}
                label=""
                product="Cove Desktop"
                packages={[
                  { name: "Windows",  sub: "x64 · EXE",         href: `/downloads/cove-${latest?.version}-win-x64.exe`,      size: "48 MB" },
                  { name: "信创",     sub: "UOS / Kylin · DEB",  href: `/downloads/cove-${latest?.version}-xinchuang.deb`,    size: "52 MB" },
                  { name: "macOS",    sub: "Universal · DMG",    href: `/downloads/cove-${latest?.version}-mac-universal.dmg`, size: "60 MB" },
                ]}
              />
              <Separator />
              <DownloadGroup
                icon={Puzzle}
                label=""
                product="Cove for Office/WPS"
                controls={(
                  <div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-xs text-muted-foreground">安装包包含：</span>
                      {OFFICE_PLUGINS.map((plugin) => {
                        const id = `office-plugin-${plugin.id}`
                        const checked = officePluginEnabled[plugin.id]
                        return (
                          <div key={plugin.id} className="flex items-center gap-2">
                            <Checkbox
                              id={id}
                              checked={checked}
                              onCheckedChange={(v) => {
                                setOfficePluginEnabled((prev) => ({ ...prev, [plugin.id]: v === true }))
                              }}
                            />
                            <Label htmlFor={id} className="text-xs font-normal text-muted-foreground cursor-pointer hover:text-foreground">
                              {plugin.label}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                    {selectedOfficePlugins.length === 0 && (
                      <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                        至少选择 1 项插件后才能生成安装包
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      下载链接会按勾选组合生成对应安装包
                    </div>
                  </div>
                )}
                packages={[
                  {
                    name: "Windows",
                    sub: "x64 · EXE",
                    href: `/downloads/cove-office-${latest?.version}-win-x64.exe?plugins=${encodeURIComponent(officePluginsParam)}`,
                    size: `已选 ${selectedOfficePlugins.length} 项`,
                    disabled: officeDownloadsDisabled,
                  },
                  {
                    name: "信创",
                    sub: "UOS / Kylin · DEB",
                    href: `/downloads/cove-office-${latest?.version}-xinchuang.deb?plugins=${encodeURIComponent(officePluginsParam)}`,
                    size: `已选 ${selectedOfficePlugins.length} 项`,
                    disabled: officeDownloadsDisabled,
                  },
                  {
                    name: "macOS",
                    sub: "Universal · DMG",
                    href: `/downloads/cove-office-${latest?.version}-mac-universal.dmg?plugins=${encodeURIComponent(officePluginsParam)}`,
                    size: `已选 ${selectedOfficePlugins.length} 项`,
                    disabled: officeDownloadsDisabled,
                  },
                ]}
              />
              <div className="pt-1 border-t">
                <p className="text-xs text-muted-foreground pt-3">安装包基于最新版本生成，可将链接或文件直接分发给用户</p>
              </div>
            </CardContent>
          </Card>

          {/* OS distribution */}
          {clients && clients.osDistribution.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">客户端系统分布</CardTitle>
                <CardDescription className="text-xs mt-0.5">当前在线客户端的操作系统统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.osDistribution.map((item) => {
                    const pct = Math.round((item.count / clients.totalClients) * 100)
                    return (
                      <div key={item.os} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-muted-foreground shrink-0 truncate">{item.os}</div>
                        <div className="flex-1">
                          <Progress value={pct} className="h-2" />
                        </div>
                        <div className="w-24 text-sm text-muted-foreground text-right shrink-0">
                          {item.count} 台
                          <span className="text-xs ml-1">({pct}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Update history + Client distribution — side by side */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
          <Card className={cn(showVersionDistribution ? "lg:col-span-4" : "lg:col-span-7")}>
            <CardContent className="pt-4">
              <UpdateHistory />
            </CardContent>
          </Card>

          {clients && clients.distribution.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">客户端版本分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.distribution.map((item) => {
                    const pct = Math.round((item.count / clients.totalClients) * 100)
                    return (
                      <div key={item.version} className="flex items-center gap-3">
                        <div className="w-16 font-mono text-sm text-right shrink-0">v{item.version}</div>
                        <div className="flex-1">
                          <Progress value={pct} className="h-2" />
                        </div>
                        <div className="w-28 text-sm text-muted-foreground text-right shrink-0">
                          {item.count} 台
                          <span className="text-xs ml-1">({pct}%)</span>
                        </div>
                        {item.isLatest && (
                          <Badge variant="outline" className="text-xs py-0 h-4 shrink-0">最新</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}
