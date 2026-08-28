"use client"

import { menuHeaderRowClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import {
  menuGhostBarClass,
  menuGhostCircleClass,
  menuGhostTileClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { menuSearchShortcutClass } from "@/app/[siteId]/[popId]/menu/menuSearchFieldStyles"
import { RootsIconButton } from "@/components/rootsy-button"
import { RootsFormSearchField, RootsFormToneProvider } from "@/components/rootsy-form"
import {
  eterHeaderDividerClass,
  eterHeaderMutedClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"
import { formatLocaleTime } from "@/lib/popTimezone"
import { cn } from "@/lib/utils"
import { Bell, Home } from "lucide-react"
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
    <div className="pointer-events-none relative min-w-0 flex-1 opacity-50">
      <RootsFormToneProvider tone="eter">
        <RootsFormSearchField
          hideLabel
          label="Buscar en el menú"
          placeholder="Buscar..."
          value=""
          onChange={() => {}}
          disabled
          className="min-w-0 gap-0"
          surface="ghost"
        />
      </RootsFormToneProvider>
      <kbd
        className={cn(
          "pointer-events-none absolute right-4 top-1/2 z-1 -translate-y-1/2",
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
        <RootsIconButton
          href="/home"
          size="default"
          label="Ir al inicio"
          semantic="tertiary"
          atmosphere="eter"
        >
          <Home aria-hidden />
        </RootsIconButton>
        <div className={cn("size-9 shrink-0 rounded-lg", menuGhostTileClass)} />
        <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
        <div className="ml-auto flex items-center gap-2">
          <RootsIconButton
            size="default"
            label="Notificaciones"
            semantic="tertiary"
            atmosphere="eter"
            disabled
          >
            <Bell aria-hidden />
          </RootsIconButton>
          <span className={cn("size-10 rounded-full", menuGhostCircleClass)} />
        </div>
      </div>

      <div className={cn(menuHeaderRowClass, "hidden md:grid")}>
        <div className="flex min-w-0 items-center gap-6">
          <RootsIconButton
            href="/home"
            size="large"
            label="Ir al inicio"
            semantic="tertiary"
            atmosphere="eter"
          >
            <Home aria-hidden />
          </RootsIconButton>

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
          <RootsIconButton
            size="default"
            label="Notificaciones"
            semantic="tertiary"
            atmosphere="eter"
            disabled
          >
            <Bell aria-hidden />
          </RootsIconButton>
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
