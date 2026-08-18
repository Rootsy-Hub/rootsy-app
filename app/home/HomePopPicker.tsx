"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HomeLoadError } from "@/app/home/HomeLoadError"
import type { HomePopListItem } from "@/app/home/homeUserDataTypes"
import { useHomePageData } from "@/hooks/useHomePageData"
import { cn } from "@/lib/utils"

const ACCENTS = [
  {
    accent: "from-amber-400 via-yellow-500 to-orange-600",
    glow: "shadow-amber-500/35",
  },
  {
    accent: "from-emerald-400 via-teal-500 to-cyan-600",
    glow: "shadow-emerald-500/35",
  },
  {
    accent: "from-fuchsia-500 via-violet-600 to-indigo-700",
    glow: "shadow-fuchsia-500/35",
  },
  {
    accent: "from-rose-400 via-red-500 to-orange-600",
    glow: "shadow-rose-500/35",
  },
  {
    accent: "from-sky-400 via-blue-500 to-indigo-600",
    glow: "shadow-sky-500/35",
  },
] as const

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

export function HomePopPickerSkeleton() {
  return (
    <ul
      className="mt-12 mx-auto flex max-w-3xl list-none flex-wrap justify-center gap-x-2 gap-y-7 sm:gap-x-3"
      aria-busy="true"
      aria-label="Cargando puntos de venta"
    >
      {Array.from({ length: SKELETON_SLOTS }, (_, index) => (
        <li key={index} className="basis-[9.1rem] sm:basis-[9.4rem]">
          <div className="mx-auto flex w-full max-w-40 flex-col items-center">
            <div className="size-28 animate-pulse rounded-full bg-white/10 ring-2 ring-white/10" />
            <span className="mt-4 h-4 w-24 animate-pulse rounded-md bg-white/10" />
            <span className="mt-2 h-2.5 w-16 animate-pulse rounded-md bg-white/8" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function HomePopPicker({ userId }: { userId: string }) {
  const { pops, isLoading, loadError, refetchAll } = useHomePageData(userId)

  if (isLoading) return <HomePopPickerSkeleton />
  if (loadError) return <HomeLoadError onRetry={refetchAll} />

  return <HomePopPickerCards pops={pops} />
}

function HomePopPickerCards({ pops }: { pops: HomePopListItem[] }) {
  return (
    <ul className="mt-12 mx-auto flex max-w-3xl list-none flex-wrap justify-center gap-x-2 gap-y-7 sm:gap-x-3">
      {pops.length === 0 ? (
        <li className="w-full max-w-md rounded-2xl border border-white/12 bg-white/5 px-6 py-10 text-center text-white/75">
          <p className="text-base leading-relaxed">
            No tenés puntos de venta asociados con acceso activo. Si esperabas
            ver uno, pedí que te inviten o que activen tu rol en el POP.
          </p>
        </li>
      ) : (
        pops.map((pop, index) => {
          const palette = ACCENTS[index % ACCENTS.length]!
          const sigla = initialsFromName(pop.name)
          const sub = pop.subscription
          const popLogoSrc = pop.imageUrl?.trim() || null
          const canEnter = pop.canEnter
          const menuHref = `/${pop.siteId}/${pop.id}/menu`
          const subscribeHref = `/${pop.siteId}/${pop.id}/subscribe`
          const cardClassName = cn(
            "flex w-full flex-col items-center",
            !canEnter && "cursor-not-allowed opacity-55",
          )
          const cardInner = (
            <>
              <div className="relative">
                <div
                  className={cn(
                    "absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-90",
                    palette.glow,
                  )}
                />
                <div
                  className={cn(
                    "relative flex size-28 items-center justify-center overflow-hidden rounded-full shadow-xl ring-2 ring-white/14 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04]",
                    !popLogoSrc && cn("bg-linear-to-br", palette.accent),
                  )}
                >
                  {popLogoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={popLogoSrc}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-[1.72rem] font-black tracking-tight text-white drop-shadow">
                      {sigla}
                    </span>
                  )}
                </div>
                <PopStatusBadge pop={pop} />
              </div>
              <span className="mt-4 text-center text-[0.92rem] font-semibold text-white/78 transition-colors group-hover:text-white">
                {pop.name}
              </span>
              <span
                className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wider text-white/42"
                title="Site ID"
              >
                {pop.siteId}
              </span>
              {!pop.isOwner ? (
                <span className="mt-1 line-clamp-2 text-center text-[10px] font-medium uppercase tracking-wider text-white/40">
                  {pop.roleName}
                </span>
              ) : null}
            </>
          )

          return (
            <li
              key={pop.id}
              className="group basis-[9.1rem] sm:basis-[9.4rem]"
            >
              <div className="mx-auto flex w-full max-w-40 flex-col items-center">
                {canEnter ? (
                  <Link href={menuHref} className={cardClassName}>
                    {cardInner}
                  </Link>
                ) : (
                  <div className={cardClassName}>{cardInner}</div>
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

                {sub?.status === "trial" && sub.daysRemaining != null ? (
                  <p className="mt-2 max-w-40 text-center text-[10px] leading-snug text-white/55">
                    Prueba: {sub.daysRemaining} días restantes
                  </p>
                ) : null}

                {sub?.isActive &&
                sub.status === "active" &&
                sub.planDisplayName ? (
                  <p className="mt-2 max-w-40 text-center text-[10px] leading-snug text-white/55">
                    {sub.planDisplayName}
                    {sub.businessTypeDisplayName
                      ? ` · ${sub.businessTypeDisplayName}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })
      )}
    </ul>
  )
}

function PopStatusBadge({ pop }: { pop: HomePopListItem }) {
  const sub = pop.subscription

  if (sub.status === "trial") {
    return (
      <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-0 bg-amber-950/80 text-[10px] uppercase tracking-wider text-amber-100">
        Prueba
      </Badge>
    )
  }

  if (sub.isActive) {
    return (
      <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-0 bg-black/70 text-[10px] uppercase tracking-wider text-emerald-200">
        Activo
      </Badge>
    )
  }

  return (
    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-0 bg-red-950/70 text-[10px] uppercase tracking-wider text-red-100">
      Inactivo
    </Badge>
  )
}
