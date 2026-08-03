"use client"

import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import withAuth from "@/hoc/withAuth"
import { getPopMenuData } from "@/app/[siteId]/[popId]/menu/actions"
import { MenuDock } from "@/app/[siteId]/[popId]/menu/MenuDock"
import { MenuDockDndProvider, useMenuDockEdit } from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import { MenuGridItemButton } from "@/app/[siteId]/[popId]/menu/MenuGridItemButton"
import { MenuPageSkeleton } from "@/app/[siteId]/[popId]/menu/MenuPageSkeleton"
import { canAccessMenuItem } from "@/lib/menuPermissions"
import {
  menuSectionsRaw,
  type MenuItemDef,
  type MenuItemLink,
} from "@/lib/menuCatalog"
import { formatLocaleTime } from "@/lib/popTimezone"
import { popScopedHref } from "@/lib/popRoutes"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import useEmblaCarousel from "embla-carousel-react"
import {
  Search,
  Settings,
  HelpCircle,
  Bell,
  X,
  Home,
} from "lucide-react"

type MenuSectionDef = {
  title: string
  items: MenuItemDef[]
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
    emblaApi.reInit({ watchDrag: !editing })
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

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [popName, setPopName] = useState("")
  const [popStreetAddress, setPopStreetAddress] = useState<string | null>(null)
  const [popCity, setPopCity] = useState<string | null>(null)
  const [popState, setPopState] = useState<string | null>(null)
  const [popCountry, setPopCountry] = useState<string | null>(null)
  const [popImageUrl, setPopImageUrl] = useState<string | null>(null)
  const [popBackgroundImageUrl, setPopBackgroundImageUrl] = useState<
    string | null
  >(null)
  const [permissionKeys, setPermissionKeys] = useState<string[]>([])
  const [userFullName, setUserFullName] = useState("")
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null)
  const [userRoleLabel, setUserRoleLabel] = useState("")
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("No se encontró el punto de venta.")
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await getPopMenuData(popId)
        if (cancelled) return
        if (!result.success) {
          setError(result.error || "Error al cargar")
          if (result.redirect) {
            setTimeout(() => router.push(result.redirect!), 1800)
          }
          setLoading(false)
          return
        }
        setPopName(result.pop.name)
        setPopStreetAddress(result.pop.streetAddress)
        setPopCity(result.pop.city)
        setPopState(result.pop.state)
        setPopCountry(result.pop.country)
        setPopImageUrl(result.pop.imageUrl)
        setPopBackgroundImageUrl(result.pop.backgroundImageUrl ?? null)
        setPermissionKeys(result.permissionKeys)
        setUserFullName(result.user.fullName)
        setUserImageUrl(result.user.imageUrl)
        setUserRoleLabel(result.user.roleLabel)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError("Error al cargar el menú.")
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [popId, siteId, router])

  const filteredMenuSections = useMemo(() => {
    const out: Record<string, MenuSectionDef> = {}
    for (const [key, section] of Object.entries(menuSectionsRaw)) {
      const items = section.items.filter((item) =>
        canAccessMenuItem(permissionKeys, item.link),
      )
      if (items.length > 0) {
        out[key] = { ...section, items }
      }
    }
    return out
  }, [permissionKeys])

  const sections = useMemo(
    () => Object.keys(filteredMenuSections) as (keyof typeof filteredMenuSections)[],
    [filteredMenuSections],
  )

  const activeSectionKey = sections[selectedIndex] ?? sections[0]
  const currentSection =
    activeSectionKey && filteredMenuSections[activeSectionKey]
      ? filteredMenuSections[activeSectionKey]
      : { title: "", items: [] as MenuItemDef[] }

  useEffect(() => {
    if (selectedIndex >= sections.length) {
      setSelectedIndex(0)
    }
  }, [sections.length, selectedIndex])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
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
      emblaApi.reInit()
    }
  }, [emblaApi, sections.length, filteredMenuSections])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi],
  )

  useEffect(() => {
    setIsMounted(true)
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

  const popLocationLine = useMemo(() => {
    const parts = [popCity, popState, popCountry].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : null
  }, [popCity, popState, popCountry])

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
    <MenuDockDndProvider popId={popId} permissionKeys={permissionKeys}>
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col overflow-hidden bg-background"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {popBackgroundImageUrl?.trim() ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={popBackgroundImageUrl.trim()}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-[0.22]"
            />
            <div className="absolute inset-0 bg-background/55" />
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full bg-emerald-600/5 blur-[120px]" />
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,10,9,0.7)_100%)]" />
      </div>

      <header className="relative z-20 border-b border-rootsy-hairline/80 bg-card/55 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/45">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] items-center gap-4 px-6 py-5 sm:gap-6 sm:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/home"
              className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-foreground/[0.06] bg-secondary transition-all hover:border-foreground/[0.12] hover:bg-muted active:scale-95"
            >
              <Home className="h-5 w-5 text-foreground/50 transition-colors group-hover:text-foreground/80" />
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
                {popLocationLine ? (
                  <span className="truncate text-sm text-muted-foreground">
                    {popLocationLine}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="w-full justify-self-center">
            {showSearch ? (
              <div className="relative w-full animate-in zoom-in-95 duration-200">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="h-10 w-full rounded-xl border border-border bg-secondary py-0 pl-11 pr-10 text-sm text-foreground transition-all placeholder:text-foreground/30 focus:border-foreground/20 focus:bg-muted focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 transition-colors hover:text-foreground/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                className="group flex h-10 w-full items-center gap-3 rounded-xl border border-foreground/[0.06] bg-secondary px-4 transition-all hover:border-foreground/10 hover:bg-muted"
              >
                <Search className="h-4 w-4 text-foreground/30 group-hover:text-foreground/50" />
                <span className="flex-1 text-left text-sm text-foreground/30">
                  Buscar...
                </span>
                <kbd className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-foreground/25">
                  ⌘K
                </kbd>
              </button>
            )}
          </div>

          <div className="flex min-w-0 items-center justify-end gap-6">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="group flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-muted"
              >
                <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground/70" />
              </button>
              <button
                type="button"
                className="group flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-muted"
              >
                <Settings className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground/70" />
              </button>
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
                  <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    {userRoleLabel}
                  </span>
                ) : null}
              </div>
              <DataWorkspaceHeaderUserMenu
                userName={userFullName || "Usuario"}
                userAvatarSrc={userImageUrl}
                isOnline={isOnline}
                headerVariant="default"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-28 pt-4">
        <div className="flex flex-col items-center w-full">
          <div className="mb-[32px] flex w-48 items-center justify-between rounded-xl border border-border bg-muted px-4 py-2.5 backdrop-blur-xl">
            <span className="text-sm font-bold tracking-wide text-foreground">
              {currentSection.title}
            </span>
            <div className="flex items-center gap-1.5">
              {sections.map((sectionKey, index) => (
                <button
                  key={sectionKey}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={`rounded-full transition-all duration-300 ${
                    selectedIndex === index
                      ? "size-2 bg-primary"
                      : "size-1.5 bg-foreground/25 hover:bg-foreground/50"
                  }`}
                  aria-label={filteredMenuSections[sectionKey]?.title ?? sectionKey}
                />
              ))}
            </div>
          </div>

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

                        return (
                          <MenuGridItemButton
                            key={item.name}
                            item={item}
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

      <button
        type="button"
        className="group absolute bottom-4 right-4 z-20 flex size-12 items-center justify-center rounded-full border border-border bg-muted backdrop-blur-xl transition-all hover:bg-muted/80 active:scale-95"
      >
        <HelpCircle className="size-5 text-muted-foreground transition-colors group-hover:text-foreground/70" />
      </button>
    </div>
    </MenuDockDndProvider>
  )
}

export default withAuth(MenuPage)
