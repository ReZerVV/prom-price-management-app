import { FC } from "react"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Hand, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChangeLogItemProps {
  catalogUrls: string[]
  type: "automation" | "custom"
  status: "success" | "failed"
  createdAt: string
  numberOfSuccessfullyChangedOffers: number
}
const ChangeLogItem: FC<ChangeLogItemProps> = ({
  catalogUrls,
  type,
  status,
  createdAt,
  numberOfSuccessfullyChangedOffers,
}) => {
  return (
    <Item
      className={cn(
        "",
        status === "failed"
          ? "border-[#c95d63] bg-[#c95d63]/10"
          : "border-[#87b37a] bg-[#87b37a]/10",
      )}
      variant={"outline"}
    >
      <ItemMedia variant="icon">
        {type === "automation" ? <Zap /> : <Hand />}
      </ItemMedia>
      <ItemContent>
        <ItemTitle
          className={"flex flex-col gap-1 items-start"}
        >
          <span>
            {new Date(createdAt).toLocaleString()}
          </span>
          {catalogUrls.map((catalogUrl, index) => (
            <span key={index}>{catalogUrl}</span>
          ))}
        </ItemTitle>
        <ItemDescription>
          Оновлено товарів:{" "}
          {numberOfSuccessfullyChangedOffers} шт.
        </ItemDescription>
      </ItemContent>
    </Item>
  )
}

export { ChangeLogItem }
