import { menuNotificationCountClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
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
        "pointer-events-none absolute z-20 flex items-center justify-center",
        "rounded-full font-canopy font-semibold tabular-nums",
        menuNotificationCountClass,
        size === "sm"
          ? "-right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[10px] leading-none"
          : "-right-1 -top-1 h-5 min-w-5 px-1.5 text-[11px] leading-none",
      )}
      aria-label={`${count} notificaciones`}
    >
      {formatMenuNotificationCount(count)}
    </span>
  )
}
