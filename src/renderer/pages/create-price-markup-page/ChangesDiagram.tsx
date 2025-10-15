import { FC } from "react"

function getPercent(part: number, total: number): number {
  return (part / total) * 100
}

interface ChangesDiagramProps {
  hasGlobalChanges: boolean
  totalNumberOfProducts: number
  hasCategoryChanges: boolean
  productsNumberOfCategories: number
  hasOfferChanges: boolean
  productsNumberOfOffers: number
}
const ChangesDiagram: FC<ChangesDiagramProps> = ({
  hasGlobalChanges,
  totalNumberOfProducts,
  hasCategoryChanges,
  productsNumberOfCategories,
  hasOfferChanges,
  productsNumberOfOffers,
}) => {
  return (
    <div className={"flex flex-col"}>
      <div className={"relative w-full p-2"}>
        {hasGlobalChanges ? (
          <>
            <div
              className={`absolute top-0 left-0 w-full h-full bg-[#87b37a]/50`}
            />
            <p className={"text-sm text-[#87b37a]"}>Глобальні зміни</p>
          </>
        ) : (
          <>
            <div
              className={`absolute top-0 left-0 w-full h-full bg-accent/50`}
            />
            <p className={"text-muted-foreground text-sm"}>
              Глобальні зміни відсутні
            </p>
          </>
        )}
      </div>
      <div className={"relative w-full p-2"}>
        {hasCategoryChanges ? (
          <>
            <div
              className={`absolute top-0 left-0 h-full bg-[#ffd159]/50`}
              style={{
                width: `${getPercent(productsNumberOfCategories, totalNumberOfProducts)}%`,
              }}
            />
            <p className={"text-sm text-[#ffd159]"}>Зміни за категоріями</p>
          </>
        ) : (
          <>
            <div
              className={`absolute top-0 left-0 w-full h-full bg-accent/50`}
            />
            <p className={"text-muted-foreground text-sm"}>
              Зміни за категоріями відсутні
            </p>
          </>
        )}
      </div>
      <div className={"relative w-full p-2"}>
        {hasOfferChanges ? (
          <>
            <div
              className={`absolute top-0 left-0 h-full bg-[#c95d63]/50`}
              style={{
                width: `${getPercent(productsNumberOfOffers, totalNumberOfProducts)}%`,
              }}
            />
            <p className={"text-sm text-[#c95d63]"}>Зміни за товарами</p>
          </>
        ) : (
          <>
            <div
              className={`absolute top-0 left-0 w-full h-full bg-accent/50`}
            />
            <p className={"text-muted-foreground text-sm"}>
              Зміни за товарами відсутні
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export { ChangesDiagram }
