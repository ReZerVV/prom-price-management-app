import { axiosInstanceForPromAPI } from "../../axios"
import {
  OfferChange,
  OfferChangeResult,
} from "../../../types"

export async function getAnyoneProductForCheck() {
  return await axiosInstanceForPromAPI.get(
    "products/list",
    {
      params: {
        limit: 1,
      },
    },
  )
}

function chunkArray<T>(array: T[], size: number): T[][] {
  if (size <= 0) throw new Error("Invalid chunk size")
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export async function updateProductsPrice(
  changes: OfferChange[],
): Promise<OfferChangeResult[]> {
  const results: OfferChangeResult[] = []
  for (const changesChunk of chunkArray(changes, 100)) {
    const res = await axiosInstanceForPromAPI.post(
      "products/edit_by_external_id",
      changesChunk.map((change) => ({
        id: change.offerId,
        presence: "available",
        price: change.newPrice,
        oldprice: change.oldPrice,
      })),
    )

    if (res.status !== 200) {
      throw new Error("Failed to update products")
    }

    if (res.data.errors) {
      console.log(
        Object.entries(res.data.errors).map(
          ([key, value]) => ({
            offerId: key,
            newPrice: changesChunk.find(
              (c) => c.offerId === key,
            )?.newPrice!,
            oldPrice: changesChunk.find(
              (c) => c.offerId === key,
            )?.oldPrice!,
            error: value,
          }),
        ),
      )
      for (const change of changesChunk) {
        results.push({
          offerId: change.offerId,
          isSuccess: !res.data.errors.hasOwnProperty(
            change.offerId,
          ),
        })
      }
    }
  }

  return results
}
