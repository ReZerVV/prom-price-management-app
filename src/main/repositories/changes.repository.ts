import {
  ChangesGroup,
  PriceMarkupCategorySetting,
  PriceMarkupChangesLog,
  PriceMarkupGlobalSetting,
  PriceMarkupOfferSetting,
} from "../../types"
import { appendToArray, get, has, set } from "../store"

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  )
}

export function createChangesLog(
  changesGroupId: string,
  status: "success" | "failed",
  type: "automation" | "custom",
  numberOfSuccessfullyChangedOffers?: number,
) {
  if (!has("changes_logs")) {
    set("changes_logs", [])
  }

  const id = generateId()

  appendToArray("changes_logs", {
    id,
    changesGroupId,
    status,
    type,
    numberOfSuccessfullyChangedOffers,
    createdAt: new Date().toISOString(),
  } as PriceMarkupChangesLog)

  return id
}

export function getChangesLogs() {
  if (!has("changes_logs")) {
    set("changes_logs", [])
  }

  return get<PriceMarkupChangesLog[]>("changes_logs")
}

export function createChangesGroup(
  catalogUrls: string[],
  numberOfAllOffers: number,
  globalSettings?: PriceMarkupGlobalSetting,
  categorySettings?: PriceMarkupCategorySetting[],
  offerSettings?: PriceMarkupOfferSetting[],
) {
  if (!has("changes_groups")) {
    set("changes_groups", [])
  }
  const id = generateId()

  appendToArray("changes_groups", {
    id,
    catalogUrls,
    numberOfAllOffers,
    settings: {
      global: globalSettings,
      categories: categorySettings,
      offers: offerSettings,
    },
  } as ChangesGroup)

  return id
}

export function getChangesGroupById(id: string) {
  if (!has("changes_groups")) {
    set("changes_groups", [])
  }

  return get<ChangesGroup[]>("changes_groups").find(
    (changesGroup) => changesGroup.id === id,
  )
}
