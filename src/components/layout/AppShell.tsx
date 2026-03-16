import { Outlet } from "react-router-dom"
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "./AdminSidebar"

export function AppShell() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebar />
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          <Outlet />
          <div className="h-6 shrink-0" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
