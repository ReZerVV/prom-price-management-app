import React, { FC } from "react"
import {
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Stack,
} from "@mui/material"
import { Delete } from "lucide-react"

function getTextFromFrequency(frequency: string) {
  switch (frequency) {
    case "daily":
      return "Щоденно"
    default:
      throw new Error("Unknown frequency")
  }
}

interface AutomationItemProps {
  catalogUrls: string[]
  frequency: string
  startTime: string
  onDelete: () => void
}
const AutomationItem: FC<AutomationItemProps> = ({
  catalogUrls,
  frequency,
  startTime,
  onDelete,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <CardContent>
        <Stack spacing={0.5}>
          {catalogUrls.map(
            (catalogUrl: string, index: number) => (
              <Typography key={index} variant="body2">
                {catalogUrl}
              </Typography>
            ),
          )}
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {getTextFromFrequency(frequency)} о {startTime}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions>
        <IconButton size="small" onClick={onDelete}>
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  )
}

export { AutomationItem }
