import { FC, useEffect, useState } from "react"
import { Automation, ChangesGroup } from "../../../types"
import {
  getAutomations,
  removeAutomation,
} from "@/pages/automations-page/AutomationsPage.funcs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/ui/card"
import { AutomationItem } from "@/pages/automations-page/AutomationItem"
import { Spinner } from "@/shared/ui/components/ui/spinner"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/ui/components/ui/empty"
import { Link } from "react-router-dom"
import { Separator } from "@/shared/ui/components/ui/separator"

const AutomationsPage: FC = () => {
  const [automations, setAutomations] = useState<
    (Automation & { changesGroup: ChangesGroup })[]
  >([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      const res = await getAutomations()
      if (res.isSuccess && res.data) {
        setAutomations(res.data)
      }
      setIsLoading(false)
    })()
  }, [])

  const handleDeleteAutomation = async (id: number) => {
    const res = await removeAutomation(id)
    if (res.isSuccess) {
      setAutomations((prev) =>
        prev.filter((automation) => automation.id !== id),
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={"font-normal"}>
          Автоматизації
        </CardTitle>
        <CardDescription>
          Список автоматизацій оновлення цін.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className={"pt-6 flex flex-col gap-2"}>
        {isLoading ? (
          <div
            className={
              "flex flex-col gap-2 items-center justify-center py-10"
            }
          >
            <Spinner />
            <h3 className={"font-normal text-sm"}>
              Завантаження...
            </h3>
            <p className={"text-xs text-muted-foreground"}>
              Будь ласка, зачекайте, це може зайняти кілька
              секунд.
            </p>
          </div>
        ) : automations.length > 0 ? (
          automations.map((automation, index) => (
            <AutomationItem
              key={index}
              catalogUrls={
                automation.changesGroup.catalogUrls
              }
              frequency={automation.frequency}
              startTime={automation.startTime}
              onDelete={() =>
                handleDeleteAutomation(automation.id)
              }
            />
          ))
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle
                className={"font-normal text-base"}
              >
                Автоматизацій не знайдено
              </EmptyTitle>
              <EmptyDescription className={"text-xs"}>
                На даний момент у вас немає жодної
                автоматизації для оновлення цін.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to={"/create-price-markup"}
                className={"underline"}
              >
                Додати автоматизацію
              </Link>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

export default AutomationsPage
