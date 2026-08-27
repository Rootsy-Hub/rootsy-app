"use client"

import { MenuNotificationBadge } from "@/app/[siteId]/[popId]/menu/MenuNotificationBadge"
import { RootsIconButton } from "@/components/rootsy-button"
import {
  RootsDropdownContent,
  RootsDropdownLabel,
  RootsDropdownMenu,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import {
  MENU_NOTIFICATION_DEMO_ITEMS,
  getMenuNotificationDemoTotal,
} from "@/lib/menuNotificationDemo"
import { Bell } from "lucide-react"

type Props = {
  size?: "default" | "large"
}

export function MenuNotificationsButton({ size = "default" }: Props) {
  const total = getMenuNotificationDemoTotal()

  return (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
        <span className="relative inline-flex">
          <RootsIconButton
            size={size}
            label="Notificaciones"
            semantic="tertiary"
            atmosphere="eter"
          >
            <Bell aria-hidden />
          </RootsIconButton>
          <MenuNotificationBadge count={total} size="sm" />
        </span>
      </RootsDropdownTrigger>
      <RootsDropdownContent
        theme="dark"
        align="end"
        className="w-[min(20rem,calc(100vw-1.5rem))]"
      >
        <RootsDropdownLabel theme="dark">
          Notificaciones · {total}
        </RootsDropdownLabel>
        <ul className="flex flex-col">
          {MENU_NOTIFICATION_DEMO_ITEMS.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-0.5 px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-canopy text-sm font-medium leading-5 text-[var(--rootsy-white)]">
                  {item.title}
                </p>
                <span className="shrink-0 font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-400)]">
                  {item.timeLabel}
                </span>
              </div>
              <p className="font-canopy text-xs leading-4 text-[var(--rootsy-bruma-400)]">
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </RootsDropdownContent>
    </RootsDropdownMenu>
  )
}
