import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@renderer/shared/ui/components/ui/sidebar"
import {
  Calculator,
  LayoutDashboard,
  Settings,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"

const routes = [
  {
    url: "/",
    icon: <LayoutDashboard />,
    label: "Головна",
    description:
      "Історія виконання автоматизацій, та історія націнок",
  },
  {
    url: "/create-price-markup",
    icon: <Calculator />,
    label: "Націнки",
    description:
      "Створення та налаштування націнок на товари Prom.ua",
  },
  {
    url: "/automations",
    icon: <Zap />,
    label: "Автоматизації",
    description: "Налаштування автоматизацій оновлення цін",
  },
  {
    url: "/settings",
    icon: <Settings />,
    label: "Налаштування",
    description: "Налаштування Prom API та його статус",
  },
]

export function AppSidebar() {
  return (
    <Sidebar className={"w-[200px]"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>Меню</SidebarGroupLabel>
            <SidebarMenu>
              {routes.map((route) => {
                const isActive =
                  location.pathname === route.url
                return (
                  <SidebarMenuItem key={route.url}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={route.url}
                        className={`flex h-auto items-center ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : ""
                        }`}
                      >
                        {route.icon && route.icon}
                        <div
                          className={
                            "flex flex-col items-start"
                          }
                        >
                          <p>{route.label}</p>
                          {route.description && (
                            <p className={"text-xs"}>
                              {route.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
