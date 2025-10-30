import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@renderer/shared/ui/components/ui/form"
import { useForm } from "react-hook-form"
import {
  setApiKeyFormSchema,
  SetApiKeyFormType,
} from "../types/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useGetApiKeyQuery } from "../ipc/get-api-key"
import { useEffect } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@renderer/shared/ui/components/ui/input-group"
import {
  Field,
  FieldLabel,
} from "@renderer/shared/ui/components/ui/field"
import { usePasteFromClipboard } from "../hooks/use-paste-from-clipboard"
import { ClipboardPaste } from "lucide-react"

export function SetApiKeyForm() {
  const getApiKeyQuery = useGetApiKeyQuery()
  const { getFromClipboard } = usePasteFromClipboard()

  const setApiKeyForm = useForm<SetApiKeyFormType>({
    resolver: zodResolver(setApiKeyFormSchema),
    defaultValues: {
      apiKey: "",
    },
  })

  useEffect(() => {
    if (getApiKeyQuery.isSuccess) {
      setApiKeyForm.setValue("apiKey", getApiKeyQuery.data)
    }
  }, [getApiKeyQuery.isSuccess])

  const handlePasteClickboardClick = async () => {
    setApiKeyForm.setValue(
      "apiKey",
      await getFromClipboard(),
    )
  }

  return (
    <Form {...setApiKeyForm}>
      <form>
        <FormField
          control={setApiKeyForm.control}
          name="apiKey"
          render={({ field }) => (
            <Field>
              <FieldLabel>
                API ключ доступу до маркетплейсу Prom.ua
              </FieldLabel>
              <InputGroup>
                <FormControl>
                  <InputGroupInput />
                </FormControl>
                {getApiKeyQuery.isLoading && (
                  <InputGroupAddon align="inline-end">
                    <span>Завантаження...</span>
                  </InputGroupAddon>
                )}
                <InputGroupButton
                  type="button"
                  onClick={handlePasteClickboardClick}
                >
                  <ClipboardPaste />
                </InputGroupButton>
              </InputGroup>
              <FormMessage />
            </Field>
          )}
        />
      </form>
    </Form>
  )
}
