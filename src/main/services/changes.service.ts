import {
  CatalogCategory,
  CatalogOffer,
  OfferChange,
  PriceMarkupGlobalSetting,
  PriceMarkupCategorySetting,
  PriceMarkupOfferSetting,
} from "../../types"
import * as changesRepository from "../repositories/changes.repository"

function getCategorySettingByCategoryId(
  categoryId: string,
  categories: CatalogCategory[],
  categorySettings: PriceMarkupCategorySetting[],
): PriceMarkupCategorySetting {
  const categorySetting = categorySettings.find(
    (s) => s.categoryId === categoryId,
  )

  if (categorySetting) {
    return categorySetting
  }

  const category = categories.find(
    (c) => c.id === categoryId,
  )

  if (category.parentId) {
    return getCategorySettingByCategoryId(
      category.parentId,
      categories,
      categorySettings,
    )
  } else {
    return null
  }
}

export function createChangesFromSettings(
  offers: CatalogOffer[],
  categories: CatalogCategory[],
  globalSettings?: PriceMarkupGlobalSetting,
  categorySettings?: PriceMarkupCategorySetting[],
  offerSettings?: PriceMarkupOfferSetting[],
): OfferChange[] {
  const offerChanges: OfferChange[] = []

  for (const offer of offers) {
    if (offerSettings && offerSettings.length > 0) {
      const offerSetting = offerSettings.find(
        (s) => s.offerId === offer.id,
      )
      if (offerSetting) {
        if (offerSetting.isApplied) {
          offerChanges.push({
            offerId: offer.id,
            newPrice: offerSetting.newPrice!,
            oldPrice:
              offer.oldPrice !== 0
                ? offerSetting.newPrice +
                  (offer.oldPrice - offer.price)
                : null,
          })
        }
        continue
      }
    }

    if (categorySettings && categorySettings.length > 0) {
      const categorySetting =
        getCategorySettingByCategoryId(
          offer.categoryId,
          categories,
          categorySettings,
        )

      if (categorySetting) {
        if (categorySetting.isApplied) {
          const newPrice = Math.round(
            offer.price *
              (1 + categorySetting.markupPercentage! / 100),
          )
          offerChanges.push({
            offerId: offer.id,
            newPrice,
            oldPrice:
              offer.oldPrice !== 0
                ? newPrice + (offer.oldPrice - offer.price)
                : null,
          })
        }
        continue
      }
    }

    if (globalSettings) {
      const newPrice = Math.round(
        offer.price *
          (1 + globalSettings.markupPercentage! / 100),
      )
      offerChanges.push({
        offerId: offer.id,
        newPrice,
        oldPrice:
          offer.oldPrice !== 0
            ? newPrice + (offer.oldPrice - offer.price)
            : null,
      })
    }
  }

  return offerChanges
}

export function getAllChangesFromGroup(
  changesGroupId: string,
) {
  return changesRepository.getChangesGroupById(
    changesGroupId,
  ).changes
}

export function createChangesLog(
  changesGroupId: string,
  status: "success" | "failed",
  type: "automation" | "custom",
  numberOfSuccessfullyChangedOffers?: number,
) {
  return changesRepository.createChangesLog(
    changesGroupId,
    status,
    type,
    numberOfSuccessfullyChangedOffers,
  )
}

export function createChangesGroup(
  catalogUrls: string[],
  numberOfAllOffers: number,
  offerChanges: OfferChange[],
) {
  return changesRepository.createChangesGroup(
    catalogUrls,
    numberOfAllOffers,
    offerChanges,
  )
}

export function getChangesLogs(page = 1, perPage = 10) {
  return changesRepository
    .getChangesLogs()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(
      (page - 1) * perPage,
      (page - 1) * perPage + perPage,
    )
}

export function getChangesGroupById(id: string) {
  return changesRepository.getChangesGroupById(id)
}
