export interface Response<T> {
  data?: T
  isSuccess: boolean
  error?: {
    [key: string]: {
      message: string
    }
  }
}

export type PriceMarkupChangesLog = {
  id: number
  changesGroupId: number
  status: "success" | "failed"
  type: "automation" | "custom"
  numberOfSuccessfullyChangedOffers?: number
  createdAt: string
}
export type ChangesGroup = {
  id: number
  catalogUrls: string[]
  numberOfAllOffers: number
}
export type Automation = {
  id: number
  frequency: string
  startTime: string
  changesGroupId: number
}
export type PriceMarkupGlobalSetting = {
  markupPercentage: number
}
export type CatalogOffer = {
  id: string
  categoryId: string
  quantityInStock: number
  price: number
  oldPrice: number
  name: string
}
export type PriceMarkupOfferSetting = {
  offerId: string
  isApplied: boolean
  newPrice?: number
}
export type CatalogCategory = {
  id: string
  parentId?: string
  name: string
}
export type PriceMarkupCategorySetting = {
  categoryId: string
  isApplied: boolean
  markupPercentage?: number
}
export type OfferChange = {
  offerId: string
  newPrice: number
  oldPrice: number
}
export type OfferChangeResult = {
  offerId: string
  isSuccess: boolean
}
