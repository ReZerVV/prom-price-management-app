import {
  ChangesGroup,
  PriceMarkupCategorySetting,
  PriceMarkupChangesLog,
  PriceMarkupGlobalSetting,
  PriceMarkupOfferSetting,
  Response,
} from "../../types"
import {
  clearCachedCatalog,
  getCachedCatalogCategoriesByCatalogUrls,
  getCachedCatalogOffersByCatalogUrls,
} from "../services/catalog.service"
import {
  createChangesFromSettings,
  createChangesGroup,
  createChangesLog,
  getChangesGroupById,
  getChangesLogs,
} from "../services/changes.service"
import { scheduler } from "../services/automations.service"
import { updateProductsPrice } from "../api/prom"

export type RunPriceMarkupSettingsRequest = {
  catalogUrls: string[]
  automation?: {
    frequency: string
    startTime: string
  }
  globalSettings?: PriceMarkupGlobalSetting
  categorySettings?: PriceMarkupCategorySetting[]
  offerSettings?: PriceMarkupOfferSetting[]
}
export async function runPriceMarkupSettingsHandler(
  _: Electron.IpcMainInvokeEvent,
  req: RunPriceMarkupSettingsRequest,
): Promise<Response<null>> {
  const catalogCategories =
    getCachedCatalogCategoriesByCatalogUrls(req.catalogUrls)
  const catalogOffers = getCachedCatalogOffersByCatalogUrls(
    req.catalogUrls,
  )

  const offerChanges = createChangesFromSettings(
    catalogOffers,
    catalogCategories,
    req.globalSettings,
    req.categorySettings,
    req.offerSettings,
  )

  const changesGroupId = createChangesGroup(
    req.catalogUrls,
    catalogOffers.length,
    req.globalSettings,
    req.categorySettings,
    req.offerSettings,
  )

  if (req.automation) {
    await scheduler.addAutomation({
      frequency: req.automation.frequency,
      startTime: req.automation.startTime,
      changesGroupId,
    })
    for (const catalogUrl of req.catalogUrls) {
      clearCachedCatalog(catalogUrl)
    }
    return {
      isSuccess: true,
    }
  } else {
    try {
      const offerChangeResults =
        await updateProductsPrice(offerChanges)
      const numberOfSuccessfullyChangedOffers =
        offerChangeResults.filter(
          (result) => result.isSuccess,
        ).length
      createChangesLog(
        changesGroupId,
        "success",
        "custom",
        numberOfSuccessfullyChangedOffers,
      )
      for (const catalogUrl of req.catalogUrls) {
        clearCachedCatalog(catalogUrl)
      }
      return {
        isSuccess: true,
      }
    } catch (e) {
      createChangesLog(changesGroupId, "failed", "custom")
      return {
        isSuccess: false,
        error: {
          promApi: { message: "Failed to update prices" },
        },
      }
    }
  }
}

export type GetPriceMarkupChangesLogsRequest = {
  page?: number
  perPage?: number
}
export async function getPriceMarkupChangesLogsHandler(
  _: Electron.IpcMainInvokeEvent,
  req: GetPriceMarkupChangesLogsRequest,
): Promise<
  Response<
    (PriceMarkupChangesLog & {
      changesGroup: ChangesGroup
    })[]
  >
> {
  try {
    const data = getChangesLogs(req.page, req.perPage).map(
      (log) => ({
        ...log,
        changesGroup: getChangesGroupById(
          log.changesGroupId,
        ),
      }),
    )
    return {
      isSuccess: true,
      data,
    }
  } catch {
    return {
      isSuccess: false,
    }
  }
}
