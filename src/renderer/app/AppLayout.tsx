import { AppSidebar } from "@/widgets/app-sidebar/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import React from "react"
import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({}) {
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
