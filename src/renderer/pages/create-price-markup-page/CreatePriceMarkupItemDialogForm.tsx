import {
  FC,
  ReactElement,
  useEffect,
  useState,
} from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ChevronsUpDown, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CreatePriceMarkupItemDialogFormProps {
  onAdd: (item: unknown) => void
  onSearch: (query: string) => Promise<unknown[]>
  triggerText: string
  titleText?: string
  descriptionText?: string
  renderItem: (
    item: unknown,
    index?: number,
  ) => ReactElement
  renderSelectedItem: (item: unknown) => ReactElement
}
const CreatePriceMarkupItemDialogForm: FC<
  CreatePriceMarkupItemDialogFormProps
> = ({
  triggerText,
  titleText,
  descriptionText,
  onSearch,
  onAdd,
  renderItem,
  renderSelectedItem,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const [type, setType] = useState<string>("inclusion")
  const [typeErrorMessage, setTypeErrorMessage] = useState<
    string | null
  >(null)

  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] =
    useState<unknown>(null)
  const [searchResults, setSearchResults] = useState<
    unknown[]
  >([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [
    selectedItemErrorMessage,
    setSelectedItemErrorMessage,
  ] = useState<string | null>(null)

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true)
      try {
        setSearchResults(await onSearch(query))
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(handler)
  }, [query])

  const onSelectItem = (item: unknown) => {
    setSelectedItem(item)
    setOpen(false)
  }

  const onDialogOpenChange = (isOpen: boolean) => {
    setDialogOpen(isOpen)
    if (!isOpen) {
      setTypeErrorMessage(null)
      setSelectedItemErrorMessage(null)
      setSelectedItem(null)
      setQuery("")
      setSearchResults([])
      setType("inclusion")
    }
  }

  const handleAdd = () => {
    setTypeErrorMessage(null)
    setSelectedItemErrorMessage(null)

    if (!selectedItem) {
      setSelectedItemErrorMessage(
        "Будь ласка, оберіть елемент",
      )
      return
    }

    onAdd({
      ...(selectedItem as any),
      isApplied: type === "inclusion",
    })

    setDialogOpen(false)
    setTypeErrorMessage(null)
    setSelectedItemErrorMessage(null)
    setSelectedItem(null)
    setQuery("")
    setSearchResults([])
    setType("inclusion")
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={onDialogOpenChange}
    >
      <DialogTrigger asChild>
        <Button variant={"outline"}>{triggerText}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>
            {descriptionText}
          </DialogDescription>
        </DialogHeader>
        <Field className={"gap-2"}>
          <FieldLabel className={"font-normal"}>
            Оберіть тип операції
          </FieldLabel>
          <FieldDescription className={"text-xs"}>
            При обранному значенні "Виключення", ціна товару
            не буде змінюватися, якщо він потрапляє під дію
            глобальної або категорійної націнки.
          </FieldDescription>
          <Select
            defaultValue={"inclusion"}
            value={type}
            onValueChange={setType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть тип операції" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inclusion">
                Включенння
              </SelectItem>
              <SelectItem value="exclusion">
                Виключення
              </SelectItem>
            </SelectContent>
          </Select>
          {typeErrorMessage && (
            <FieldError>{typeErrorMessage}</FieldError>
          )}
        </Field>
        <Field className={"gap-2"}>
          <FieldLabel className={"font-normal"}>
            Оберіть елемент
          </FieldLabel>
          <FieldDescription className={"text-xs"}>
            {descriptionText}
          </FieldDescription>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={"justify-between"}
              >
                <div
                  className={
                    "truncate w-[300px] text-start"
                  }
                >
                  {selectedItem
                    ? renderSelectedItem(selectedItem)
                    : "Оберіть елемент..."}
                </div>
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={"w-[462px] flex flex-col gap-2"}
            >
              <InputGroup>
                <InputGroupInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={"Пошук..."}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
              <Separator />
              {loading ? (
                <div className={"text-center p-2"}>
                  <h3
                    className={
                      "font-normal text-sm text-muted-foreground"
                    }
                  >
                    Завантаження...
                  </h3>
                </div>
              ) : searchResults.length > 0 ? (
                <ScrollArea className={"h-[200px]"}>
                  <ul>
                    {searchResults.map((item, index) => (
                      <li
                        key={index}
                        className={
                          "pointer hover:bg-accent"
                        }
                        onClick={() => onSelectItem(item)}
                      >
                        {renderItem(item, index)}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <div className={"text-center p-2"}>
                  <h3
                    className={
                      "font-normal text-sm text-muted-foreground"
                    }
                  >
                    Нічого не знайдено
                  </h3>
                </div>
              )}
            </PopoverContent>
          </Popover>
          {selectedItemErrorMessage && (
            <FieldError>
              {selectedItemErrorMessage}
            </FieldError>
          )}
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Скасувати</Button>
          </DialogClose>
          <Button onClick={handleAdd}>Додати</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { CreatePriceMarkupItemDialogForm }
