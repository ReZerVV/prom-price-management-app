import { FC } from "react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"

function getTextFromFrequency(frequency: string) {
  switch (frequency) {
    case "daily":
      return "Щоденно"
    default:
      throw new Error("Unknown frequency")
  }
}

interface AutomationItemProps {
  catalogUrls: string[]
  frequency: string
  startTime: string
  onDelete: () => void
}
const AutomationItem: FC<AutomationItemProps> = ({
  catalogUrls,
  frequency,
  startTime,
  onDelete,
}) => {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle className={"flex flex-col gap-1"}>
          {catalogUrls.map((catalogUrl, index) => (
            <span key={index}>{catalogUrl}</span>
          ))}
        </ItemTitle>
        <ItemDescription>
          {getTextFromFrequency(frequency)} о {startTime}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onDelete}
        >
          <Delete />
        </Button>
      </ItemActions>
    </Item>
  )
}

export { AutomationItem }
