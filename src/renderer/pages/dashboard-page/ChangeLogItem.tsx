import { FC } from "react"
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
} from "@mui/material"
import { Hand, Zap } from "lucide-react"

export interface ChangeLogItemProps {
  catalogUrls: string[]
  type: "automation" | "custom"
  status: "success" | "failed"
  createdAt: string
  numberOfSuccessfullyChangedOffers: number
}
const ChangeLogItem: FC<ChangeLogItemProps> = ({
  catalogUrls,
  type,
  status,
  createdAt,
  numberOfSuccessfullyChangedOffers,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor:
          status === "failed" ? "#c95d63" : "#87b37a",
        bgcolor:
          status === "failed"
            ? "rgba(201,93,99,0.1)"
            : "rgba(135,179,122,0.1)",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {type === "automation" ? (
              <Zap
                size={16}
                color={
                  status === "failed"
                    ? "#c95d63"
                    : "#87b37a"
                }
              />
            ) : (
              <Hand
                size={16}
                color={
                  status === "failed"
                    ? "#c95d63"
                    : "#87b37a"
                }
              />
            )}
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              {new Date(createdAt).toLocaleString()}
            </Typography>
            {catalogUrls.map((catalogUrl, index) => (
              <Typography key={index} variant="body2">
                {catalogUrl}
              </Typography>
            ))}
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Оновлено товарів:{" "}
              {numberOfSuccessfullyChangedOffers} шт.
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export { ChangeLogItem }
