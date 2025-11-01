import { useLocation, Link } from "react-router-dom"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Divider from "@mui/material/Divider"

const routes = [
  {
    url: "/",
    label: "Головна",
    description:
      "Історія виконання автоматизацій, та історія націнок",
  },
  {
    url: "/create-price-markup",
    label: "Націнки",
    description:
      "Створення та налаштування націнок на товари Prom.ua",
  },
  {
    url: "/automations",
    label: "Автоматизації",
    description: "Налаштування автоматизацій оновлення цін",
  },
  {
    url: "/settings",
    label: "Налаштування",
    description: "Налаштування Prom API та його статус",
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <>
      <List sx={{ py: 0 }}>
        {routes.map((route) => {
          const isActive = location.pathname === route.url
          return (
            <ListItemButton
              key={route.url}
              component={Link}
              to={route.url}
              selected={isActive}
              sx={{ alignItems: "flex-start" }}
            >
              <ListItemText
                primary={route.label}
                secondary={route.description}
                primaryTypographyProps={{
                  variant: "body1",
                }}
                secondaryTypographyProps={{
                  variant: "caption",
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
      <Divider />
    </>
  )
}
