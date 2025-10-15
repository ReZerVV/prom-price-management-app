import {
  CatalogCategory,
  CatalogOffer,
  OfferChange,
  PriceMarkupGlobalSetting,
  PriceMarkupCategorySetting,
  PriceMarkupOfferSetting,
} from "../../types"
import {
  priceMarkupChanges,
  priceMarkupChangesGroups,
  priceMarkupChangesLogs,
} from "../db/schema"
import { getDB } from "../db"
import { desc, eq } from "drizzle-orm"

export async function getChangesGroupById(
  changesGroupId: number,
) {
  return getDB()
    .select()
    .from(priceMarkupChangesGroups)
    .where(eq(priceMarkupChangesGroups.id, changesGroupId))
    .limit(1)
    .then((res) => res[0])
}

function getCategorySettingByCategoryId(
  categoryId: string,
  categories: CatalogCategory[],
  categorySettings: PriceMarkupCategorySetting[],
): PriceMarkupCategorySetting {
  const categorySetting = categorySettings.find(
    (s) => s.categoryId.toString() === categoryId,
  )

  if (categorySetting) {
    return categorySetting
  }

  const category = categories.find(
    (c) => c.id.toString() === categoryId,
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
      if (
        newPrice >=
        newPrice + (offer.oldPrice - offer.price)
      ) {
        console.log({
          newPrice,
          offerPrice: offer.price,
          markup: globalSettings.markupPercentage,
          oldPrice: offer.oldPrice,
          newOldPrice:
            offer.oldPrice !== 0
              ? newPrice + (offer.oldPrice - offer.price)
              : null,
        })
      }
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

export async function getAllChangesFromGroup(
  changesGroupId: number,
) {
  return getDB()
    .select()
    .from(priceMarkupChanges)
    .where(
      eq(priceMarkupChanges.changesGroupId, changesGroupId),
    )
}

export function createChangesLog(
  changesGroupId: number,
  status: "success" | "failed",
  type: "automation" | "custom",
  numberOfSuccessfullyChangedOffers?: number,
) {
  return getDB().insert(priceMarkupChangesLogs).values({
    changesGroupId,
    status,
    type,
    numberOfSuccessfullyChangedOffers,
    createdAt: new Date().toISOString(),
  })
}

export async function createChangesGroup(
  catalogUrls: string[],
  numberOfAllOffers: number,
  offerChanges: OfferChange[],
) {
  const [{ changesGroupId }] = await getDB()
    .insert(priceMarkupChangesGroups)
    .values({
      catalogUrls,
      numberOfAllOffers,
    })
    .returning({
      changesGroupId: priceMarkupChangesGroups.id,
    })

  await getDB()
    .insert(priceMarkupChanges)
    .values(
      offerChanges.map((offerChange) => ({
        ...offerChange,
        changesGroupId,
      })),
    )

  return changesGroupId
}

export async function getChangesLogs(
  page = 1,
  perPage = 10,
) {
  return getDB()
    .select()
    .from(priceMarkupChangesLogs)
    .orderBy(desc(priceMarkupChangesLogs.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage)
}
