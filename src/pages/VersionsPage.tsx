import { useState } from "react"
import type React from "react"
import { Sparkles, Download, Monitor, Puzzle, ChevronDown, ChevronUp } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
}

interface DownloadGroupProps {
  icon: React.ElementType
  label: string
  product: string
  packages: DownloadPkg[]
}

function DownloadGroup({ icon: Icon, label, product, packages }: DownloadGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
        {label && (
          <>
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
          </>
        )}
        <span className="text-xs font-semibold">{product}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {packages.map((pkg) => (
          <a
            key={pkg.name}
            href={pkg.href}
            className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors group"
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

export function VersionsPage() {
  const { data: current, isLoading: loadingCurrent } = useCurrentVersion()
  const { data: latest,  isLoading: loadingLatest  } = useLatestVersion()
  const { data: clients } = useClientStats()
  const [notesExpanded, setNotesExpanded] = useState(false)

  const hasUpdate = !!(current && latest && current.version !== latest.version)
  const adoptionRate = clients
    ? Math.round((clients.updatedClients / clients.totalClients) * 100)
    : 0

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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
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
                product="Cove in Word"
                packages={[
                  { name: "Windows",  sub: "Word / WPS · VSIX",    href: `/downloads/cove-word-${latest?.version}-win.vsix`,   size: "8.4 MB" },
                  { name: "信创",     sub: "WPS for UOS · VSIX",   href: `/downloads/cove-word-${latest?.version}-xc.vsix`,    size: "7.9 MB" },
                  { name: "macOS",    sub: "Word for Mac · VSIX",  href: `/downloads/cove-word-${latest?.version}-mac.vsix`,   size: "8.1 MB" },
                ]}
              />
              <Separator />
              <DownloadGroup
                icon={Puzzle}
                label=""
                product="Cove in Excel"
                packages={[
                  { name: "Windows",  sub: "Excel / WPS · VSIX",   href: `/downloads/cove-excel-${latest?.version}-win.vsix`,  size: "8.2 MB" },
                  { name: "信创",     sub: "WPS for UOS · VSIX",   href: `/downloads/cove-excel-${latest?.version}-xc.vsix`,   size: "7.7 MB" },
                  { name: "macOS",    sub: "Excel for Mac · VSIX", href: `/downloads/cove-excel-${latest?.version}-mac.vsix`,  size: "7.9 MB" },
                ]}
              />
              <Separator />
              <DownloadGroup
                icon={Puzzle}
                label=""
                product="Cove in PPT"
                packages={[
                  { name: "Windows",  sub: "PPT / WPS · VSIX",    href: `/downloads/cove-ppt-${latest?.version}-win.vsix`,   size: "8.0 MB" },
                  { name: "信创",     sub: "WPS for UOS · VSIX",  href: `/downloads/cove-ppt-${latest?.version}-xc.vsix`,    size: "7.6 MB" },
                  { name: "macOS",    sub: "PPT for Mac · VSIX",  href: `/downloads/cove-ppt-${latest?.version}-mac.vsix`,   size: "7.8 MB" },
                ]}
              />
              <div className="pt-1 border-t">
                <p className="text-xs text-muted-foreground pt-3">安装包基于最新版本生成，可将链接或文件直接分发给用户</p>
              </div>
            </CardContent>
          </Card>

          {/* OS distribution */}
          {clients && clients.osDistribution.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">终端系统分布</CardTitle>
                <CardDescription className="text-xs mt-0.5">当前在线终端的操作系统统计</CardDescription>
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-4">
              <UpdateHistory />
            </CardContent>
          </Card>

          {clients && clients.distribution.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">终端版本分布</CardTitle>
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
