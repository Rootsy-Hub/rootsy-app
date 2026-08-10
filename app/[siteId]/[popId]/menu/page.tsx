"use client"

import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { dataWorkspaceHeaderRoleLabelClass } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { RootsIconButton, rootsIconButtonClass } from "@/components/rootsy-button"
import withAuth from "@/hoc/withAuth"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { MenuDock } from "@/app/[siteId]/[popId]/menu/MenuDock"
import { MenuDockDndProvider, useMenuDockEdit } from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import { MenuGridItemButton } from "@/app/[siteId]/[popId]/menu/MenuGridItemButton"
import {
  MenuSectionNavigator,
  type MenuSectionNavItem,
} from "@/app/[siteId]/[popId]/menu/MenuSectionNavigator"
import { MenuPageSkeleton } from "@/app/[siteId]/[popId]/menu/MenuPageSkeleton"
import {
  menuAmbientTopGlowClass,
  menuNatureShellClass,
  menuVignetteClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import {
  menuHeaderBorderClass,
  menuHeaderChromeClass,
} from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import {
  menuSearchClearButtonClass,
  menuSearchFieldActiveClass,
  menuSearchFieldIconClass,
  menuSearchFieldIdleClass,
  menuSearchInputClass,
  menuSearchShellClass,
  menuSearchShortcutClass,
} from "@/app/[siteId]/[popId]/menu/menuSearchFieldStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import {
  buildMenuSectionsFromEnabledModules,
  menuStyleSectionForModuleSection,
} from "@/lib/menuPopAccess"
import {
  type MenuItemDef,
  type MenuItemLink,
} from "@/lib/menuCatalog"
import { formatLocaleTime } from "@/lib/popTimezone"
import { popScopedHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef, useCallback, useMemo, type RefObject } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import useEmblaCarousel from "embla-carousel-react"
import {
  Search,
  HelpCircle,
  Bell,
  X,
  Home,
} from "lucide-react"

type MenuSectionDef = {
  title: string
  items: MenuItemDef[]
}

function detectSearchShortcutLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl+K"
  const isMac =
    /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    /Mac/i.test(navigator.platform)
  return isMac ? "⌘K" : "Ctrl+K"
}

function closeSearch(
  setShowSearch: (value: boolean) => void,
  setSearchQuery: (value: string) => void,
  inputRef?: RefObject<HTMLInputElement | null>,
) {
  setShowSearch(false)
  setSearchQuery("")
  inputRef?.current?.blur()
}

function routeForMenuLink(
  siteId: string,
  popId: string,
  link: MenuItemLink | undefined,
): string | null {
  if (!link || link === "section") return null
  return popScopedHref(siteId, popId, link)
}

function EmblaDockEditSync({
  emblaApi,
}: {
  emblaApi: ReturnType<typeof useEmblaCarousel>[1]
}) {
  const { editing } = useMenuDockEdit()

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit({ watchDrag: !editing, loop: true })
  }, [emblaApi, editing])

  return null
}

function MenuPage() {
  const router = useRouter()
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [searchShortcutLabel, setSearchShortcutLabel] = useState("Ctrl+K")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchQueryRef = useRef(searchQuery)
  searchQueryRef.current = searchQuery
  const [time, setTime] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [particles, setParticles] = useState<
    Array<{
      width: number
      height: number
      left: number
      top: number
      opacity: number
      duration: number
      delay: number
    }>
  >([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOnline, setIsOnline] = useState(true)

  const {
    isLoading,
    loadError,
    popAccess,
    profileFullName,
    profile,
    roleLabel,
    enabledModules,
  } = usePopMenuCache(popId)

  const filteredMenuSections = useMemo(
    () => buildMenuSectionsFromEnabledModules(enabledModules),
    [enabledModules],
  )

  const sections = useMemo(
    () => Object.keys(filteredMenuSections) as (keyof typeof filteredMenuSections)[],
    [filteredMenuSections],
  )

  useEffect(() => {
    if (selectedIndex >= sections.length) {
      setSelectedIndex(0)
    }
  }, [sections.length, selectedIndex])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    dragFree: false,
  })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (emblaApi && sections.length > 0) {
      emblaApi.reInit({ loop: true })
    }
  }, [emblaApi, sections.length, filteredMenuSections])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi],
  )

  const sectionNavItems = useMemo((): MenuSectionNavItem[] => {
    return sections.map((sectionKey) => ({
      key: sectionKey,
      title: filteredMenuSections[sectionKey]?.title ?? sectionKey,
    }))
  }, [sections, filteredMenuSections])

  useEffect(() => {
    setIsMounted(true)
    setSearchShortcutLabel(detectSearchShortcutLabel())
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)

    setParticles(
      Array.from({ length: 12 }, () => ({
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.2 + 0.05,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      })),
    )

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSearchBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const related = event.relatedTarget
      if (
        related instanceof HTMLElement &&
        related.closest("[data-menu-search-close]")
      ) {
        return
      }

      window.setTimeout(() => {
        if (document.activeElement === searchInputRef.current) return
        if (!searchQueryRef.current.trim()) {
          setShowSearch(false)
        }
      }, 0)
    },
    [],
  )

  const openSearch = useCallback(() => {
    setShowSearch(true)
    window.setTimeout(() => searchInputRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setShowSearch(true)
        window.setTimeout(() => searchInputRef.current?.focus(), 0)
        return
      }

      if (event.key === "Escape" && showSearch) {
        closeSearch(setShowSearch, setSearchQuery, searchInputRef)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showSearch])

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine)
    sync()
    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)
    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
    }
  }, [])

  const getFilteredItems = (sectionKey: string) => {
    const section = filteredMenuSections[sectionKey]
    if (!section) return []
    return searchQuery
      ? section.items.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : section.items
  }

  const popName = popAccess?.pop.name ?? ""
  const popStreetAddress = popAccess?.pop.streetAddress ?? null
  const popImageUrl = popAccess?.pop.imageUrl ?? null
  const popBackgroundImageUrl = popAccess?.pop.backgroundImageUrl ?? null
  const userFullName = profileFullName
  const userImageUrl = profile?.imageUrl ?? null
  const userRoleLabel = roleLabel

  const cacheMismatch =
    popAccess != null &&
    popAccess.pop.siteId.trim().toLowerCase() !== siteId.trim().toLowerCase()

  const loading = isLoading
  const error =
    !popId || !siteId
      ? "No se encontró el punto de venta."
      : loadError
        ? "Error al cargar el menú."
        : cacheMismatch
          ? "La URL no coincide con este punto de venta."
          : popAccess && !popAccess.canEnter
            ? "No tenés acceso activo a este punto de venta."
            : null
  const popLogoSrc =
    popImageUrl?.trim() ||
    `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId || "pop")}&backgroundColor=1a1f1d`

  if (loading) {
    return <MenuPageSkeleton />
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Link href="/home" className="text-sm text-primary underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          No tenés permisos de lectura para ninguna sección de este punto de
          venta. Pedile a un administrador que ajuste tu rol.
        </p>
        <Link
          href="/home"
          className="rounded-xl border border-border px-4 py-2 text-sm"
        >
          Ir al inicio
        </Link>
      </div>
    )
  }

  return (
    <MenuDockDndProvider popId={popId} enabledModules={enabledModules}>
    <div
      ref={containerRef}
      className={cn(menuNatureShellClass, "fixed inset-0 flex flex-col overflow-hidden bg-background")}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {popBackgroundImageUrl?.trim() ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popBackgroundImageUrl.trim()}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-[0.40]"
            />
            <div className="absolute inset-0 bg-background/32" />
          </>
        ) : null}
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-10 blur-[150px] transition-all duration-[2000ms] ease-out"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--rootsy-particle) 50%, transparent) 0%, transparent 70%)",
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full blur-[120px]", menuAmbientTopGlowClass)} />
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: particle.width + "px",
              height: particle.height + "px",
              left: particle.left + "%",
              top: particle.top + "%",
              background: "var(--rootsy-particle)",
              opacity: particle.opacity,
              animationDuration: particle.duration + "s",
              animationDelay: particle.delay + "s",
            }}
          />
        ))}
        <div className={cn("absolute inset-0", menuVignetteClass)} />
      </div>

      <header
        className={cn(
          "relative z-20 border-b",
          menuHeaderBorderClass,
          menuHeaderChromeClass,
        )}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] items-center gap-4 px-6 py-5 sm:gap-6 sm:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/home"
              aria-label="Ir al inicio"
              className={rootsIconButtonClass({
                tone: "secondary",
                surface: "dark",
                size: "large",
              })}
            >
              <Home className="size-5" aria-hidden />
            </Link>

            <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />

            <div className="flex min-w-0 items-center gap-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border">
                <img
                  src={popLogoSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-base font-bold tracking-tight text-foreground">
                  {popName}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {popStreetAddress?.trim() || "Sin dirección"}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full justify-self-center">
            <div
              className={cn(
                menuSearchShellClass,
                !showSearch && "cursor-text",
              )}
              onClick={(event) => {
                if (showSearch) return
                if (event.target instanceof HTMLInputElement) return
                openSearch()
              }}
            >
              <Search
                className={cn(
                  "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2",
                  menuSearchFieldIconClass,
                )}
                aria-hidden
              />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={handleSearchBlur}
                aria-label="Buscar en el menú"
                aria-expanded={showSearch}
                className={cn(
                  menuSearchInputClass,
                  showSearch
                    ? menuSearchFieldActiveClass
                    : menuSearchFieldIdleClass,
                )}
              />
              {showSearch ? (
                <button
                  type="button"
                  data-menu-search-close
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.stopPropagation()
                    closeSearch(setShowSearch, setSearchQuery, searchInputRef)
                  }}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2",
                    menuSearchClearButtonClass,
                  )}
                  aria-label="Cerrar búsqueda"
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : (
                <kbd
                  className={cn(
                    "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2",
                    menuSearchShortcutClass,
                  )}
                >
                  {searchShortcutLabel}
                </kbd>
              )}
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-6">
            <div className="flex items-center gap-1">
              <RootsIconButton
                tone="ghost"
                surface="dark"
                size="default"
                label="Notificaciones"
              >
                <Bell aria-hidden />
              </RootsIconButton>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex shrink-0 flex-col items-end">
              <span className="text-lg font-bold tabular-nums text-foreground">
                {isMounted && time
                  ? formatLocaleTime(time)
                  : "--:--"}
              </span>
              <span className="text-xs uppercase tracking-wide text-foreground/30">
                {isMounted && time
                  ? time.toLocaleDateString("es-AR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "---"}
              </span>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden min-w-0 flex-col leading-tight sm:flex">
                <span className="truncate text-sm font-semibold text-foreground/90">
                  {userFullName || "Usuario"}
                </span>
                {userRoleLabel ? (
                  <span
                    className={cn(
                      "truncate text-[10px] font-semibold uppercase tracking-wider",
                      dataWorkspaceHeaderRoleLabelClass(
                        "dark",
                        Boolean(userRoleLabel),
                      ),
                    )}
                  >
                    {userRoleLabel}
                  </span>
                ) : null}
              </div>
              <DataWorkspaceHeaderUserMenu
                userName={userFullName || "Usuario"}
                userAvatarSrc={userImageUrl}
                isOnline={isOnline}
                headerVariant="dark"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-28 pt-4">
        <div className="flex flex-col items-center w-full">
          <MenuSectionNavigator
            sections={sectionNavItems}
            selectedIndex={selectedIndex}
            onSelect={scrollTo}
          />

          <div className="w-full overflow-hidden" ref={emblaRef}>
            <EmblaDockEditSync emblaApi={emblaApi} />
            <div className="flex">
              {sections.map((sectionKey) => {
                const items = getFilteredItems(sectionKey)

                return (
                  <div key={sectionKey} className="flex-[0_0_100%] min-w-0 px-8">
                    <div className="grid grid-cols-6 gap-x-0 gap-y-8 max-w-4xl mx-auto min-h-[280px] py-6 px-6 select-none">
                      {items.map((item) => {
                        const target = routeForMenuLink(siteId, popId, item.link)
                        const styleSectionKey =
                          menuStyleSectionForModuleSection(
                            sectionKey as
                              | "operar"
                              | "administrar"
                              | "configurar"
                              | "extras",
                          )

                        return (
                          <MenuGridItemButton
                            key={item.moduleKey ?? item.name}
                            item={item}
                            sectionKey={styleSectionKey}
                            disabled={!target}
                            onActivate={() => {
                              if (target) router.push(target)
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <MenuDock siteId={siteId} popId={popId} />

      <RootsIconButton
        type="button"
        tone="ghost"
        surface="dark"
        size="large"
        label="Ayuda"
        className="absolute bottom-4 right-4 z-20 rounded-full"
      >
        <HelpCircle aria-hidden />
      </RootsIconButton>
    </div>
    </MenuDockDndProvider>
  )
}

export default withAuth(MenuPage)
