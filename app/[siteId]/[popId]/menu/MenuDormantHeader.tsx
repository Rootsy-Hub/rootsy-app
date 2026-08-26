"use client"

import { menuHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import {
  menuGhostBarClass,
  menuGhostCircleClass,
  menuGhostTileClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import {
  menuSearchFieldIconClass,
  menuSearchInputClass,
  menuSearchShortcutClass,
  menuSearchShellClass,
} from "@/app/[siteId]/[popId]/menu/menuSearchFieldStyles"
import { EterIconButton } from "@/components/eter/EterIconButton"
import {
  eterHeaderDividerClass,
  eterHeaderMutedClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"
import { formatLocaleTime } from "@/lib/popTimezone"
import { cn } from "@/lib/utils"
import { Bell, Home, Search } from "lucide-react"
import { useEffect, useState } from "react"

function detectSearchShortcutLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl+K"
  const isMac =
    /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    /Mac/i.test(navigator.platform)
  return isMac ? "⌘K" : "Ctrl+K"
}

function useMenuClock() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  return time
}

function DormantSearchField({ shortcutLabel }: { shortcutLabel: string }) {
  return (
    <div
      className={cn(
        menuSearchShellClass,
        "pointer-events-none min-w-0 flex-1 opacity-50",
      )}
    >
      <Search
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2",
          menuSearchFieldIconClass,
        )}
        aria-hidden
      />
      <input
        type="search"
        placeholder="Buscar..."
        disabled
        aria-label="Buscar en el menú"
        className={cn(menuSearchInputClass, "cursor-not-allowed")}
      />
      <kbd
        className={cn(
          "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2",
          menuSearchShortcutClass,
        )}
      >
        {shortcutLabel}
      </kbd>
    </div>
  )
}

/** Header en fantasma — home y reloj son reales; buscar y alertas quedan deshabilitados. */
export function MenuDormantHeader() {
  const time = useMenuClock()
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl+K")
  const clockLabel = time ? formatLocaleTime(time) : "--:--"
  const dateLabel = time
    ? time.toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "---"

  useEffect(() => {
    setShortcutLabel(detectSearchShortcutLabel())
  }, [])

  return (
    <>
      <div className="flex h-full min-w-0 items-center gap-2 px-3 md:hidden">
        <EterIconButton href="/home" size="default" label="Ir al inicio">
          <Home aria-hidden />
        </EterIconButton>
        <div className={cn("size-9 shrink-0 rounded-lg", menuGhostTileClass)} />
        <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
        <div className="ml-auto flex items-center gap-2">
          <EterIconButton size="default" label="Notificaciones" disabled>
            <Bell aria-hidden />
          </EterIconButton>
          <span className={cn("size-10 rounded-full", menuGhostCircleClass)} />
        </div>
      </div>

      <div className={cn(menuHeaderRowClass, "hidden md:grid")}>
        <div className="flex min-w-0 items-center gap-6">
          <EterIconButton href="/home" size="large" label="Ir al inicio">
            <Home aria-hidden />
          </EterIconButton>

          <div className="flex min-w-0 items-center gap-3">
            <div className={cn("size-12 shrink-0 rounded-lg", menuGhostTileClass)} />
            <div className="min-w-0">
              <span className={cn(menuGhostBarClass, "mb-1 block h-3.5 w-24")} />
              <span className={cn(menuGhostBarClass, "block h-2.5 w-32")} />
            </div>
          </div>
        </div>

        <div className="w-full justify-self-center">
          <DormantSearchField shortcutLabel={shortcutLabel} />
        </div>

        <div className="flex min-w-0 items-center justify-end gap-6">
          <EterIconButton size="default" label="Notificaciones" disabled>
            <Bell aria-hidden />
          </EterIconButton>
          <span className={cn("h-6 w-px", eterHeaderDividerClass)} />
          <div className="flex shrink-0 flex-col items-end">
            <span className={cn("text-lg tabular-nums", eterHeaderTitleClass, "font-semibold")}>
              {clockLabel}
            </span>
            <span className={cn("text-xs uppercase tracking-wide", eterHeaderMutedClass)}>
              {dateLabel}
            </span>
          </div>
          <span className={cn("h-6 w-px", eterHeaderDividerClass)} />
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end gap-1.5 sm:flex">
              <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
              <span className={cn(menuGhostBarClass, "h-2.5 w-16")} />
            </div>
            <span className={cn("size-10 rounded-full", menuGhostCircleClass)} />
          </div>
        </div>
      </div>
    </>
  )
}
