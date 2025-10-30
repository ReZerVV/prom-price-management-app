import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router-dom"
import { SidebarLayout } from "@renderer/widgets/AppSidebar"
import SettingsPage from "@renderer/pages/SettingsPage"
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

const queryClient = new QueryClient()

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<SidebarLayout />}>
            <Route
              path="/settings"
              element={<SettingsPage />}
            />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
)

const root = document.getElementById("root")
if (root) {
  ReactDOM.createRoot(root).render(<App />)
}
