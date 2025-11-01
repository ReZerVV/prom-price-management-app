import { FC } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material"
import { PromApiKeySettingForm } from "@/pages/settings-page/PromApiKeySettingForm"

const SettingsPage: FC = () => {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={400}>
            Налаштування
          </Typography>
        }
        subheader={
          <Typography variant="caption">
            Налаштування Prom API та його статус.
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <PromApiKeySettingForm />
      </CardContent>
    </Card>
  )
}

export default SettingsPage
