import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Users, Cpu, ScrollText, RefreshCw,
  Shield,
  LogOut, ChevronLeft, ChevronRight,
  KeyRound, Palette, SlidersHorizontal, ShieldCheck, Blocks, Link2,
} from "lucide-react"
import {
  SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "仪表盘", icon: LayoutDashboard, href: "/dashboard" },
  { label: "用户管理", icon: Users, href: "/users" },
  { label: "模型配置", icon: Cpu, href: "/models" },
  { label: "扩展市场", icon: Blocks, href: "/enterprise/extensions" },
  { label: "DLP 配置", icon: Shield, href: "/enterprise/dlp" },
  { label: "操作日志", icon: ScrollText, href: "/audit-logs" },
  { label: "版本升级", icon: RefreshCw, href: "/versions" },
]

const settingsItems = [
  { label: "授权管理", icon: KeyRound,          href: "/settings/license" },
  { label: "品牌设置", icon: Palette,           href: "/settings/brand" },
  { label: "规则设置", icon: SlidersHorizontal, href: "/settings/rules" },
  { label: "权限设置", icon: ShieldCheck,       href: "/settings/permissions" },
  { label: "SSO 设置", icon: Link2,           href: "/settings/identity-sync" },
]


export function AdminSidebar() {
  const location = useLocation()
  const { admin, logout } = useAuthStore()
  const { open, setOpen } = useSidebar()

  return (
    <>
      <SidebarHeader>
        {open ? (
          /* 展开态：logo + 文字 + 收起按钮 */
          <div className="flex items-center gap-2 min-w-0 w-full">
            <img src="/logo.png" alt="Cove" className="size-7 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">Cove Admin</div>
              <div className="truncate text-xs text-muted-foreground">管理后台</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        ) : (
          /* 收起态：仅显示展开按钮，避免 logo 遮挡内容 */
          <div className="flex justify-center w-full">
            <button
              onClick={() => setOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const active = location.pathname === item.href
              return (
                <SidebarMenuItem key={item.href}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={item.href}>
                          <SidebarMenuButton isActive={active}>
                            <item.icon className="size-4 shrink-0" strokeWidth={1.5} />
                            {open && <span className="truncate">{item.label}</span>}
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      {!open && <TooltipContent side="right">{item.label}</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          {open && <SidebarGroupLabel>企业设置</SidebarGroupLabel>}
          <SidebarMenu>
            {settingsItems.map((item) => {
              const active = location.pathname === item.href
              return (
                <SidebarMenuItem key={item.href}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to={item.href}>
                          <SidebarMenuButton isActive={active}>
                            <item.icon className="size-4 shrink-0" strokeWidth={1.5} />
                            {open && <span className="truncate">{item.label}</span>}
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      {!open && <TooltipContent side="right">{item.label}</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <div className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5", open && "justify-between")}>
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="text-xs">管</AvatarFallback>
            </Avatar>
            {open && (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">{admin?.displayName}</div>
                <div className="truncate text-xs text-muted-foreground">{admin?.email}</div>
              </div>
            )}
          </div>
          {open && (
            <button
              onClick={logout}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background-tertiary hover:text-destructive transition-colors"
              title="退出登录"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </>
  )
}
