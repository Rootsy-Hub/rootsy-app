"use client"

import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { MenuDock } from "@/app/[siteId]/[popId]/menu/MenuDock"
import { MenuDockDndProvider, useMenuDockEdit } from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import { MenuGridItemButton } from "@/app/[siteId]/[popId]/menu/MenuGridItemButton"
import { MenuPageHeader } from "@/app/[siteId]/[popId]/menu/MenuPageHeader"
import {
  MenuSectionNavigator,
  type MenuSectionNavItem,
} from "@/app/[siteId]/[popId]/menu/MenuSectionNavigator"
import { MenuDormantGrid } from "@/app/[siteId]/[popId]/menu/MenuDormantField"
import { MenuDormantDock } from "@/app/[siteId]/[popId]/menu/MenuDormantDock"
import { MenuDormantHeader } from "@/app/[siteId]/[popId]/menu/MenuDormantHeader"
import { MenuDormantNavigator } from "@/app/[siteId]/[popId]/menu/MenuDormantNavigator"
import { MenuDormantFirmament } from "@/app/[siteId]/[popId]/menu/MenuDormantFirmament"
import { MenuOuterEntity } from "@/app/[siteId]/[popId]/menu/MenuOuterEntity"
import { MenuRootsyPresence } from "@/app/[siteId]/[popId]/menu/MenuRootsyPresence"
import "@/app/[siteId]/[popId]/menu/menuContentReveal.css"
import {
  menuAmbientTopGlowClass,
  menuNatureShellClass,
  menuPlanetAmbientWashClass,
  menuPlanetOrbClass,
  menuVignetteClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import {
  menuPlanetGridClass,
  menuPlanetSlideClass,
} from "@/app/[siteId]/[popId]/menu/menuPlanetGridStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import {
  buildMenuSectionsFromEnabledModules,
  menuStyleSectionForModuleSection,
} from "@/lib/menuPopAccess"
import {
  type MenuItemDef,
  type MenuItemLink,
  type MenuSectionKey,
} from "@/lib/menuCatalog"
import { formatLocaleTime } from "@/lib/popTimezone"
import { popScopedHref } from "@/lib/popRoutes"
import {
  readMenuSectionPreference,
  writeMenuSectionPreference,
} from "@/lib/menuSectionPreference"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type RefObject,
} from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import useEmblaCarousel from "embla-carousel-react"

type MenuSectionDef = {
  title: string
  items: MenuItemDef[]
}

const MOBILE_MENU_SLIDE_MAX = 9

function splitItemsEvenly<T>(items: T[], maxPerSlide: number): T[][] {
  if (items.length === 0) return [[]]
  if (items.length <= maxPerSlide) return [items]
  const slideCount = Math.ceil(items.length / maxPerSlide)
  const baseSize = Math.floor(items.length / slideCount)
  const extra = items.length % slideCount
  const pages: T[][] = []
  let offset = 0
  for (let page = 0; page < slideCount; page += 1) {
    const size = baseSize + (page < extra ? 1 : 0)
    pages.push(items.slice(offset, offset + size))
    offset += size
  }
  return pages
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
  ...inputRefs: RefObject<HTMLInputElement | null>[]
) {
  setShowSearch(false)
  setSearchQuery("")
  inputRefs.forEach((inputRef) => inputRef.current?.blur())
}

function focusVisibleSearchInput(
  ...inputRefs: RefObject<HTMLInputElement | null>[]
) {
  const visible = inputRefs
    .map((inputRef) => inputRef.current)
    .find((input) => input && input.offsetParent !== null)
  visible?.focus()
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
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : ""

  const isMobile = useIsMobile()
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [searchShortcutLabel, setSearchShortcutLabel] = useState("Ctrl+K")
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const searchQueryRef = useRef(searchQuery)
  searchQueryRef.current = searchQuery
  const [time, setTime] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)
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
  const [isOnline, setIsOnline] = useState(true)

  const {
    isLoading,
    loadError,
    popAccess,
    profileFullName,
    profile,
    roleLabel,
    enabledModules,
    dockItemIds,
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
    if (selectedSectionIndex >= sections.length) {
      setSelectedSectionIndex(0)
    }
  }, [sections.length, selectedSectionIndex])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    skipSnaps: false,
    dragFree: false,
  })

  const menuSlides = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return sections.flatMap((sectionKey) => {
      const section = filteredMenuSections[sectionKey]
      const items = !section
        ? []
        : query
          ? section.items.filter((item) =>
              item.name.toLowerCase().includes(query),
            )
          : section.items
      const pages = isMobile
        ? splitItemsEvenly(items, MOBILE_MENU_SLIDE_MAX)
        : [items]
      return pages.map((pageItems, pageIndex) => ({
        sectionKey,
        pageIndex,
        items: pageItems,
      }))
    })
  }, [sections, filteredMenuSections, searchQuery, isMobile])
  const menuSlidesRef = useRef(menuSlides)
  menuSlidesRef.current = menuSlides

  useEffect(() => {
    if (!emblaApi || menuSlides.length === 0) return
    emblaApi.reInit({ loop: true })
  }, [emblaApi, menuSlides.length, isMobile])

  useEffect(() => {
    if (!emblaApi || menuSlidesRef.current.length === 0) return

    const saved = popId ? readMenuSectionPreference(popId) : null
    const savedIndex = saved ? sections.indexOf(saved) : -1
    const startSectionIndex = savedIndex >= 0 ? savedIndex : 0
    const startSectionKey = sections[startSectionIndex]
    const startSlideIndex = Math.max(
      0,
      menuSlidesRef.current.findIndex(
        (slide) => slide.sectionKey === startSectionKey,
      ),
    )

    emblaApi.scrollTo(startSlideIndex, true)
    setSelectedSectionIndex(startSectionIndex)

    const onSelect = () => {
      const next = emblaApi.selectedScrollSnap()
      const slide = menuSlidesRef.current[next]
      if (!slide) return
      const sectionIndex = sections.indexOf(slide.sectionKey)
      if (sectionIndex >= 0) {
        setSelectedSectionIndex(sectionIndex)
      }
      if (popId) {
        writeMenuSectionPreference(popId, slide.sectionKey as MenuSectionKey)
      }
    }

    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, popId, sections, isMobile])

  const scrollToSection = useCallback(
    (sectionIndex: number) => {
      if (!emblaApi) return
      const sectionKey = sections[sectionIndex]
      const slideIndex = menuSlides.findIndex(
        (slide) => slide.sectionKey === sectionKey,
      )
      if (slideIndex >= 0) {
        emblaApi.scrollTo(slideIndex)
      }
    },
    [emblaApi, sections, menuSlides],
  )

  const sectionNavItems = useMemo((): MenuSectionNavItem[] => {
    return sections.map((sectionKey) => ({
      key: sectionKey,
      title: filteredMenuSections[sectionKey]?.title ?? sectionKey,
    }))
  }, [sections, filteredMenuSections])

  const activeSectionKey = (sections[selectedSectionIndex] ??
    "operar") as MenuSectionKey

  useEffect(() => {
    setIsMounted(true)
    setSearchShortcutLabel(detectSearchShortcutLabel())
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 60_000)

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
        if (
          document.activeElement === mobileSearchRef.current ||
          document.activeElement === desktopSearchRef.current
        ) {
          return
        }
        if (!searchQueryRef.current.trim()) {
          setShowSearch(false)
        }
      }, 0)
    },
    [],
  )

  const openSearch = useCallback(() => {
    setShowSearch(true)
    window.setTimeout(
      () => focusVisibleSearchInput(mobileSearchRef, desktopSearchRef),
      0,
    )
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setShowSearch(true)
        window.setTimeout(
          () => focusVisibleSearchInput(mobileSearchRef, desktopSearchRef),
          0,
        )
        return
      }

      if (event.key === "Escape" && showSearch) {
        closeSearch(setShowSearch, setSearchQuery, mobileSearchRef, desktopSearchRef)
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

  const contentPending = !isMounted || isLoading || !popAccess
  const menuReady = !contentPending && sections.length > 0
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
  const popLogoFallback = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(popId || "pop")}&backgroundColor=1a1f1d`
  const headerPopLogoSrc = contentPending
    ? popLogoFallback
    : popImageUrl?.trim() || popLogoFallback
  const headerPopName = contentPending ? "\u00a0" : popName || "\u00a0"
  const headerPopAddress = contentPending
    ? "\u00a0"
    : popStreetAddress?.trim() || "Sin dirección"
  const headerUserName = contentPending ? "Usuario" : userFullName || "Usuario"
  const headerUserRoleLabel = contentPending ? "" : userRoleLabel
  const headerUserAvatarSrc = contentPending ? null : userImageUrl

  if (!contentPending && error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Link href="/home" className="text-sm text-primary underline">
          Volver al inicio
        </Link>
      </div>
    )
  }

  if (!contentPending && sections.length === 0) {
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
    <MenuDockDndProvider
      popId={popId}
      enabledModules={enabledModules}
      initialDockIds={dockItemIds}
    >
    <div
      className={cn(
        menuNatureShellClass,
        "menu-firmament-settle fixed inset-0 flex h-dvh max-h-dvh flex-col overflow-hidden bg-background",
      )}
      aria-busy={contentPending}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {menuReady && popBackgroundImageUrl?.trim() ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popBackgroundImageUrl.trim()}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-[0.32]"
            />
            <div className="absolute inset-0 bg-[rgba(5,12,16,0.42)]" />
          </>
        ) : null}

        {!menuReady ? (
          <MenuDormantFirmament />
        ) : (
          <>
            {(["operar", "administrar", "configurar"] as const).map((sectionKey, index) => (
              <div
                key={sectionKey}
                aria-hidden
                className={cn(
                  "absolute rounded-full blur-[150px] transition-opacity duration-[2000ms] ease-out menu-content-emerge",
                  menuPlanetOrbClass(sectionKey),
                  activeSectionKey === sectionKey ? "opacity-100" : "opacity-45",
                )}
                style={{
                  width: 520,
                  height: 520,
                  left: index === 0 ? "18%" : index === 1 ? "50%" : "82%",
                  top: index === 0 ? "38%" : index === 1 ? "48%" : "36%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            <div
              aria-hidden
              className={cn(
                "absolute inset-0 transition-opacity duration-[2000ms] ease-out menu-content-emerge",
                menuPlanetAmbientWashClass(activeSectionKey),
              )}
            />

            <div
              className={cn(
                "absolute top-0 left-1/2 h-[400px] w-[1000px] -translate-x-1/2 rounded-full blur-[120px] menu-content-emerge",
                menuAmbientTopGlowClass,
              )}
            />
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float menu-content-emerge"
                style={{
                  width: particle.width + "px",
                  height: particle.height + "px",
                  left: particle.left + "%",
                  top: particle.top + "%",
                  background: "rgba(255,255,255,0.55)",
                  opacity: particle.opacity,
                  animationDuration: particle.duration + "s",
                  animationDelay: particle.delay + "s",
                }}
              />
            ))}
            <div className={cn("absolute inset-0 menu-content-emerge", menuVignetteClass)} />
          </>
        )}
      </div>

      <MenuHeaderEntity>
        {contentPending ? (
          <MenuDormantHeader />
        ) : (
          <MenuPageHeader
            popLogoSrc={headerPopLogoSrc}
            popName={headerPopName}
            popAddress={headerPopAddress}
            userName={headerUserName}
            userAvatarSrc={headerUserAvatarSrc}
            userRoleLabel={headerUserRoleLabel}
            isOnline={isOnline}
            subscriptionsHref={
              popAccess?.isOwner ? `/${siteId}/${popId}/subscribe` : null
            }
            clockLabel={isMounted && time ? formatLocaleTime(time) : "--:--"}
            dateLabel={
              isMounted && time
                ? time.toLocaleDateString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                : "---"
            }
            showSearch={showSearch}
            searchQuery={searchQuery}
            searchShortcutLabel={searchShortcutLabel}
            mobileSearchRef={mobileSearchRef}
            desktopSearchRef={desktopSearchRef}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setShowSearch(true)}
            onSearchBlur={handleSearchBlur}
            onOpenSearch={openSearch}
            onCloseSearch={() =>
              closeSearch(
                setShowSearch,
                setSearchQuery,
                mobileSearchRef,
                desktopSearchRef,
              )
            }
          />
        )}
      </MenuHeaderEntity>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <div className="flex flex-col items-center justify-start gap-3 px-0 py-2 pb-[calc(7.25rem+env(safe-area-inset-bottom))] sm:gap-8 md:min-h-full md:flex-1 md:justify-center md:gap-14 md:py-0 md:pb-8">
          {menuReady ? (
            <MenuSectionNavigator
              className="menu-content-emerge"
              sections={sectionNavItems}
              selectedIndex={selectedSectionIndex}
              onSelect={scrollToSection}
            />
          ) : (
            <MenuDormantNavigator />
          )}

          {menuReady ? (
            <div className="menu-content-emerge w-full shrink-0 overflow-hidden" ref={emblaRef}>
              <EmblaDockEditSync emblaApi={emblaApi} />
              <div className="flex">
                {menuSlides.map((slide) => {
                  const { sectionKey, items, pageIndex } = slide

                  return (
                    <div
                      key={`${sectionKey}-${pageIndex}`}
                      className={menuPlanetSlideClass}
                    >
                      {items.length === 0 ? (
                        <p className="px-4 py-10 text-center text-sm text-white/45">
                          {searchQuery.trim()
                            ? "No encuentro nada con esa búsqueda."
                            : "Esta sección está vacía."}
                        </p>
                      ) : (
                      <div className={menuPlanetGridClass}>
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
                              key={
                                item.link !== "section"
                                  ? item.link
                                  : (item.moduleKey ?? item.name)
                              }
                              item={item}
                              sectionKey={styleSectionKey}
                              disabled={!target}
                              href={target}
                            />
                          )
                        })}
                      </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <MenuDormantGrid />
          )}
        </div>
      </div>

      <MenuOuterEntity
        variant="foot"
        floating
        className={cn(
          !menuReady && "pointer-events-none",
          menuReady && "menu-content-emerge",
        )}
      >
        {isMounted ? (
          <MenuDock siteId={siteId} popId={popId} />
        ) : (
          <MenuDormantDock />
        )}
      </MenuOuterEntity>

      <MenuRootsyPresence
        sectionKey={activeSectionKey}
        sectionTitle={sectionNavItems[selectedSectionIndex]?.title ?? "Operar"}
        siteId={siteId}
        popId={popId}
        popAccess={popAccess}
        disabled={!menuReady || !popAccess}
        className={menuReady ? "menu-content-emerge" : undefined}
      />

    </div>
    </MenuDockDndProvider>
  )
}

export default MenuPage
