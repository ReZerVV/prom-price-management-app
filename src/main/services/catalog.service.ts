import { CatalogCategory, CatalogOffer } from "../../types"
import { XMLParser } from "fast-xml-parser"
import { axiosInstance } from "../axios"

const globalCatalogCache: Map<
  string,
  {
    categories: CatalogCategory[]
    offers: CatalogOffer[]
  }
> = new Map()

export function setCachedCatalog(
  catalogUrl: string,
  catalogData: {
    categories: CatalogCategory[]
    offers: CatalogOffer[]
  },
): void {
  globalCatalogCache.set(catalogUrl, catalogData)
}

export function getCachedCatalog(catalogUrl: string): {
  categories: CatalogCategory[]
  offers: CatalogOffer[]
} | null {
  return globalCatalogCache.get(catalogUrl) || null
}

export function clearCachedCatalog(
  catalogUrl: string,
): void {
  globalCatalogCache.delete(catalogUrl)
}

export function clearAllCachedCatalogs(): void {
  globalCatalogCache.clear()
}

export function getCachedCatalogOffersByCatalogUrls(
  catalogUrls: string[],
  page = 1,
  pageSize?: number,
  query?: string,
): CatalogOffer[] {
  let allOffers: CatalogOffer[] = []

  for (const catalogUrl of catalogUrls) {
    const cachedCatalog = getCachedCatalog(catalogUrl)
    if (cachedCatalog) {
      allOffers.push(...cachedCatalog.offers)
    }
  }

  if (query) {
    const lowerQuery = query.toLowerCase()
    allOffers = allOffers.filter((offer) =>
      offer.name.toLowerCase().includes(lowerQuery),
    )
  }

  const startIndex = (page - 1) * pageSize
  const endIndex =
    pageSize !== undefined
      ? startIndex + pageSize
      : undefined
  return allOffers.slice(startIndex, endIndex)
}

export function getCachedCatalogCategoriesByCatalogUrls(
  catalogUrls: string[],
  page: number = 1,
  pageSize?: number,
  query?: string,
): CatalogCategory[] {
  let allCategories: CatalogCategory[] = []

  for (const catalogUrl of catalogUrls) {
    const cachedCatalog = getCachedCatalog(catalogUrl)
    if (cachedCatalog) {
      allCategories.push(...cachedCatalog.categories)
    } else {
      throw new Error(
        `Каталог за URL ${catalogUrl} не завантажений`,
      )
    }
  }

  if (query) {
    const lowerQuery = query.toLowerCase()
    allCategories = allCategories.filter(
      (cat) =>
        cat.name.toLowerCase().startsWith(lowerQuery) ||
        cat.id.toLowerCase().startsWith(lowerQuery),
    )
  }

  const startIndex = (page - 1) * pageSize
  const endIndex =
    pageSize !== undefined
      ? startIndex + pageSize
      : undefined
  return allCategories.slice(startIndex, endIndex)
}

export function parseCatalog(catalogXml: string): {
  categories: CatalogCategory[]
  offers: CatalogOffer[]
} {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: false,
    textNodeName: "text",
    cdataPropName: "cdata",
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      return [
        "categories.category",
        "offers.offer",
        "offer.picture",
        "offer.param",
      ].includes(jpath)
    },
  })

  const json = parser.parse(catalogXml)
  const shop = json?.yml_catalog?.shop
  if (!shop) {
    throw new Error("Некоректний формат каталогу")
  }

  const categoriesRaw = shop.categories?.category || []
  const categories: CatalogCategory[] = categoriesRaw.map(
    (cat: any) => ({
      id: String(cat.id),
      parentId: cat.parentId ? String(cat.parentId) : "",
      name: cat.text || "",
      numberOfOffers: 0,
    }),
  )

  const offersRaw = shop.offers?.offer || []
  const offers: CatalogOffer[] = offersRaw.map(
    (offer: any) => ({
      id: String(offer.id),
      categoryId: String(offer.categoryId),
      quantityInStock: Number(offer.quantity_in_stock ?? 0),
      price: Number(offer.price ?? 0),
      oldPrice: Number(offer.oldprice ?? 0),
      name:
        offer.name?.cdata?.trim() ||
        offer.name?.text?.trim() ||
        "",
    }),
  )

  return { categories, offers }
}

export async function loadCatalogByUrl(
  catalogUrl: string,
): Promise<string> {
  try {
    const response = await axiosInstance.get(catalogUrl, {
      responseType: "text",
      headers: {
        Accept: "application/xml, text/xml, */*;q=0.9",
      },
    })
    return response.data
  } catch (error) {
    throw new Error(
      `Не вдалося завантажити каталог за URL: ${catalogUrl}`,
    )
  }
}

export function getCategoryOfferCountRecursive(
  categories: CatalogCategory[],
  offers: CatalogOffer[],
  categoryId: string,
): number {
  const childCategories = categories.filter(
    (cat) => cat.parentId === categoryId,
  )
  const countInCurrent = offers.filter(
    (offer) => offer.categoryId === categoryId,
  ).length
  const countInChildren = childCategories.reduce(
    (sum, child) =>
      sum +
      getCategoryOfferCountRecursive(
        categories,
        offers,
        child.id,
      ),
    0,
  )
  return countInCurrent + countInChildren
}
