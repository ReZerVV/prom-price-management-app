import {
  getCachedCatalogCategoriesByCatalogUrls,
  getCachedCatalogOffersByCatalogUrls,
  getCategoryOfferCountRecursive,
  loadCatalogByUrl,
  parseCatalog,
  setCachedCatalog,
} from "../services/catalog.service"
import { CatalogCategory, CatalogOffer, Response } from "../../types"

export interface LoadCatalogsRequest {
  catalogUrls: string[]
}

export interface LoadCatalogsResponse {
  [catalogUrl: string]: {
    numberOfProducts: number
    numberOfCategories: number
  }
}

export async function loadCatalogsHandler(
  _: Electron.IpcMainInvokeEvent,
  req: LoadCatalogsRequest,
): Promise<Response<LoadCatalogsResponse>> {
  const errors: Map<
    string,
    {
      message: string
    }
  > = new Map()

  const data: Map<
    string,
    {
      numberOfProducts: number
      numberOfCategories: number
    }
  > = new Map()

  for (const catalogUrl of req.catalogUrls) {
    try {
      const { categories, offers } = parseCatalog(
        await loadCatalogByUrl(catalogUrl),
      )

      setCachedCatalog(catalogUrl, {
        offers,
        categories: categories.map((category) => ({
          ...category,
          numberOfOffers: getCategoryOfferCountRecursive(
            categories,
            offers,
            category.id,
          ),
        })),
      })
      data.set(catalogUrl, {
        numberOfProducts: offers.length,
        numberOfCategories: categories.length,
      })
    } catch (error) {
      errors.set(catalogUrl, {
        message: error.message,
      })
    }
  }

  return {
    data: Object.fromEntries(data),
    isSuccess: errors.size === 0,
    error: errors.size > 0 ? Object.fromEntries(errors) : undefined,
  }
}

interface GetCatalogCategoriesRequest {
  catalogUrls: string[]
  page?: number
  pageSize?: number
  query?: string
}

export async function getCatalogCategoriesHandler(
  _: Electron.IpcMainInvokeEvent,
  { page = 1, pageSize, query, catalogUrls }: GetCatalogCategoriesRequest,
): Promise<Response<CatalogCategory[]>> {
  try {
    const categories = getCachedCatalogCategoriesByCatalogUrls(
      catalogUrls,
      page,
      pageSize,
      query,
    )
    return {
      isSuccess: true,
      data: categories,
    }
  } catch (error) {
    return {
      isSuccess: false,
      error: {
        general: {
          message: error.message,
        },
      },
    }
  }
}

interface GetCatalogOffersRequest {
  catalogUrls: string[]
  page: number
  pageSize: number
  query?: string
}

export async function getCatalogOffersHandler(
  _: Electron.IpcMainInvokeEvent,
  { page = 1, pageSize, query, catalogUrls }: GetCatalogOffersRequest,
): Promise<Response<CatalogOffer[]>> {
  try {
    const offers = getCachedCatalogOffersByCatalogUrls(
      catalogUrls,
      page,
      pageSize,
      query,
    )
    return {
      isSuccess: true,
      data: offers,
    }
  } catch (error) {
    return {
      isSuccess: false,
      error: {
        general: {
          message: error.message,
        },
      },
    }
  }
}
