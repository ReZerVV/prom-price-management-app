import React, { FC, useEffect, useState } from "react"
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  CardFooter,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
} from "@mui/material"
import ContentPasteRoundedIcon from "@mui/icons-material/ContentPasteRounded"
import {
  getPromApiKey,
  savePromApiKey,
} from "@/pages/settings-page/PromApiKeySettingForm.funcs"
import { usePasteFromClipboard } from "@/hooks/use-paste-from-clipboard"

const PromApiKeySettingForm: FC = () => {
  const [promApiKey, setPromApiKey] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isValid, setIsValid] = useState<boolean | null>(
    null,
  )
  const [debounceTimer, setDebounceTimer] =
    useState<ReturnType<typeof setTimeout> | null>(null)
  const [feedback, setFeedback] = useState<string | null>(
    null,
  )

  const { getFromClipboard } = usePasteFromClipboard()

  useEffect(() => {
    ;(async () => {
      try {
        setIsValid(null)
        const res: any = await getPromApiKey()
        if (res?.isSuccess && res?.data?.promApiKey) {
          setPromApiKey(res.data.promApiKey)
          setIsValid(Boolean(res.data.isValid))
        }
      } catch {
        setPromApiKey("")
      }
    })()
  }, [])

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer)

    if (promApiKey.length === 0) {
      setIsValid(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res: any = await savePromApiKey(promApiKey)
        if (res?.isSuccess && res?.data?.promApiKey) {
          setPromApiKey(res.data.promApiKey)
          setIsValid(Boolean(res.data.isValid))
        } else {
          setIsValid(false)
        }
      } catch {
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    setDebounceTimer(timer)
  }, [promApiKey])

  const handlePasteClick = async () => {
    const clipboardText = await getFromClipboard()
    if (!clipboardText) {
      setFeedback("Буфер обміну порожній або недоступний")
      setTimeout(() => setFeedback(null), 2500)
      return
    }
    setPromApiKey(clipboardText)
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight={400}>
          Prom API Key
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Введіть ваш Prom API Key для інтеграції з сервісом
          Prom. Це дозволить додатку отримувати дані з
          вашого облікового запису Prom.
        </Typography>
        <TextField
          placeholder="Введіть API токен..."
          fullWidth
          size="small"
          value={promApiKey}
          onChange={(e) => setPromApiKey(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  aria-label="Вставити з буфера обміну"
                  size={"small"}
                  onClick={handlePasteClick}
                  edge="start"
                >
                  <ContentPasteRoundedIcon />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: isLoading ? (
              <InputAdornment position="end">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    pr: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Завантаження...
                  </Typography>
                  <CircularProgress size={16} />
                </Box>
              </InputAdornment>
            ) : undefined,
          }}
        />
        {isValid ? (
          <Alert severity="success" variant="outlined">
            <AlertTitle
              className="text-sm"
              color="success.main"
            >
              Ключ дійсний
            </AlertTitle>
            <Typography
              variant="caption"
              color="success.main"
            >
              Ключ API дійсний і працює коректно. Ви успішно
              підключили інтеграцію з Prom, і тепер додаток
              може отримувати та оновлювати дані з вашого
              облікового запису.
            </Typography>
          </Alert>
        ) : (
          <Alert severity="error" variant="outlined">
            <AlertTitle
              className="text-sm"
              color="error.main"
            >
              Ключ не дійсний
            </AlertTitle>
            <Typography
              variant="caption"
              color="error.main"
            >
              Неправильний ключ API або відсутній доступ до
              ресурсів. Будь ласка, перевірте правильність
              введеного ключа та права доступу, надані цьому
              ключу.
            </Typography>
          </Alert>
        )}
        {feedback && (
          <Alert severity="warning" variant="outlined">
            <Typography variant="caption">
              {feedback}
            </Typography>
          </Alert>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: "0 0 0 20px",
        }}
      >
        <Typography variant="h6" fontWeight={400}>
          Як отримати API ключ?
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Покрокова інструкція для отримання API ключа з
          необхідними правами доступу
        </Typography>
        <List
          dense
          sx={{
            "& .MuiListItem-root": {
              alignItems: "flex-start",
            },
          }}
        >
          <ListItem>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                1
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  Увійдіть в особистий кабінет Prom.ua
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Перейдіть на сайт my.prom.ua та
                  авторизуйтесь
                </Typography>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                2
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  Перейдіть в розділ "Управління API
                  токенами"
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Знайдіть розділ API в меню налаштувань
                  аккаунта
                </Typography>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                3
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2">
                  Створіть новий API ключ
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Натисніть "Створити ключ" та вкажіть назву
                  для ідентифікації. Надайте необхідні права
                  доступу для групи "Продукти та групи":
                  "Читання та запис".
                </Typography>
              }
            />
          </ListItem>
        </List>
        <Alert severity="warning" variant="outlined">
          <AlertTitle
            className="text-sm"
            color="warning.main"
          >
            Важливо!
          </AlertTitle>
          <Typography
            variant="caption"
            color="warning.main"
          >
            Переконайтеся, що ви надали необхідні права
            доступу для повноцінної роботи.
          </Typography>
        </Alert>
      </Box>
    </Box>
  )
}

export { PromApiKeySettingForm }
