import Link from "next/link"
import Image from "next/image"
import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HomeWorkspaceBackdrop,
  homeWorkspaceSurfaceClass,
} from "@/components/layouts/HomeWorkspaceBackdrop"
import { PopGlassChrome } from "@/components/layouts/PopGlassChrome"
import {
  menuHeaderFlexRowClass,
  menuHeaderHeightClass,
} from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { HomeHeaderUserCluster } from "@/app/home/HomeHeaderUserCluster"
import { HomeLoadError } from "@/app/home/HomeLoadError"
import {
  buildHomePopListFromAccess,
  resolveHomeAvatarUrl,
  resolveHomeDisplayName,
} from "@/app/home/homeUserDataResolve"
import type { HomePopListItem } from "@/app/home/homeUserDataTypes"
import { getInitialAuthUser } from "@/lib/getInitialAuthUser"
import { loadHomeSidecar } from "@/lib/loadHomeSidecar"
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

export default async function HomePage() {
  const user = await getInitialAuthUser()
  if (!user) return null

  let displayName = resolveHomeDisplayName(null, user)
  let avatarUrl = resolveHomeAvatarUrl(null, user)
  let pops: HomePopListItem[] = []
  let loadError = false

  try {
    const sidecar = await loadHomeSidecar()
    if (!sidecar) return null
    displayName = resolveHomeDisplayName(sidecar.profile, sidecar.user)
    avatarUrl = resolveHomeAvatarUrl(sidecar.profile, sidecar.user)
    pops = buildHomePopListFromAccess(Object.values(sidecar.batch.accessByPopId))
  } catch {
    loadError = true
  }

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col overflow-hidden text-white",
        homeWorkspaceSurfaceClass,
      )}
    >
      <HomeWorkspaceBackdrop />

      <PopGlassChrome
        borderBottom
        className={cn("relative z-20", menuHeaderHeightClass)}
      >
        <div className={menuHeaderFlexRowClass}>
          <Link
            href="/home"
            aria-label="Rootsy — inicio"
            className="inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070a09]"
          >
            <Image
              src="/rootsy-logo.svg"
              alt="Rootsy"
              width={90}
              height={29}
              priority
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="truncate text-sm font-semibold text-zinc-100">
                {displayName}
              </span>
            </div>
            <HomeHeaderUserCluster
              userName={displayName}
              userAvatarSrc={avatarUrl}
            />
          </div>
        </div>
      </PopGlassChrome>

      <main className="relative z-10 mx-auto flex min-h-0 flex-1 w-full max-w-7xl flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-5 pb-24 pt-14 sm:px-8 lg:px-10">
        <section className="w-full max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Bienvenid@ {displayName}!{" "}
            <span className="inline-block origin-bottom-right animate-[wave_2.4s_ease-in-out_infinite]">
              👋
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/70 sm:text-xl">
            A que punto de venta queres ingresar?
          </p>

          {loadError ? <HomeLoadError /> : null}

          {!loadError ? (
            <ul className="mt-12 mx-auto flex max-w-3xl list-none flex-wrap justify-center gap-x-2 gap-y-7 sm:gap-x-3">
              {pops.length === 0 ? (
                <li className="w-full max-w-md rounded-2xl border border-white/12 bg-white/5 px-6 py-10 text-center text-white/75">
                  <p className="text-base leading-relaxed">
                    No tenés puntos de venta asociados con acceso activo. Si
                    esperabas ver uno, pedí que te inviten o que activen tu rol en
                    el POP.
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
                            !popLogoSrc &&
                              cn("bg-linear-to-br", palette.accent),
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

                        {sub?.status === "trial" &&
                        sub.daysRemaining != null ? (
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
          ) : null}
        </section>

        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-4">
          <p className="hidden text-sm text-white/52 sm:block">
            Instala el sistema en tu compu y accede mas facil y rapido.
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-9 gap-2 rounded-lg border-white/20 bg-black/25 text-white/85 hover:bg-white/10 hover:text-white"
          >
            <Download className="size-4" />
            Descargar
          </Button>
        </div>
      </main>
    </div>
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
