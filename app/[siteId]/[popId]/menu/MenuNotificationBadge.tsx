import { cn } from "@/lib/utils"

type Props = {
  count: number
  size?: "sm" | "md"
}

export function formatMenuNotificationCount(count: number): string {
  if (count > 9) return "9+"
  return String(count)
}

export function MenuNotificationBadge({ count, size = "md" }: Props) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        "pointer-events-none absolute z-20 flex items-center justify-center rounded-full",
        "bg-[color:var(--rootsy-danger)] font-semibold tabular-nums text-white",
        "shadow-[0_1px_3px_rgba(0,0,0,0.28)] ring-1 ring-white/90 md:ring-2",
        size === "sm"
          ? "-right-0.5 -top-0.5 min-w-[11px] px-0.5 text-[7px] leading-none md:min-w-[15px] md:text-[9px]"
          : "-right-0.5 -top-0.5 min-w-3 px-0.5 text-[8px] leading-none md:-right-1 md:-top-1 md:min-w-5 md:text-[11px]",
        size === "sm"
          ? "h-[11px] md:h-[15px]"
          : "h-3 md:h-5",
      )}
      aria-label={`${count} notificaciones`}
    >
      {formatMenuNotificationCount(count)}
    </span>
  )
}
