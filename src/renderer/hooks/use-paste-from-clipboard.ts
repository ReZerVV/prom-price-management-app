import { useCallback, useState } from "react"

export function usePasteFromClipboard() {
  const [isPasted, setIsPasted] = useState(false)

  const getFromClipboard = useCallback(async () => {
    setIsPasted(true)
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        const text = await navigator.clipboard.readText()
        return text
      } catch (e) {
        return ""
      } finally {
        setIsPasted(false)
      }
    }
    setIsPasted(false)
    return ""
  }, [])

  return {
    getFromClipboard,
    isPasted,
  }
}
