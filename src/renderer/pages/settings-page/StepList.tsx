import { ComponentProps, FC } from "react"
import { cn } from "@/lib/utils"

const StepList: FC<ComponentProps<"ul">> = ({ children, ...props }) => {
  return <ul {...props}>{children}</ul>
}

interface StepListItemProps extends ComponentProps<"li"> {
  number: number
}
const StepListItem: FC<StepListItemProps> = ({
  number,
  className,
  children,
  ...props
}) => {
  return (
    <li className={cn("flex gap-2", className)} {...props}>
      <div>
        <span
          className={
            "rounded-full bg-[#7ecefd] text-[#2e6bef] w-[20px] h-[20px] flex items-center justify-center mt-1"
          }
        >
          {number}
        </span>
      </div>
      <div className={"grow"}>{children}</div>
    </li>
  )
}

export { StepList, StepListItem }
