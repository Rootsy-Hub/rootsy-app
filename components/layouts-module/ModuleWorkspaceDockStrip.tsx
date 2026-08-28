"use client"

import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import {
  getMenuCatalogItem,
  type MenuCatalogItem,
} from "@/lib/menuCatalog"
import {
  listResolvedMenuDockItems,
  MOBILE_MAX_MENU_DOCK_ITEMS,
  resolveMenuDockIds,
} from "@/lib/menuDockPreference"
import { popMenuHref, popModuleKeyFromPath, popScopedHref } from "@/lib/popRoutes"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

const MODULE_DOCK_SHORTCUTS = MOBILE_MAX_MENU_DOCK_ITEMS

function hrefForStripItem(
  siteId: string,
  popId: string,
  item: MenuCatalogItem,
): string | null {
  if (item.id === "home" || item.href === "home") {
    return popMenuHref(siteId, popId)
  }
  if (!item.link || item.link === "section") return null
  return popScopedHref(siteId, popId, item.link)
}

export function ModuleWorkspaceDockStrip({
  siteId,
  popId,
}: {
  siteId: string
  popId: string
}) {
  const pathname = usePathname()
  const menuCache = usePopMenuCache(popId)
  const currentModule = popModuleKeyFromPath(pathname ?? "")

  const items = useMemo(() => {
    const ids = resolveMenuDockIds(
      popId,
      menuCache.enabledModules,
      menuCache.dockItemIds,
    )
    const catalog = listResolvedMenuDockItems(
      popId,
      menuCache.enabledModules,
      ids,
    )
    const home = getMenuCatalogItem("home")
    const shortcuts = catalog
      .filter((item) => item.id !== "home")
      .slice(0, MODULE_DOCK_SHORTCUTS)
    return home ? [home, ...shortcuts] : shortcuts
  }, [popId, menuCache.enabledModules, menuCache.dockItemIds])

  if (items.length === 0) return null

  return (
    <nav
      aria-label="Accesos del menú"
      className={cn(
        "md:hidden shrink-0 border-t",
        "border-[color-mix(in_srgb,var(--rootsy-eter-100)_16%,transparent)]",
        "bg-[var(--rootsy-eter-950)]",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5",
      )}
    >
      <ul className="flex items-stretch justify-around gap-0.5 px-1">
        {items.map((item) => {
          const href = hrefForStripItem(siteId, popId, item)
          if (!href) return null
          const Icon = item.icon
          const current = item.id !== "home" && item.id === currentModule
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1",
                  "outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-eter-100)_22%,transparent)]",
                  current
                    ? "text-[var(--rootsy-eter-50)]"
                    : "text-[color-mix(in_srgb,var(--rootsy-eter-100)_62%,transparent)]",
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="max-w-full truncate text-[10px] font-medium leading-none">
                  {item.id === "home" ? "Inicio" : item.name}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
