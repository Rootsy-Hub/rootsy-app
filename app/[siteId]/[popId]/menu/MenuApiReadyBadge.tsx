import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type Props = {
  size?: "sm" | "md"
}

export function MenuApiReadyBadge({ size = "md" }: Props) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-20 flex items-center justify-center rounded-full",
        "bg-[color:var(--rootsy-savia-500)] text-white",
        "shadow-[0_1px_3px_rgba(0,0,0,0.28)] ring-2 ring-white/90",
        size === "sm"
          ? "-right-0.5 -top-0.5 size-[15px]"
          : "-right-1 -top-1 size-[18px] sm:size-5",
      )}
      title="API y UX listas"
      aria-label="API y UX listas"
    >
      <Check
        className={size === "sm" ? "size-2.5" : "size-2.5 sm:size-3"}
        strokeWidth={3}
        aria-hidden
      />
    </span>
  )
}
