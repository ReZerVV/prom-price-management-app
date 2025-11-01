import React, { FC, useEffect, useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Divider from "@mui/material/Divider"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { Link } from "react-router-dom"
import {
  ChangesGroup,
  PriceMarkupChangesLog,
} from "../../../types"
import { getLogs } from "@/pages/dashboard-page/DashboardPage.funcs"
import { ChangeLogItem } from "@/pages/dashboard-page/ChangeLogItem"

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
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={400}>
            Історія
          </Typography>
        }
        subheader={
          <Typography variant="caption">
            Історія ваших дій буде відображатися тут.
          </Typography>
        }
      />
      <Divider />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
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
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body1" fontWeight={400}>
              Логів не знайдено
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              На даний момент не було виконано жодної
              операції.
            </Typography>
            <Link
              to={"/create-price-markup"}
              style={{ textDecoration: "underline" }}
            >
              Додати операцію
            </Link>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default DashboardPage
