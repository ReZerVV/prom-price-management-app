import React, { useMemo } from "react"
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  type PaletteMode,
} from "@mui/material"
import { StyledEngineProvider } from "@mui/material/styles"

type MuiThemeProviderProps = {
  children: React.ReactNode
  mode?: PaletteMode
}

/**
 * App-wide MUI Theme wrapper.
 * - Provides ThemeProvider
 * - Applies CssBaseline
 * - Uses StyledEngineProvider with injectFirst so Tailwind/custom CSS can override MUI when needed.
 */
export function MuiThemeProvider({
  children,
  mode = "light",
}: MuiThemeProviderProps) {
  const theme = useMemo(() => {
    const base = createTheme({
      palette: {
        mode,
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        button: {
          textTransform: "none",
        },
      },
    })
    return responsiveFontSizes(base)
  }, [mode])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default MuiThemeProvider
