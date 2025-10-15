import React from "react"
import ReactDOM from "react-dom/client"
import SettingsPage from "@/pages/settings-page/SettingsPage"
import { HashRouter, Route, Routes } from "react-router-dom"
import AppLayout from "@/app/AppLayout"
import CreatePriceMarkupPage from "@/pages/create-price-markup-page/CreatePriceMarkupPage"
import DashboardPage from "@/pages/dashboard-page/DashboardPage"
import AutomationsPage from "@/pages/automations-page/AutomationsPage"

const App = () => (
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/automations"
            element={<AutomationsPage />}
          />
          <Route
            path="/create-price-markup"
            element={<CreatePriceMarkupPage />}
          />
          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
)

const root = document.getElementById("root")
if (root) {
  ReactDOM.createRoot(root).render(<App />)
}
