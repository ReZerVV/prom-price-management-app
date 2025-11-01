import { Outlet } from "react-router-dom"
import MuiThemeProvider from "@/app/mui-theme"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import { AppSidebar } from "@/widgets/app-sidebar/AppSidebar"

export default function AppLayout({}) {
  const drawerWidth = 240

  return (
    <MuiThemeProvider>
      <Box sx={{ display: "flex" }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Box sx={{ overflow: "auto" }}>
            <AppSidebar />
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </MuiThemeProvider>
  )
}
