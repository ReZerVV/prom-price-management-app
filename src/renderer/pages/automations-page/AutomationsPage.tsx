import { FC, useEffect, useState } from "react"
import { Automation, ChangesGroup } from "../../../types"
import {
  getAutomations,
  removeAutomation,
} from "@/pages/automations-page/AutomationsPage.funcs"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { AutomationItem } from "@/pages/automations-page/AutomationItem"
import { Link } from "react-router-dom"

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
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={400}>
            Автоматизації
          </Typography>
        }
        subheader={
          <Typography variant="caption">
            Список автоматизацій оновлення цін.
          </Typography>
        }
      />
      <CardContent className={"pt-6 flex flex-col gap-2"}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              alignItems: "center",
              justifyContent: "center",
              py: 3,
            }}
          >
            <CircularProgress size={20} />
            <Typography variant="body2" fontWeight={400}>
              Завантаження...
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
            >
              Будь ласка, зачекайте, це може зайняти кілька
              секунд.
            </Typography>
          </Box>
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
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body1" fontWeight={400}>
              Автоматизацій не знайдено
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              На даний момент у вас немає жодної
              автоматизації для оновлення цін.
            </Typography>
            <Link
              to={"/create-price-markup"}
              style={{ textDecoration: "underline" }}
            >
              Додати автоматизацію
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default AutomationsPage
