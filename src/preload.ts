// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron"
import {
  GetPriceMarkupChangesLogsRequest,
  RunPriceMarkupSettingsRequest,
} from "./main/requests/changes.requests"
import {
  GetAutomationsRequest,
  RemoveAutomationsRequest,
} from "./main/requests/automations.requests"

contextBridge.exposeInMainWorld("api", {
  setPromApiKey: (params: { promApiKey: string }) =>
    ipcRenderer.invoke("save-prom-api-key", params),

  getPromApiKey: () =>
    ipcRenderer.invoke("get-prom-api-key"),

  loadCatalogs: (catalogUrls: string[]) =>
    ipcRenderer.invoke("load-catalogs", { catalogUrls }),

  getCatalogCategories: (params: {
    catalogUrls: string[]
    page: number
    pageSize: number
    query?: string
  }) =>
    ipcRenderer.invoke("get-catalog-categories", params),

  getCatalogOffers: (params: {
    catalogUrls: string[]
    page: number
    pageSize: number
    query?: string
  }) => ipcRenderer.invoke("get-catalog-offers", params),

  runPriceMarkupSettings: (
    params: RunPriceMarkupSettingsRequest,
  ) =>
    ipcRenderer.invoke("run-price-markup-settings", params),

  listAutomations: () =>
    ipcRenderer.invoke("list-automations"),

  removeAutomation: (params: RemoveAutomationsRequest) =>
    ipcRenderer.invoke("remove-automation", params),

  getLogs: (params: GetPriceMarkupChangesLogsRequest) =>
    ipcRenderer.invoke("get-logs", params),
})
