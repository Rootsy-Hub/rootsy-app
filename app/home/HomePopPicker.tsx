"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { HomeLoadError } from "@/app/home/HomeLoadError"
import { HomePopPlanetTile } from "@/app/home/HomePopPlanetTile"
import type { HomePopListItem } from "@/app/home/homeUserDataTypes"
import {
  homeHarmonyWashClass,
  homePlanetHaloClass,
  menuPlanetAmbientWashClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import {
  menuHoloLabelClass,
  menuHoloLabelDockPlacedClass,
  menuHoloSectionForSkeletonIndex,
  menuHoloTileMotionClass,
  menuHoloTileSkeletonIconForSection,
  menuHoloTileSkeletonLabelClass,
  menuRealmChromeShellClass,
  menuRealmLightMutedClass,
} from "@/lib/menu/menuHoloStyles"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { useHomePageData } from "@/hooks/useHomePageData"
import { cn } from "@/lib/utils"

const SKELETON_SLOTS = 4

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

function popMetaLine(pop: HomePopListItem): string | null {
  const parts: string[] = []
  const sub = pop.subscription

  if (sub.status === "trial" && sub.daysRemaining != null) {
    parts.push(`Prueba · ${sub.daysRemaining} días`)
  } else if (sub.isActive) {
    parts.push("Activo")
  } else {
    parts.push("Inactivo")
  }

  parts.push(pop.siteId)

  if (!pop.isOwner && pop.roleName) {
    parts.push(pop.roleName)
  }

  if (sub.isActive && sub.planDisplayName) {
    parts.push(sub.planDisplayName)
    if (sub.businessTypeDisplayName) {
      parts.push(sub.businessTypeDisplayName)
    }
  }

  return parts.join(" · ")
}

function HomeConstellationStage({
  sectionKey,
  solo,
  children,
}: {
  sectionKey: MenuSectionKey
  solo: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center",
        solo ? "px-6 py-5 sm:px-8 sm:py-6" : "px-4 py-4 sm:px-6",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[2rem] opacity-90",
          solo ? menuPlanetAmbientWashClass(sectionKey) : homeHarmonyWashClass,
          "home-constellation-wash",
        )}
      />
      {solo ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-[38%] size-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-80 sm:size-64",
            homePlanetHaloClass(sectionKey),
          )}
        />
      ) : null}
      <div className="relative z-[1] w-full">{children}</div>
    </div>
  )
}

export function HomePopPickerSkeleton() {
  return (
    <HomeConstellationStage sectionKey="operar" solo={false}>
      <ul
        className="mx-auto flex w-full max-w-3xl list-none flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-x-4"
        aria-busy="true"
        aria-label="Cargando puntos de venta"
      >
        {Array.from({ length: SKELETON_SLOTS }, (_, index) => {
          const sectionKey = menuHoloSectionForSkeletonIndex(index)
          return (
            <li key={index} className="basis-[9.1rem] sm:basis-[9.4rem]">
              <div className="mx-auto flex w-full max-w-40 flex-col items-center">
                <div
                  aria-hidden
                  className={cn(
                    menuHoloTileSkeletonIconForSection(sectionKey),
                    "size-28 rounded-full",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(menuHoloTileSkeletonLabelClass, "mt-3 w-24")}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </HomeConstellationStage>
  )
}

export function HomePopPicker({ userId }: { userId: string }) {
  const { pops, isLoading, loadError, refetchAll } = useHomePageData(userId)

  if (isLoading) return <HomePopPickerSkeleton />
  if (loadError) return <HomeLoadError onRetry={refetchAll} />

  return <HomePopPickerCards pops={pops} />
}

function HomePopPickerCards({ pops }: { pops: HomePopListItem[] }) {
  const isSoloPop = pops.length === 1
  const primarySection = menuHoloSectionForSkeletonIndex(0)

  return (
    <HomeConstellationStage sectionKey={primarySection} solo={isSoloPop}>
      <ul
        className={cn(
          "mx-auto flex w-full list-none flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-x-4",
          isSoloPop ? "max-w-[13rem]" : "max-w-3xl",
        )}
      >
        {pops.length === 0 ? (
          <li
            className={cn(
              "w-full max-w-md rounded-2xl px-6 py-10 text-center",
              menuRealmChromeShellClass,
            )}
          >
            <p className={cn("text-base leading-relaxed", menuRealmLightMutedClass)}>
              No tenés puntos de venta asociados con acceso activo. Si esperabas
              ver uno, pedí que te inviten o que activen tu rol en el POP.
            </p>
          </li>
        ) : (
          pops.map((pop, index) => {
            const sectionKey = menuHoloSectionForSkeletonIndex(index)
            const sigla = initialsFromName(pop.name)
            const sub = pop.subscription
            const popLogoSrc = pop.imageUrl?.trim() || null
            const canEnter = pop.canEnter
            const menuHref = `/${pop.siteId}/${pop.id}/menu`
            const subscribeHref = `/${pop.siteId}/${pop.id}/subscribe`
            const metaLine = popMetaLine(pop)

            const cardInner = (
              <>
                <HomePopPlanetTile
                  sectionKey={sectionKey}
                  name={pop.name}
                  imageUrl={popLogoSrc}
                  initials={sigla}
                  alive={canEnter}
                  solo={isSoloPop}
                />
                <span
                  className={cn(
                    "mt-3 text-center line-clamp-2",
                    canEnter ? menuHoloLabelClass : menuHoloLabelDockPlacedClass,
                  )}
                >
                  {pop.name}
                </span>
                {metaLine ? (
                  <span
                    className={cn(
                      "mt-1.5 max-w-[13rem] text-center text-xs leading-relaxed",
                      menuRealmLightMutedClass,
                    )}
                  >
                    {metaLine}
                  </span>
                ) : null}
              </>
            )

            return (
              <li
                key={pop.id}
                className={cn(
                  isSoloPop ? "w-full" : "basis-[9.1rem] sm:basis-[9.4rem]",
                )}
              >
                <div className="mx-auto flex w-full max-w-40 flex-col items-center">
                  {canEnter ? (
                    <Link
                      href={menuHref}
                      className={cn(
                        "group flex w-full flex-col items-center focus-visible:outline-none",
                        menuHoloTileMotionClass,
                      )}
                    >
                      {cardInner}
                    </Link>
                  ) : (
                    <div className="flex w-full cursor-not-allowed flex-col items-center opacity-80">
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
                      <Link href={subscribeHref}>Activar suscripción</Link>
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
