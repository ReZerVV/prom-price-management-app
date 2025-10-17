import { SidebarProvider } from "@renderer/shared/ui/components/ui/sidebar"
import { Toaster } from "@renderer/shared/ui/components/ui/sonner"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "./AppSidebar"

export function SidebarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="ml-[200px] overflow-y-auto p-2 w-full">
        <Outlet />
      </main>
      <Toaster />
    </SidebarProvider>
  )
}
