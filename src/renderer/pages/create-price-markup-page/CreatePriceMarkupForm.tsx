import React, {
  FC,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { z } from "zod"
import {
  useFieldArray,
  useForm,
  FormProvider,
  Controller,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  loadCatalogs,
  unloadCatalogs,
  searchCategories,
  searchOffers,
  runPriceMarkupSettings,
} from "@/pages/create-price-markup-page/CreatePriceMarkupForm.funcs"
import {
  CatalogCategory,
  CatalogOffer,
  OfferChange,
  PriceMarkupCategorySetting,
} from "../../../types"
import { CreatePriceMarkupItemDialogForm } from "@/pages/create-price-markup-page/CreatePriceMarkupItemDialogForm"

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
          numberOfOffers: z.number().optional(),
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
  const [step, setStep] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [settingsTab, setSettingsTab] = useState<
    "global" | "categories" | "offers"
  >("global")

  const priceMarkupForm =
    useForm<PriceMarkupFormSchemaType>({
      resolver: zodResolver(priceMarkupFormSchema),
      defaultValues: {
        catalogUrls: [{ url: "" }],
        automation: {
          frequency: undefined,
          startTime: undefined,
        },
        global: {
          markupPercentage: undefined,
        },
        categories: [],
        offers: [],
      },
      mode: "onChange",
    })

  const {
    fields: catalogUrlFields,
    append: appendCatalogUrlField,
    remove: removeCatalogUrlField,
  } = useFieldArray({
    control: priceMarkupForm.control,
    name: "catalogUrls",
  })

  const {
    fields: categoryFields,
    append: appendCategoryField,
    remove: removeCategoryField,
  } = useFieldArray({
    control: priceMarkupForm.control,
    name: "categories",
  })

  const {
    fields: offerFields,
    append: appendOfferField,
    remove: removeOfferField,
  } = useFieldArray({
    control: priceMarkupForm.control,
    name: "offers",
  })

  const hasValidationErrors = useMemo(() => {
    const errors = priceMarkupForm.formState.errors as any
    return Boolean(
      errors?._form ||
        errors?.categories ||
        errors?.offers ||
        errors?.global,
    )
  }, [priceMarkupForm.formState.errors])

  const onNextPriceMarkupForm = async () => {
    const valid =
      await priceMarkupForm.trigger("catalogUrls")
    if (!valid) return

    setIsLoading(true)
    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((v: { url: string }) => v.url)
    const res = await loadCatalogs(catalogUrls)
    setIsLoading(false)

    if (res.isSuccess) {
      setStep(2)
    } else {
      // Assign per-field errors from response
      priceMarkupForm.clearErrors("catalogUrls")
      catalogUrls.forEach((url: string, index: number) => {
        const error = (res as any).error?.[url]
        if (error) {
          priceMarkupForm.setError(
            `catalogUrls.${index}.url` as any,
            {
              type: "manual",
              message:
                error.message || "Помилка завантаження",
            },
          )
        }
      })
    }
  }

  useEffect(() => {
    return () => {
      const catalogUrls = priceMarkupForm
        .getValues("catalogUrls")
        .map((v: { url: string }) => v.url)
      unloadCatalogs(catalogUrls)
    }
  }, [])

  const onSearchCategories = async (
    query: string,
  ): Promise<CatalogCategory[]> => {
    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((v: { url: string }) => v.url)
    const res = await searchCategories(catalogUrls, query)
    return res.isSuccess
      ? (res.data as CatalogCategory[])
      : []
  }

  const onSearchOffers = async (
    query: string,
  ): Promise<CatalogOffer[]> => {
    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((v: { url: string }) => v.url)
    const res = await searchOffers(catalogUrls, query)
    console.log(res)
    return res.isSuccess ? (res.data as CatalogOffer[]) : []
  }

  const onSubmitPriceMarkupForm = async (
    values: PriceMarkupFormSchemaType,
  ) => {
    setStep(3)
    const catalogUrls = priceMarkupForm
      .getValues("catalogUrls")
      .map((v: { url: string }) => v.url)
    const res = await runPriceMarkupSettings({
      catalogUrls,
      ...(values.automation?.frequency &&
      values.automation?.startTime
        ? { automation: values.automation }
        : { automation: undefined }),
      ...(values.global?.markupPercentage
        ? { globalSettings: values.global }
        : { globalSettings: undefined }),
      categorySettings: values.categories,
      offerSettings: values.offers,
    })
    setStep(res.isSuccess ? 4 : 5)
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
    setSettingsTab("global")
  }

  return (
    <FormProvider {...priceMarkupForm}>
      <form
        onSubmit={priceMarkupForm.handleSubmit(
          onSubmitPriceMarkupForm,
        )}
      >
        {/* Step 1: Catalog URLs */}
        {(step === 1 || step === 2) && (
          <Card sx={{ mb: 2, boxShadow: "none" }}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={400}>
                  Джерела даних
                </Typography>
              }
              subheader={
                <Typography variant="caption">
                  Посилання на файл формату: YML, XML,
                  розміром до 180 МБ. Переконайтеся в тому,
                  що доступ до файлу відкритий.
                </Typography>
              }
            />
            <CardContent>
              <Stack spacing={1.5}>
                {catalogUrlFields.map((field, index) => (
                  <Controller
                    key={field.id}
                    name={`catalogUrls.${index}.url`}
                    control={priceMarkupForm.control}
                    render={({ field, fieldState }) => (
                      <Stack direction="row" spacing={1}>
                        <TextField
                          {...field}
                          disabled={step !== 1}
                          placeholder="https://..."
                          fullWidth
                          size="small"
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message
                          }
                          InputProps={{
                            endAdornment:
                              step !== 1 ? (
                                <InputAdornment position="end">
                                  <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                  />
                                </InputAdornment>
                              ) : undefined,
                          }}
                        />
                        {step === 1 && (
                          <IconButton
                            aria-label="remove"
                            color={
                              step === 1
                                ? "error"
                                : "success"
                            }
                            onClick={() => {
                              if (step !== 1) return
                              if (index !== 0)
                                removeCatalogUrlField(index)
                              else field.onChange("")
                            }}
                            disabled={step !== 1}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                    )}
                  />
                ))}

                {step === 1 && (
                  <Box>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() =>
                        appendCatalogUrlField({ url: "" })
                      }
                    >
                      + Додати джерело
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>

            {step === 1 && (
              <>
                <Divider />
                <CardActions sx={{ px: 2, pb: 2 }}>
                  {isLoading ? (
                    <Stack
                      spacing={1}
                      alignItems="center"
                      sx={{ width: "100%", py: 1 }}
                    >
                      <CircularProgress size={20} />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                      >
                        Завантаження...
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                      >
                        Процесс завантаження даних з джерел,
                        це може зайняти декілька хвилин будь
                        ласка зачекайте.
                      </Typography>
                    </Stack>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={onNextPriceMarkupForm}
                    >
                      Далі
                    </Button>
                  )}
                </CardActions>
              </>
            )}
          </Card>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <>
            {/* Automation settings */}
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={400}>
                    Налаштування автоматичної націнки
                  </Typography>
                }
                subheader={
                  <Typography variant="caption">
                    Вкажіть правила для автоматизації
                    націнки товарів. Поле не є обов'язковим.
                    При заповненні, націнка буде застосована
                    згідно з вказаними правилами.
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <Controller
                    name={"automation.startTime"}
                    control={priceMarkupForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value)
                        }
                        type="time"
                        size="small"
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message
                        }
                      />
                    )}
                  />
                  <Controller
                    name={"automation.frequency"}
                    control={priceMarkupForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        select
                        size="small"
                        label="Частота оновлення"
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message
                        }
                        sx={{ minWidth: 220 }}
                      >
                        <MenuItem value="daily">
                          Щоденно
                        </MenuItem>
                      </TextField>
                    )}
                  />
                </Stack>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onResetAutomationSection}
                >
                  Скасувати налаштування автоматизації
                </Button>
              </CardActions>
            </Card>

            {/* Price settings */}
            <Card
              sx={{
                boxShadow: "none",
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={400}>
                    Налаштування націнки
                  </Typography>
                }
                subheader={
                  <Typography variant="caption">
                    Вкажіть глобальну націнку, а також
                    додаткові правила для категорій та
                    окремих товарів.
                  </Typography>
                }
              />
              <CardContent>
                <Tabs
                  value={settingsTab}
                  onChange={(
                    _e: React.SyntheticEvent,
                    v: "global" | "categories" | "offers",
                  ) => setSettingsTab(v)}
                  aria-label="price settings tabs"
                >
                  <Tab value="global" label="Глобальні" />
                  <Tab
                    value="categories"
                    label="За категоріями"
                  />
                  <Tab value="offers" label="За товарами" />
                </Tabs>

                {/* Global tab */}
                {settingsTab === "global" && (
                  <Box sx={{ pt: 2 }}>
                    <Controller
                      name={"global.markupPercentage"}
                      control={priceMarkupForm.control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const num =
                              e.target.value === ""
                                ? undefined
                                : e.target.valueAsNumber
                            field.onChange(num as any)
                          }}
                          label="Глобальна націнка"
                          size="small"
                          fullWidth
                          type="number"
                          placeholder="1000"
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            "Націнка для всіх товарів у каталозі, може бути перезаписана націнкою за категоріями або товарами."
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                %
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Box>
                )}

                {/* Categories tab */}
                {settingsTab === "categories" && (
                  <Box sx={{ pt: 2 }}>
                    <Stack spacing={1} sx={{ mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={400}
                      >
                        Націнка за категоріями
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Націнка для товарів у вказаних
                        категоріях, перезаписує глобальну
                        націнку та може бути перезаписана
                        націнкою за товарами.
                      </Typography>
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
                            numberOfOffers: (value as any)
                              .numberOfOffers,
                          })
                        }
                        onSearch={onSearchCategories}
                        renderItem={(
                          category: CatalogCategory,
                        ) => (
                          <Box sx={{ p: 1 }}>
                            <Typography variant="body2">
                              {category.id} -{" "}
                              {category.name}
                            </Typography>
                          </Box>
                        )}
                        renderSelectedItem={(
                          category: CatalogCategory,
                        ) => (
                          <Typography variant="body2">
                            {category.name}
                          </Typography>
                        )}
                      />
                    </Stack>

                    {categoryFields.length !== 0 && (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Код категорії
                            </TableCell>
                            <TableCell>Назва</TableCell>
                            <TableCell align="right">
                              Націнка
                            </TableCell>
                            <TableCell align="center">
                              Дії
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryFields.map(
                            (categoryField: any, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {categoryField.categoryId}
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight={400}
                                  >
                                    {categoryField.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Містить{" "}
                                    {categoryField.numberOfOffers ??
                                      0}{" "}
                                    шт. товарів
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  {categoryField.isApplied ? (
                                    <Controller
                                      key={categoryField.id}
                                      name={
                                        `categories.${index}.markupPercentage` as const
                                      }
                                      control={
                                        priceMarkupForm.control
                                      }
                                      render={({
                                        field,
                                        fieldState,
                                      }) => (
                                        <TextField
                                          {...field}
                                          value={
                                            field.value ??
                                            ""
                                          }
                                          onChange={(e) => {
                                            const num =
                                              e.target
                                                .value ===
                                              ""
                                                ? undefined
                                                : e.target
                                                    .valueAsNumber
                                            field.onChange(
                                              (num ??
                                                0) as any,
                                            )
                                          }}
                                          size="small"
                                          type="number"
                                          placeholder="Введіть процент націнки..."
                                          error={
                                            !!fieldState.error
                                          }
                                          helperText={
                                            fieldState.error
                                              ?.message
                                          }
                                          InputProps={{
                                            endAdornment: (
                                              <InputAdornment position="end">
                                                %
                                              </InputAdornment>
                                            ),
                                          }}
                                          sx={{
                                            maxWidth: 220,
                                          }}
                                        />
                                      )}
                                    />
                                  ) : (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Виключено з націнки
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    aria-label="delete"
                                    onClick={() =>
                                      removeCategoryField(
                                        index,
                                      )
                                    }
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </Box>
                )}

                {/* Offers tab */}
                {settingsTab === "offers" && (
                  <Box sx={{ pt: 2 }}>
                    <Stack spacing={1} sx={{ mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={400}
                      >
                        Націнка за товарами
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Націнка для товарів, перезаписує
                        глобальну націнку та націнку за
                        категоріями.
                      </Typography>
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
                          <Box sx={{ p: 1 }}>
                            <Typography variant="body2">
                              {offer.id} - {offer.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              В наявності{" "}
                              {offer.quantityInStock} шт. за{" "}
                              {offer.price} грн.
                            </Typography>
                          </Box>
                        )}
                        renderSelectedItem={(
                          offer: CatalogOffer,
                        ) => (
                          <Typography variant="body2">
                            {offer.name}
                          </Typography>
                        )}
                      />
                    </Stack>

                    {offerFields.length !== 0 && (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Код товару
                            </TableCell>
                            <TableCell>Назва</TableCell>
                            <TableCell align="right">
                              Націнка
                            </TableCell>
                            <TableCell align="center">
                              Дії
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {offerFields.map(
                            (offerField: any, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {offerField.offerId}
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight={400}
                                  >
                                    {offerField.name}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  {offerField.isApplied ? (
                                    <Controller
                                      key={offerField.id}
                                      name={
                                        `offers.${index}.newPrice` as const
                                      }
                                      control={
                                        priceMarkupForm.control
                                      }
                                      render={({
                                        field,
                                        fieldState,
                                      }) => (
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          justifyContent="flex-end"
                                          spacing={1}
                                        >
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              textDecoration:
                                                "line-through",
                                            }}
                                          >
                                            {
                                              offerField.oldPrice
                                            }{" "}
                                            ₴
                                          </Typography>
                                          <TextField
                                            {...field}
                                            value={
                                              field.value ??
                                              ""
                                            }
                                            onChange={(
                                              e,
                                            ) => {
                                              const num =
                                                e.target
                                                  .value ===
                                                ""
                                                  ? undefined
                                                  : e.target
                                                      .valueAsNumber
                                              field.onChange(
                                                (num ??
                                                  0) as any,
                                              )
                                            }}
                                            size="small"
                                            type="number"
                                            placeholder="Введіть нову ціну..."
                                            error={
                                              !!fieldState.error
                                            }
                                            helperText={
                                              fieldState
                                                .error
                                                ?.message
                                            }
                                            InputProps={{
                                              endAdornment:
                                                (
                                                  <InputAdornment position="end">
                                                    ₴
                                                  </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                              maxWidth: 220,
                                            }}
                                          />
                                        </Stack>
                                      )}
                                    />
                                  ) : (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Виключено з націнки
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    aria-label="delete"
                                    onClick={() =>
                                      removeOfferField(
                                        index,
                                      )
                                    }
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </Box>
                )}
              </CardContent>

              {/* Validation alerts */}
              {hasValidationErrors && (
                <>
                  <Divider />
                  <CardContent>
                    <Stack spacing={1}>
                      {(
                        priceMarkupForm.formState
                          .errors as any
                      )?._form?.message && (
                        <Alert
                          severity="error"
                          variant="outlined"
                        >
                          {
                            (
                              priceMarkupForm.formState
                                .errors as any
                            )?._form?.message
                          }
                        </Alert>
                      )}
                      {(
                        priceMarkupForm.formState
                          .errors as any
                      )?.categories?.categoryId
                        ?.message && (
                        <Alert
                          severity="error"
                          variant="outlined"
                        >
                          {
                            (
                              priceMarkupForm.formState
                                .errors as any
                            )?.categories?.categoryId
                              ?.message
                          }
                        </Alert>
                      )}
                      {(
                        priceMarkupForm.formState
                          .errors as any
                      )?.offers?.offerId?.message && (
                        <Alert
                          severity="error"
                          variant="outlined"
                        >
                          {
                            (
                              priceMarkupForm.formState
                                .errors as any
                            )?.offers?.offerId?.message
                          }
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </>
              )}

              <Divider />
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button type="submit" variant="contained">
                  Застосувати націнку
                </Button>
              </CardActions>
            </Card>
          </>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <Card variant="outlined">
            <CardContent>
              <Stack
                spacing={1}
                alignItems="center"
                textAlign="center"
                sx={{ py: 2 }}
              >
                <CircularProgress size={20} />
                <Typography
                  variant="body1"
                  fontWeight={400}
                >
                  Оновлення даних на Prom.ua...
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Процесс оновлення даних, це може зайняти
                  декілька хвилин будь ласка зачекайте.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card variant="outlined">
            <CardContent>
              <Stack
                spacing={1}
                alignItems="center"
                textAlign="center"
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body1"
                  fontWeight={400}
                >
                  Дані оновлені успішно
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Натисніть кнопку нижче, щоб повернутися до
                  початку та створити нове оновлення.
                </Typography>
                <Button
                  type="reset"
                  variant="contained"
                  onClick={onResetForm}
                  sx={{ mt: 1 }}
                >
                  Завершити
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Error */}
        {step === 5 && (
          <Card variant="outlined">
            <CardContent>
              <Stack
                spacing={1}
                alignItems="center"
                textAlign="center"
                sx={{ py: 2 }}
              >
                <Typography
                  variant="body1"
                  fontWeight={400}
                >
                  Сталася невідома помилка при оновленні
                  даних
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Натисніть кнопку нижче, щоб повернутися до
                  початку та створити нове оновлення.
                </Typography>
                <Button
                  type="reset"
                  variant="contained"
                  onClick={onResetForm}
                  sx={{ mt: 1 }}
                >
                  Завершити
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </form>
    </FormProvider>
  )
}

export { CreatePriceMarkupForm }
export default CreatePriceMarkupForm
