import { FC, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/components/ui/form"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/ui/components/ui/input-group"
import { CircleCheck, Delete, Percent } from "lucide-react"
import {
  loadCatalogs,
  runPriceMarkupSettings,
  searchCategories,
  searchOffers,
} from "@/pages/create-price-markup-page/CreatePriceMarkupForm.funcs"
import { Spinner } from "@/shared/ui/components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/components/ui/tabs"
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/shared/ui/components/ui/button-group"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/ui/table"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/ui/components/ui/field"
import {
  CatalogCategory,
  CatalogOffer,
  OfferChange,
  PriceMarkupCategorySetting,
} from "../../../types"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/ui/components/ui/item"
import { CreatePriceMarkupItemDialogForm } from "@/pages/create-price-markup-page/CreatePriceMarkupItemDialogForm"
import { Separator } from "@/shared/ui/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/ui/select"
import { Input } from "@/shared/ui/components/ui/input"

const priceMarkupFormSchema = z
  .object({
    catalogUrls: z
      .array(
        z.object({
          url: z
            .string()
            .min(1, "Посилання не може бути порожнім")
            .url("Некоректна URL-адреса"),
        }),
      )
      .min(1, "Потрібно вказати хоча б одне джерело"),
    automation: z
      .object({
        frequency: z.string().optional(),
        startTime: z.string().time().optional(),
      })
      .refine(
        (automation) => {
          return (
            (automation.frequency &&
              automation.startTime) ||
            (!automation.frequency && !automation.startTime)
          )
        },
        {
          message:
            "Потрібно вказати частоту та час запуску разом",
          path: [
            "automation.frequency",
            "automation.startTime",
          ],
        },
      )
      .optional(),
    global: z
      .object({
        markupPercentage: z
          .number("Потрібно вказати число")
          .min(0, "Мінімальне значення 0%")
          .optional(),
      })
      .optional(),
    categories: z
      .array(
        z.object({
          categoryId: z.string(),
          name: z.string(),
          isApplied: z.boolean(),
          markupPercentage: z
            .number("Потрібно вказати число")
            .min(0, "Мінімальне значення 0%")
            .optional(),
        }),
      )
      .refine(
        (categories) => {
          const ids = categories.map(
            (c: PriceMarkupCategorySetting) => c.categoryId,
          )
          return new Set(ids).size === ids.length
        },
        {
          message:
            "Категорії з однаковим ID не можуть повторюватись",
          path: ["categoryId"],
        },
      )
      .optional(),
    offers: z
      .array(
        z.object({
          offerId: z.string(),
          name: z.string(),
          isApplied: z.boolean(),
          oldPrice: z.number(),
          newPrice: z
            .number("Потрібно вказати число")
            .min(0, "Мінімальне значення 0%")
            .optional(),
        }),
      )
      .refine(
        (offers) => {
          const ids = offers.map(
            (o: OfferChange) => o.offerId,
          )
          return new Set(ids).size === ids.length
        },
        {
          message:
            "Товари з однаковим ID не можуть повторюватись",
          path: ["offerId"],
        },
      )
      .optional(),
  })
  .refine(
    (data) => {
      const hasGlobal =
        !!data.global && !!data.global.markupPercentage
      const hasCategories =
        Array.isArray(data.categories) &&
        data.categories.length > 0
      const hasOffers =
        Array.isArray(data.offers) && data.offers.length > 0

      return hasGlobal || hasCategories || hasOffers
    },
    {
      message:
        "Потрібно вказати хоча б один блок змін (глобальні, категорії або товари)",
      path: ["_form"],
    },
  )
type PriceMarkupFormSchemaType = z.infer<
  typeof priceMarkupFormSchema
>

const CreatePriceMarkupForm: FC = () => {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const priceMarkupForm =
    useForm<PriceMarkupFormSchemaType>({
      resolver: zodResolver(priceMarkupFormSchema),
      defaultValues: {
        catalogUrls: [{ url: "" }],
      },
    })
  const {
    fields: catalogUrlFields,
    append: appendCatalogUrlField,
    remove: removeCatalogUrlField,
  } = useFieldArray({
    control: priceMarkupForm.control,
    name: "catalogUrls",
  })
  const onNextPriceMarkupForm = async () => {
    const validationResult =
      await priceMarkupForm.trigger("catalogUrls")
    if (!validationResult) {
      return
    }
    setIsLoading(true)

    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((v: { url: string }) => v.url)
    const res = await loadCatalogs(catalogUrls)
    setIsLoading(false)
    if (res.isSuccess) {
      setStep(2)
    } else {
      priceMarkupForm.clearErrors("catalogUrls")
      catalogUrls.forEach(
        (item: { url: string }, index: number) => {
          const error = res.error?.[item.url]
          if (error) {
            priceMarkupForm.setError(
              `catalogUrls.${index}.url`,
              {
                type: "manual",
                message:
                  error.message || "Помилка завантаження",
              },
              { shouldFocus: index === 0 },
            )
          }
        },
      )
    }
  }

  const {
    fields: categoryFields,
    append: appendCategoryField,
    remove: removeCategoryField,
  } = useFieldArray({
    control: priceMarkupForm.control,
    name: "categories",
  })
  const onSearchCategories = async (
    query: string,
  ): Promise<CatalogCategory[]> => {
    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((catalogUrl: { url: string }) => catalogUrl.url)
    const res = await searchCategories(catalogUrls, query)
    if (res.isSuccess) {
      return res.data
    } else {
      return []
    }
  }

  const {
    fields: offerFields,
    append: appendOfferField,
    remove: removeOfferField,
  } = useFieldArray({
    control: priceMarkupForm.control,
    name: "offers",
  })
  const onSearchOffers = async (
    query: string,
  ): Promise<CatalogOffer[]> => {
    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((catalogUrl: { url: string }) => catalogUrl.url)
    const res = await searchOffers(catalogUrls, query)
    if (res.isSuccess) {
      return res.data
    } else {
      return []
    }
  }

  const onSubmitPriceMarkupForm = async (
    values: PriceMarkupFormSchemaType,
  ) => {
    setStep(3)
    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((catalogUrl: { url: string }) => catalogUrl.url)
    const res = await runPriceMarkupSettings({
      catalogUrls,
      ...(values.automation.frequency &&
      values.automation.startTime
        ? {
            automation: values.automation,
          }
        : {
            automation: undefined,
          }),
      ...(values.global.markupPercentage
        ? {
            globalSettings: values.global,
          }
        : {
            globalSettings: undefined,
          }),
      categorySettings: values.categories,
      offerSettings: values.offers,
    })
    if (res.isSuccess) {
      setStep(4)
    } else {
      setStep(5)
    }
  }

  const onResetAutomationSection = () => {
    priceMarkupForm.setValue("automation", {
      frequency: undefined,
      startTime: undefined,
    })
  }

  const onResetForm = () => {
    priceMarkupForm.reset()
    setStep(1)
    setIsLoading(false)
  }

  return (
    <Form {...priceMarkupForm}>
      <form
        onSubmit={priceMarkupForm.handleSubmit(
          onSubmitPriceMarkupForm,
        )}
        className={"flex flex-col gap-4"}
      >
        {(step === 1 || step === 2) && (
          <Card className={"shadow-none"}>
            <CardHeader>
              <CardTitle className={"font-normal"}>
                Джерела даних
              </CardTitle>
              <CardDescription className={"text-xs"}>
                Посилання на файл формату: YML, XML,
                розміром до 180 МБ. Переконайтеся в тому, що
                доступ до файлу відкритий.
              </CardDescription>
            </CardHeader>
            <CardContent className={"flex flex-col gap-2"}>
              {catalogUrlFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={priceMarkupForm.control}
                  name={`catalogUrls.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <InputGroup
                        className={
                          step !== 1 &&
                          "border-[#87b37a] bg-[#87b37a]/10"
                        }
                      >
                        <FormControl>
                          <InputGroupInput
                            {...field}
                            placeholder={"https://..."}
                            disabled={step !== 1}
                          />
                        </FormControl>
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type={"button"}
                            onClick={() => {
                              if (index !== 0) {
                                removeCatalogUrlField(index)
                              } else {
                                field.onChange("")
                              }
                            }}
                            disabled={step !== 1}
                            size="icon-xs"
                          >
                            {step === 1 ? (
                              <Delete />
                            ) : (
                              <CircleCheck
                                className={"text-[#87b37a]"}
                              />
                            )}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {step === 1 && (
                <Button
                  type={"button"}
                  onClick={appendCatalogUrlField}
                  variant={"outline"}
                  className={""}
                >
                  + Додати джерело
                </Button>
              )}
            </CardContent>
            {step === 1 && (
              <>
                <Separator className={"my-2 mb-8"} />
                <CardFooter>
                  {isLoading ? (
                    <div
                      className={
                        "flex flex-col items-center gap-2 w-full text-center"
                      }
                    >
                      <Spinner />
                      <h3 className={"font-normal"}>
                        Завантаження...
                      </h3>
                      <p
                        className={
                          "text-xs text-muted-foreground"
                        }
                      >
                        Процесс завантаження даних з джерел,
                        це може зайняти декілька хвилин будь
                        ласка зачекайте.
                      </p>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={onNextPriceMarkupForm}
                    >
                      Далі
                    </Button>
                  )}
                </CardFooter>
              </>
            )}
          </Card>
        )}

        {step === 2 && (
          <>
            <Card className={"shadow-none"}>
              <CardHeader>
                <CardTitle className={"font-normal"}>
                  Налаштування автоматичної націнки
                </CardTitle>
                <CardDescription className={"text-xs"}>
                  Вкажіть правила для автоматизації націнки
                  товарів. Поле не є обов'язковим. При
                  заповненні, націнка буде застосована
                  згідно з вказаними правилами.
                </CardDescription>
              </CardHeader>
              <CardContent className={"flex gap-2"}>
                <FormField
                  name={"automation.startTime"}
                  control={priceMarkupForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value)
                          }
                          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"automation.frequency"}
                  control={priceMarkupForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Оберіть частоту оновлення" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="daily">
                                Щоденно
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type={"button"}
                  variant={"outline"}
                  onClick={onResetAutomationSection}
                >
                  Скасувати налаштування автоматизації
                </Button>
              </CardFooter>
            </Card>
            <Card className={"shadow-none"}>
              <CardHeader>
                <CardTitle className={"font-normal"}>
                  Налаштування націнки
                </CardTitle>
                <CardDescription className={"text-xs"}>
                  Вкажіть глобальну націнку, а також
                  додаткові правила для категорій та окремих
                  товарів.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={"global"}>
                  <TabsList>
                    <TabsTrigger value="global">
                      Глобальні
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                      За категоріями
                    </TabsTrigger>
                    <TabsTrigger value="offers">
                      За товарами
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={"global"}>
                    <FormField
                      control={priceMarkupForm.control}
                      name={"global.markupPercentage"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={"font-normal"}
                          >
                            Глобальна націнка
                          </FormLabel>
                          <FormDescription
                            className={"text-xs"}
                          >
                            Націнка для всіх товарів у
                            каталозі, може бути перезаписана
                            націнкою за категоріями або
                            товарами.
                          </FormDescription>
                          <InputGroup>
                            <FormControl>
                              <InputGroupInput
                                {...field}
                                type={"number"}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.valueAsNumber,
                                  )
                                }
                                placeholder={"1000"}
                              />
                            </FormControl>
                            <InputGroupAddon align="inline-end">
                              <Percent />
                            </InputGroupAddon>
                          </InputGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent
                    value={"categories"}
                    className={"flex flex-col gap-2"}
                  >
                    <Field>
                      <FieldLabel className={"font-normal"}>
                        Націнка за категоріями
                      </FieldLabel>
                      <FieldDescription
                        className={"text-xs"}
                      >
                        Націнка для товарів у вказаних
                        категоріях, перезаписує глобальну
                        націнку та може бути перезаписана
                        націнкою за товарами.
                      </FieldDescription>
                      <CreatePriceMarkupItemDialogForm
                        triggerText={"+ Додати категорію"}
                        titleText={"Додати категорію"}
                        descriptionText={
                          "Оберіть категорію, для якої буде застосована націнка."
                        }
                        onAdd={(
                          value: CatalogCategory & {
                            isApplied: boolean
                          },
                        ) =>
                          appendCategoryField({
                            categoryId: value.id,
                            name: value.name,
                            isApplied: value.isApplied,
                            markupPercentage: 0,
                          })
                        }
                        onSearch={onSearchCategories}
                        renderItem={(
                          category: CatalogCategory,
                        ) => (
                          <Item>
                            <ItemContent>
                              <ItemTitle>
                                {category.id} -{" "}
                                {category.name}
                              </ItemTitle>
                            </ItemContent>
                          </Item>
                        )}
                        renderSelectedItem={(
                          category: CatalogCategory,
                        ) => <>{category.name}</>}
                      />
                    </Field>
                    <Table>
                      <TableCaption>
                        Налаштування націнки за категоріями
                        товарів
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            Код категорії
                          </TableHead>
                          <TableHead>Назва</TableHead>
                          <TableHead className="text-right">
                            Націнка
                          </TableHead>
                          <TableHead
                            className={"text-center"}
                          >
                            Дії
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryFields.map(
                          (categoryField: any, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {categoryField.categoryId}
                              </TableCell>
                              <TableCell>
                                <h3
                                  className={"font-normal"}
                                >
                                  {categoryField.name}
                                </h3>
                                <p
                                  className={
                                    "text-muted-foreground text-xs"
                                  }
                                >
                                  Містить{" "}
                                  {
                                    categoryField.numberOfOffers
                                  }{" "}
                                  шт. товарів
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end items-center">
                                  {categoryField.isApplied ? (
                                    <FormField
                                      key={categoryField.id}
                                      control={
                                        priceMarkupForm.control
                                      }
                                      name={`categories.${index}.markupPercentage`}
                                      render={({
                                        field,
                                      }) => (
                                        <FormItem>
                                          <InputGroup>
                                            <FormControl>
                                              <InputGroupInput
                                                {...field}
                                                type={
                                                  "number"
                                                }
                                                value={
                                                  field.value ??
                                                  ""
                                                }
                                                onChange={(
                                                  e,
                                                ) =>
                                                  field.onChange(
                                                    e.target
                                                      .valueAsNumber ||
                                                      0,
                                                  )
                                                }
                                                placeholder={
                                                  "Введіть процент націнки..."
                                                }
                                              />
                                            </FormControl>
                                            <InputGroupAddon
                                              align={
                                                "inline-end"
                                              }
                                            >
                                              <Percent />
                                            </InputGroupAddon>
                                          </InputGroup>
                                        </FormItem>
                                      )}
                                    />
                                  ) : (
                                    <span
                                      className={
                                        "text-muted-foreground"
                                      }
                                    >
                                      Виключено з націнки
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div
                                  className={
                                    "flex justify-center items-center"
                                  }
                                >
                                  <Button
                                    type={"button"}
                                    variant={"ghost"}
                                    onClick={() =>
                                      removeCategoryField(
                                        index,
                                      )
                                    }
                                  >
                                    <Delete />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  <TabsContent
                    value={"offers"}
                    className={"flex flex-col gap-2"}
                  >
                    <Field>
                      <FieldLabel className={"font-normal"}>
                        Націнка за товарами
                      </FieldLabel>
                      <FieldDescription
                        className={"text-xs"}
                      >
                        Націнка для товарів, перезаписує
                        глобальну націнку та націнку за
                        категоріями.
                      </FieldDescription>
                      <CreatePriceMarkupItemDialogForm
                        triggerText={"+ Додати товар"}
                        titleText={"Додати товар"}
                        descriptionText={
                          "Оберіть товар, для якого буде застосована націнка."
                        }
                        onAdd={(
                          value: CatalogOffer & {
                            isApplied: boolean
                          },
                        ) =>
                          appendOfferField({
                            offerId: value.id,
                            name: value.name,
                            isApplied: value.isApplied,
                            oldPrice: value.price,
                            newPrice: 0,
                          })
                        }
                        onSearch={onSearchOffers}
                        renderItem={(
                          offer: CatalogOffer,
                        ) => (
                          <Item>
                            <ItemContent>
                              <ItemTitle>
                                {offer.id} - {offer.name}
                              </ItemTitle>
                              <ItemDescription>
                                В наявності{" "}
                                {offer.quantityInStock} шт.
                                за {offer.price} грн.
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        )}
                        renderSelectedItem={(
                          offer: CatalogCategory,
                        ) => <>{offer.name}</>}
                      />
                    </Field>
                    <Table>
                      <TableCaption>
                        Налаштування націнки за товарами
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Код товару</TableHead>
                          <TableHead>Назва</TableHead>
                          <TableHead className="text-right">
                            Націнка
                          </TableHead>
                          <TableHead
                            className={"text-center"}
                          >
                            Дії
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offerFields.map(
                          (offerField: any, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {offerField.offerId}
                              </TableCell>
                              <TableCell>
                                <h3
                                  className={"font-normal"}
                                >
                                  {offerField.name}
                                </h3>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end items-center">
                                  {offerField.isApplied ? (
                                    <FormField
                                      key={offerField.id}
                                      control={
                                        priceMarkupForm.control
                                      }
                                      name={`offers.${index}.newPrice`}
                                      render={({
                                        field,
                                      }) => (
                                        <FormItem>
                                          <ButtonGroup>
                                            <ButtonGroupText
                                              className={
                                                "font-normal text-sm"
                                              }
                                            >
                                              <span
                                                className={
                                                  "line-through "
                                                }
                                              >
                                                {
                                                  offerField.oldPrice
                                                }{" "}
                                              </span>
                                              ₴
                                            </ButtonGroupText>
                                            <InputGroup>
                                              <FormControl>
                                                <InputGroupInput
                                                  {...field}
                                                  type={
                                                    "number"
                                                  }
                                                  value={
                                                    field.value ??
                                                    ""
                                                  }
                                                  onChange={(
                                                    e,
                                                  ) =>
                                                    field.onChange(
                                                      e
                                                        .target
                                                        .valueAsNumber ||
                                                        0,
                                                    )
                                                  }
                                                  placeholder={
                                                    "Введіть нову ціну..."
                                                  }
                                                />
                                              </FormControl>
                                              <InputGroupAddon
                                                align={
                                                  "inline-end"
                                                }
                                              >
                                                ₴
                                              </InputGroupAddon>
                                            </InputGroup>
                                          </ButtonGroup>
                                        </FormItem>
                                      )}
                                    />
                                  ) : (
                                    <span
                                      className={
                                        "text-muted-foreground"
                                      }
                                    >
                                      Виключено з націнки
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div
                                  className={
                                    "flex justify-center items-center"
                                  }
                                >
                                  <Button
                                    type={"button"}
                                    variant={"ghost"}
                                    onClick={() =>
                                      removeOfferField(
                                        index,
                                      )
                                    }
                                  >
                                    <Delete />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
              {(priceMarkupForm.formState.errors._form ||
                priceMarkupForm.formState.errors.global ||
                priceMarkupForm.formState.errors
                  .categories ||
                priceMarkupForm.formState.errors
                  .offers) && (
                <CardContent
                  className={"flex flex-col gap-2"}
                >
                  {priceMarkupForm.formState.errors
                    ._form && (
                    <CardDescription
                      className={"text-[#c95d63]"}
                    >
                      {
                        priceMarkupForm.formState.errors
                          ._form?.message
                      }
                    </CardDescription>
                  )}
                  {priceMarkupForm.formState.errors
                    .categories && (
                    <CardDescription
                      className={"text-[#c95d63]"}
                    >
                      {
                        priceMarkupForm.formState.errors
                          .categories.categoryId?.message
                      }
                    </CardDescription>
                  )}
                  {priceMarkupForm.formState.errors
                    .offers && (
                    <CardDescription
                      className={"text-[#c95d63]"}
                    >
                      {
                        priceMarkupForm.formState.errors
                          .offers.offerId?.message
                      }
                    </CardDescription>
                  )}
                </CardContent>
              )}
              <Separator className={"my-2 mb-8"} />
              <CardFooter>
                <Button type={"submit"}>
                  Застосувати націнку
                </Button>
              </CardFooter>
            </Card>
          </>
        )}

        {step === 3 && (
          <Card>
            <CardHeader
              className={"flex items-center gap-2 flex-col"}
            >
              <CardTitle
                className={"flex items-center gap-2"}
              >
                <Spinner />
                <h3 className={"font-normal"}>
                  Оновлення даних на Prom.ua...
                </h3>
              </CardTitle>
              <CardDescription
                className={"text-xs text-muted-foreground"}
              >
                Процесс оновлення даних, це може зайняти
                декілька хвилин будь ласка зачекайте.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader
              className={"flex items-center gap-2 flex-col"}
            >
              <CardTitle
                className={"flex items-center gap-2"}
              >
                <h3 className={"font-normal"}>
                  Дані оновлені успішно
                </h3>
              </CardTitle>
              <CardDescription
                className={"text-xs text-muted-foreground"}
              >
                Натисніть кнопку нижче, щоб повернутися до
                початку та створити нове оновлення.
              </CardDescription>
            </CardHeader>
            <Separator className={"my-2 mb-8"} />
            <CardFooter>
              <Button type={"reset"} onClick={onResetForm}>
                Завершити
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <CardHeader
              className={"flex items-center gap-2 flex-col"}
            >
              <CardTitle
                className={"flex items-center gap-2"}
              >
                <h3 className={"font-normal"}>
                  Сталася невідома помилка при оновленні
                  даних
                </h3>
              </CardTitle>
              <CardDescription
                className={"text-xs text-muted-foreground"}
              >
                Натисніть кнопку нижче, щоб повернутися до
                початку та створити нове оновлення.
              </CardDescription>
            </CardHeader>
            <Separator className={"my-2 mb-8"} />
            <CardFooter>
              <Button type={"reset"} onClick={onResetForm}>
                Завершити
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </Form>
  )
}

export { CreatePriceMarkupForm }
