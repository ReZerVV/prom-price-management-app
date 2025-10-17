import { FC, useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/ui/card"
import { Button } from "@/shared/ui/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/ui/components/ui/alert"
import { toast } from "sonner"
import {
  getPromApiKey,
  savePromApiKey,
} from "@/pages/settings-page/PromApiKeySettingForm.funcs"
import { motion, AnimatePresence } from "framer-motion"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/shared/ui/components/ui/input-group"
import { Spinner } from "@/shared/ui/components/ui/spinner"
import { usePasteFromClipboard } from "@/shared/ui/hooks/use-paste-from-clipboard"
import {
  StepList,
  StepListItem,
} from "@/pages/settings-page/StepList"
import { SquareChevronRight } from "lucide-react"
import { Separator } from "@/shared/ui/components/ui/separator"

const PromApiKeySettingForm: FC = () => {
  const [promApiKey, setPromApiKey] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(
    null,
  )
  const [debounceTimer, setDebounceTimer] =
    useState<NodeJS.Timeout | null>(null)
  const { getFromClipboard } = usePasteFromClipboard()

  useEffect(() => {
    loadPromApiKey()
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
        const res = await savePromApiKey(promApiKey)
        if (res.isSuccess && res.data.promApiKey) {
          setPromApiKey(res.data.promApiKey)
          setIsValid(res.data.isValid)
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

  const loadPromApiKey = async () => {
    try {
      setIsValid(null)
      const res = await getPromApiKey()
      if (res.isSuccess && res.data.promApiKey) {
        setPromApiKey(res.data.promApiKey)
        setIsValid(res.data.isValid)
      }
    } catch (e) {
      setPromApiKey("")
    }
  }

  const handlePasteClick = async () => {
    const clipboardText = await getFromClipboard()
    if (!clipboardText) {
      toast.error("Буфер обміну порожній або недоступний")
      return
    }
    setPromApiKey(clipboardText)
  }

  return (
    <>
      <Card className={"shadow-none"}>
        <CardHeader>
          <CardTitle className={"font-normal"}>
            Prom API Key
          </CardTitle>
          <CardDescription className={"text-xs"}>
            Введіть ваш Prom API Key для інтеграції з
            сервісом Prom. Це дозволить додатку отримувати
            дані з вашого облікового запису Prom.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InputGroup data-disabled>
            <InputGroupAddon>
              <InputGroupButton
                variant="secondary"
                size="icon-xs"
                onClick={handlePasteClick}
              >
                <SquareChevronRight />
              </InputGroupButton>
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Введіть API токен..."
              onChange={(e) =>
                setPromApiKey(e.target.value)
              }
              value={promApiKey}
            />
            {isLoading && (
              <InputGroupAddon align="inline-end">
                <InputGroupText
                  className={"text-xs font-normal "}
                >
                  Завантаження...
                </InputGroupText>
                <Spinner />
              </InputGroupAddon>
            )}
          </InputGroup>
        </CardContent>
        {isValid !== null && (
          <CardFooter>
            <AnimatePresence mode="wait">
              {isValid ? (
                <motion.div
                  key="valid"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-[#87b37a] bg-[#87b37a]/10">
                    <AlertTitle className="text-sm text-[#87b37a]">
                      Ключ дійсний
                    </AlertTitle>
                    <AlertDescription className="text-xs text-[#87b37a]">
                      Ключ API дійсний і працює коректно. Ви
                      успішно підключили інтеграцію з Prom,
                      і тепер додаток може отримувати та
                      оновлювати дані з вашого облікового
                      запису.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ) : (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="border-[#c95d63] bg-[#c95d63]/10">
                    <AlertTitle className="text-sm text-[#c95d63]">
                      Ключ не дійсний
                    </AlertTitle>
                    <AlertDescription className="text-xs text-[#c95d63]">
                      Не правильний ключ API або відсутній
                      доступ до ресурсів. Будь ласка,
                      перевірте правильність введеного ключа
                      та права доступу, надані цьому ключу.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        )}
        <Separator className={"my-2"} />
        <Card className={"shadow-none border-none"}>
          <CardHeader>
            <CardTitle className={"font-normal"}>
              Як отримати API ключ?
            </CardTitle>
            <CardDescription className={"text-xs"}>
              Покрокова інструкція для отримання API ключа з
              необхідними правами доступу
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StepList
              className={"flex flex-col gap-2 text-xs"}
            >
              <StepListItem number={1}>
                <h3 className={"text-sm"}>
                  Увійдіть в особистий кабінет Prom.ua
                </h3>
                <p className={"text-muted-foreground"}>
                  Перейдіть на сайт my.prom.ua та
                  авторизуйтесь
                </p>
              </StepListItem>
              <StepListItem number={2}>
                <h3 className={"text-sm"}>
                  Перейдіть в розділ "Управління API
                  токенами"
                </h3>
                <p className={"text-muted-foreground"}>
                  Знайдіть розділ API в меню налаштувань
                  аккаунта
                </p>
              </StepListItem>
              <StepListItem number={3}>
                <h3 className={"text-sm"}>
                  Створіть новий API ключ
                </h3>
                <p className={"text-muted-foreground"}>
                  Натисніть "Створити ключ" та вкажіть назву
                  для ідентифікації. Надайте необхідні права
                  доступу для группи "Продукти та группи":
                  "Читання та запис"
                </p>
              </StepListItem>
            </StepList>
          </CardContent>
          <CardFooter>
            <Alert className="border-[#ff9a01] bg-[#ff9a01]/10">
              <AlertTitle className="text-sm text-[#ff9a01]">
                Важливо!
              </AlertTitle>
              <AlertDescription className="text-xs text-[#ff9a01]">
                Переконайтеся, що ви надали необхідні права
                доступу для повноцінної роботи.
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </Card>
    </>
  )
}

export { PromApiKeySettingForm }
