import {
  CatalogCategory,
  CatalogOffer,
  Response,
} from "../../../types"
import { LoadCatalogsResponse } from "../../../main/requests/catalog.requests"
import { RunPriceMarkupSettingsRequest } from "../../../main/requests/changes.requests"

export async function loadCatalogs(
  catalogUrls: string[],
): Promise<Response<LoadCatalogsResponse>> {
  return (window as any).api.loadCatalogs(catalogUrls)
}

export async function searchCategories(
  catalogUrls: string[],
  query: string,
): Promise<Response<CatalogCategory[]>> {
  return (window as any).api.getCatalogCategories({
    catalogUrls,
    query,
    pageSize: 10,
  })
}

export async function searchOffers(
  catalogUrls: string[],
  query: string,
): Promise<Response<CatalogOffer[]>> {
  return (window as any).api.getCatalogOffers({
    catalogUrls,
    query,
    pageSize: 10,
  })
}

export async function runPriceMarkupSettings(
  req: RunPriceMarkupSettingsRequest,
): Promise<Response<null>> {
  return (window as any).api.runPriceMarkupSettings(req)
}
