import {
  FC,
  ReactElement,
  useEffect,
  useState,
} from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Popover,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { SelectChangeEvent } from "@mui/material/Select"
import { ChevronsUpDown, Search } from "lucide-react"
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

  const [anchorEl, setAnchorEl] =
    useState<HTMLElement | null>(null)
  const popoverOpen = Boolean(anchorEl)

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
  }, [query, onSearch])

  const onSelectItem = (item: unknown) => {
    setSelectedItem(item)
    setAnchorEl(null)
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
      setAnchorEl(null)
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
    setAnchorEl(null)
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => onDialogOpenChange(true)}
      >
        {triggerText}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => onDialogOpenChange(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{titleText}</DialogTitle>
        <DialogContent dividers>
          {descriptionText && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {descriptionText}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2">
              Оберіть тип операції
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              При обранному значенні "Виключення", ціна
              товару не буде змінюватися, якщо він потрапляє
              під дію глобальної або категорійної націнки.
            </Typography>

            <FormControl
              size="small"
              fullWidth
              error={Boolean(typeErrorMessage)}
            >
              <InputLabel id="operation-type-label">
                Тип операції
              </InputLabel>
              <MuiSelect
                labelId="operation-type-label"
                label="Тип операції"
                value={type}
                onChange={(e: SelectChangeEvent<string>) =>
                  setType(e.target.value as string)
                }
              >
                <MenuItem value="inclusion">
                  Включенння
                </MenuItem>
                <MenuItem value="exclusion">
                  Виключення
                </MenuItem>
              </MuiSelect>
              {typeErrorMessage && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5 }}
                >
                  {typeErrorMessage}
                </Typography>
              )}
            </FormControl>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Typography variant="subtitle2">
              Оберіть елемент
            </Typography>
            {descriptionText && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {descriptionText}
              </Typography>
            )}

            <Button
              variant="outlined"
              color="inherit"
              onClick={(
                e: React.MouseEvent<HTMLButtonElement>,
              ) => setAnchorEl(e.currentTarget)}
              endIcon={<ChevronsUpDown />}
              sx={{
                justifyContent: "space-between",
                color: "text.primary",
              }}
            >
              <Box
                sx={{
                  maxWidth: 300,
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedItem
                  ? renderSelectedItem(selectedItem)
                  : "Оберіть елемент..."}
              </Box>
            </Button>

            <Popover
              open={popoverOpen}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{ sx: { width: 480, p: 2 } }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Пошук..."
                  value={query}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => setQuery(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <Search style={{ opacity: 0.6 }} />
                    ),
                  }}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <CircularProgress size={16} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Завантаження...
                  </Typography>
                </Box>
              ) : searchResults.length > 0 ? (
                <Box
                  sx={{ maxHeight: 240, overflowY: "auto" }}
                >
                  <List dense disablePadding>
                    {searchResults.map(
                      (item: unknown, index: number) => (
                        <ListItemButton
                          key={index}
                          onClick={() => onSelectItem(item)}
                          sx={{ borderRadius: 1 }}
                        >
                          <ListItemText
                            primaryTypographyProps={{
                              component: "div",
                            }}
                            secondaryTypographyProps={{
                              component: "div",
                            }}
                            primary={renderItem(
                              item,
                              index,
                            )}
                          />
                        </ListItemButton>
                      ),
                    )}
                  </List>
                </Box>
              ) : (
                <Box sx={{ px: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Нічого не знайдено
                  </Typography>
                </Box>
              )}
            </Popover>

            {selectedItemErrorMessage && (
              <Typography variant="caption" color="error">
                {selectedItemErrorMessage}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => onDialogOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button variant="contained" onClick={handleAdd}>
            Додати
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export { CreatePriceMarkupItemDialogForm }
