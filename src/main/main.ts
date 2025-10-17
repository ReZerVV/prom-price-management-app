import { app, BrowserWindow, ipcMain } from "electron"
import path from "node:path"
import url from "node:url"
import started from "electron-squirrel-startup"
import {
  getPromApiKeyHandler,
  savePromApiKeyHandler,
} from "./requests/prom-api-key.requests"
import {
  getCatalogCategoriesHandler,
  getCatalogOffersHandler,
  loadCatalogsHandler,
} from "./requests/catalog.requests"
import {
  getPriceMarkupChangesLogsHandler,
  runPriceMarkupSettingsHandler,
} from "./requests/changes.requests"
import { scheduler } from "./services/automations.service"
import {
  getAutomationsHandler,
  removeAutomationHandler,
} from "./requests/automations.requests"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/index.html`),
    )
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  await scheduler.loadAutomations()
  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("save-prom-api-key", savePromApiKeyHandler)
ipcMain.handle("get-prom-api-key", getPromApiKeyHandler)
ipcMain.handle("load-catalogs", loadCatalogsHandler)
ipcMain.handle(
  "get-catalog-categories",
  getCatalogCategoriesHandler,
)
ipcMain.handle(
  "get-catalog-offers",
  getCatalogOffersHandler,
)
ipcMain.handle(
  "run-price-markup-settings",
  runPriceMarkupSettingsHandler,
)
ipcMain.handle("list-automations", getAutomationsHandler)
ipcMain.handle("remove-automation", removeAutomationHandler)
ipcMain.handle("get-logs", getPriceMarkupChangesLogsHandler)
