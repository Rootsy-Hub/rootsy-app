"use client"

import Link from "next/link"
import { type ReactNode, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { HomeCreatePopTile } from "@/app/home/HomeCreatePopTile"
import { HOME_POP_TILE_BASIS_CLASS } from "@/app/home/homePopTileLayout"
import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeLoadError } from "@/app/home/HomeLoadError"
import { HomeGhostPlanet } from "@/app/home/HomePopPickerSkeleton"
import { HomePopPlanetTile } from "@/app/home/HomePopPlanetTile"
import { useHomeSaludoHover } from "@/app/home/HomeSaludoHover"
import type { HomePopListItem } from "@/app/home/homeUserDataTypes"
import {
  menuRealmChromeShellClass,
  menuRealmLightMutedClass,
} from "@/lib/menu/menuHoloStyles"
import { useHomePageData } from "@/hooks/useHomePageData"
import { cn } from "@/lib/utils"

const subscribeNoop = () => () => {}

function useIsHydrated() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase()
}

function HomeConstellationStage({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex w-full flex-col items-center px-4 py-4 sm:px-6">
      {children}
    </div>
  )
}

export function HomePopPicker({
  userId,
  fallback,
}: {
  userId: string
  fallback: ReactNode
}) {
  const hydrated = useIsHydrated()
  const { pops, canCreatePop, createPopPending, isLoading, loadError, refetchAll } =
    useHomePageData(userId)

  if (!hydrated || isLoading) return fallback
  if (loadError) return <HomeLoadError onRetry={refetchAll} />

  return (
    <HomePopPickerCards
      pops={pops}
      canCreatePop={canCreatePop}
      createPopPending={createPopPending}
    />
  )
}

function HomePopPickerCards({
  pops,
  canCreatePop,
  createPopPending,
}: {
  pops: HomePopListItem[]
  canCreatePop: boolean
  createPopPending: boolean
}) {
  const { setHello } = useHomeSaludoHover()
  const isSoloPop = pops.length === 1
  const showCreateTile =
    pops.length === 0 && (canCreatePop || createPopPending)

  return (
    <HomeConstellationStage>
      <ul
        className={cn(
          "mx-auto flex w-full list-none flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-x-4",
          isSoloPop ? "max-w-[13rem]" : "max-w-3xl",
        )}
      >
        {showCreateTile && createPopPending ? (
          <li className="w-full max-w-[13rem]" aria-busy="true" aria-label="Cargando">
            <HomeGhostPlanet solo />
          </li>
        ) : showCreateTile ? (
          <li className="w-full max-w-[13rem]">
            <HomeCreatePopTile />
          </li>
        ) : pops.length === 0 ? (
            <li
              className={cn(
                "w-full max-w-md rounded-2xl px-6 py-10 text-center",
                menuRealmChromeShellClass,
              )}
            >
              <p className={cn("text-base leading-relaxed", menuRealmLightMutedClass)}>
                {HOME_COPY.emptyPops}
              </p>
            </li>
        ) : (
          pops.map((pop) => {
            const sigla = initialsFromName(pop.name)
            const sub = pop.subscription
            const popLogoSrc = pop.imageUrl?.trim() || null
            const canEnter = pop.canEnter
            const menuHref = `/${pop.siteId}/${pop.id}/menu`
            const subscribeHref = `/${pop.siteId}/${pop.id}/subscribe`

            const cardInner = (
              <HomePopPlanetTile
                name={pop.name}
                imageUrl={popLogoSrc}
                initials={sigla}
                address={pop.streetAddress?.trim() || null}
                active={canEnter}
              />
            )

            return (
              <li
                key={pop.id}
                className={cn(
                  isSoloPop ? "w-full" : HOME_POP_TILE_BASIS_CLASS,
                )}
              >
                <div className="mx-auto flex w-full max-w-40 flex-col items-center">
                  {canEnter ? (
                    <Link
                      href={menuHref}
                      data-home-pop=""
                      className="group flex w-full flex-col items-center focus-visible:outline-none"
                      onMouseEnter={() => setHello(true)}
                      onMouseLeave={(event) => {
                        const next = event.relatedTarget
                        if (next instanceof Element && next.closest("[data-home-pop]")) return
                        setHello(false)
                      }}
                      onFocus={() => setHello(true)}
                      onBlur={(event) => {
                        const next = event.relatedTarget
                        if (next instanceof Element && next.closest("[data-home-pop]")) return
                        setHello(false)
                      }}
                    >
                      {cardInner}
                    </Link>
                  ) : (
                    <div
                      data-home-pop=""
                      className="flex w-full cursor-not-allowed flex-col items-center opacity-80"
                      onMouseEnter={() => setHello(true)}
                      onMouseLeave={(event) => {
                        const next = event.relatedTarget
                        if (next instanceof Element && next.closest("[data-home-pop]")) return
                        setHello(false)
                      }}
                    >
                      {cardInner}
                    </div>
                  )}

                  {pop.isOwner && !sub.isActive ? (
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="mt-3 h-8 border-white/20 bg-white/10 text-xs text-white hover:bg-white/15"
                    >
                      <Link href={subscribeHref}>{HOME_COPY.activateSubscription}</Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })
        )}
      </ul>
    </HomeConstellationStage>
  )
}
