import { FC, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/ui/card"
import {
  ChangesGroup,
  PriceMarkupChangesLog,
} from "../../../types"
import { getLogs } from "@/pages/dashboard-page/DashboardPage.funcs"
import { Spinner } from "@/shared/ui/components/ui/spinner"
import { AutomationItem } from "@/pages/automations-page/AutomationItem"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/components/ui/empty"
import { Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { ChangeLogItem } from "@/pages/dashboard-page/ChangeLogItem"
import { Separator } from "@/shared/ui/components/ui/separator"

const DashboardPage: FC = () => {
  const [logs, setLogs] = useState<
    (PriceMarkupChangesLog & {
      changesGroup: ChangesGroup
    })[]
  >([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      const res = await getLogs()
      if (res.isSuccess && res.data) {
        setLogs(res.data)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className={"font-normal"}>
            Історія
          </CardTitle>
          <CardDescription className={"text-xs"}>
            Історія ваших дій буде відображатися тут.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className={"flex flex-col gap-2 pt-6"}>
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
              <p
                className={"text-xs text-muted-foreground"}
              >
                Будь ласка, зачекайте, це може зайняти
                кілька секунд.
              </p>
            </div>
          ) : logs.length > 0 ? (
            logs.map((log, index) => (
              <ChangeLogItem
                key={index}
                catalogUrls={log.changesGroup.catalogUrls}
                createdAt={log.createdAt}
                numberOfSuccessfullyChangedOffers={
                  log.numberOfSuccessfullyChangedOffers
                }
                status={log.status}
                type={log.type}
              />
            ))
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle
                  className={"font-normal text-base"}
                >
                  Логів не знайдено
                </EmptyTitle>
                <EmptyDescription className={"text-xs"}>
                  На даний момент не було виконано жодної
                  операції.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link
                  to={"/create-price-markup"}
                  className={"underline"}
                >
                  Додати операцію
                </Link>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
