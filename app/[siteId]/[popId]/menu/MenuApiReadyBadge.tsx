import { menuApiReadyCountClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Props = {
  size?: "sm" | "md"
}

export function MenuApiReadyBadge({ size = "md" }: Props) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-20 flex items-center justify-center",
        "rounded-full font-canopy font-semibold",
        menuApiReadyCountClass,
        size === "sm"
          ? "-right-0.5 -top-0.5 h-4 min-w-4"
          : "-right-1 -top-1 h-5 min-w-5",
      )}
      title="API y UX listas"
      aria-label="API y UX listas"
    >
      <Check
        className={size === "sm" ? "size-2.5" : "size-3"}
        strokeWidth={3}
        aria-hidden
      />
    </span>
  )
}
