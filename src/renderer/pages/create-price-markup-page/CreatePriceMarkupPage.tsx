import { FC } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material"
import { CreatePriceMarkupForm } from "@/pages/create-price-markup-page/CreatePriceMarkupForm"

const CreatePriceMarkupPage: FC = () => {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={400}>
            Налаштування націнки
          </Typography>
        }
        subheader={
          <Typography variant="caption">
            Вкажіть джерела, параметри автоматизації та
            правила націнки.
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <CreatePriceMarkupForm />
      </CardContent>
    </Card>
  )
}

export default CreatePriceMarkupPage
