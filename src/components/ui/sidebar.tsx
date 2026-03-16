import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue>({ open: true, setOpen: () => {} })

function SidebarProvider({ children, defaultOpen = true }: { children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="flex h-screen w-full overflow-hidden">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function useSidebar() {
  return React.useContext(SidebarContext)
}

function Sidebar({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useSidebar()
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-200",
        open ? "w-[200px]" : "w-[52px]",
        className
      )}
    >
      {children}
    </aside>
  )
}

function SidebarInset({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      {children}
    </div>
  )
}

function SidebarHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex items-center border-b px-3 py-3", className)}>{children}</div>
}

function SidebarContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex-1 overflow-y-auto px-2 py-3", className)}>{children}</div>
}

function SidebarFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border-t px-2 py-2", className)}>{children}</div>
}

function SidebarGroup({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mb-1", className)}>{children}</div>
}

function SidebarGroupLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useSidebar()
  if (!open) return null
  return (
    <div className={cn("text-muted-foreground mb-1 px-2 text-xs font-medium tracking-wide uppercase", className)}>
      {children}
    </div>
  )
}

function SidebarMenu({ className, children }: { className?: string; children: React.ReactNode }) {
  return <ul className={cn("flex flex-col gap-0.5", className)}>{children}</ul>
}

function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>
}

interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  isActive?: boolean
  tooltip?: string
}

function SidebarMenuButton({ className, isActive, children, ...props }: SidebarMenuButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-background-tertiary text-foreground font-medium"
          : "text-foreground-secondary hover:bg-background-tertiary hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
}
