"use client"

import { EterIconButton } from "@/components/eter/EterIconButton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  MENU_NOTIFICATION_DEMO_ITEMS,
  getMenuNotificationDemoTotal,
} from "@/lib/menuNotificationDemo"
import { cn } from "@/lib/utils"
import { Bell } from "lucide-react"
import { formatMenuNotificationCount } from "@/app/[siteId]/[popId]/menu/MenuNotificationBadge"

type Props = {
  size?: "default" | "large"
}

export function MenuNotificationsButton({ size = "default" }: Props) {
  const total = getMenuNotificationDemoTotal()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="relative inline-flex">
          <EterIconButton size={size} label="Notificaciones">
            <Bell aria-hidden />
          </EterIconButton>
          {total > 0 ? (
            <span
              className={cn(
                "pointer-events-none absolute -right-0.5 -top-0.5 z-20 flex h-4 min-w-4 items-center justify-center rounded-full px-1",
                "bg-[color:var(--rootsy-danger)] text-[10px] font-semibold tabular-nums leading-none text-white",
                "ring-1 ring-white/90",
              )}
              aria-hidden
            >
              {formatMenuNotificationCount(total)}
            </span>
          ) : null}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className={cn(
          "menu-pop-chrome w-[min(22rem,calc(100vw-1.5rem))] border-white/12 p-0 text-white",
          "bg-[color-mix(in_srgb,var(--rootsy-eter-900)_88%,transparent)] shadow-[0_16px_40px_rgba(0,0,0,0.35)]",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-sm font-semibold">Notificaciones</p>
          <span className="text-xs text-white/50">{total} sin leer</span>
        </div>
        <ul className="max-h-[min(22rem,50vh)] overflow-y-auto py-1">
          {MENU_NOTIFICATION_DEMO_ITEMS.map((item) => (
            <li
              key={item.id}
              className="border-b border-white/6 px-4 py-3 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-snug">{item.title}</p>
                <span className="shrink-0 text-[11px] text-white/40">
                  {item.timeLabel}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/55">{item.detail}</p>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
