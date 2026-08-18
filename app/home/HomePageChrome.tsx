import Link from "next/link"
import Image from "next/image"
import { Download } from "lucide-react"
import {
  HomeWorkspaceBackdrop,
} from "@/components/layouts/HomeWorkspaceBackdrop"
import { PopGlassChrome } from "@/components/layouts/PopGlassChrome"
import {
  menuHeaderFlexRowClass,
  menuHeaderHeightClass,
} from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import "@/app/home/homeHarmony.css"
import { HomeHeaderUserCluster } from "@/app/home/HomeHeaderUserCluster"
import {
  menuRealmBodyClass,
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
  menuRealmTitleClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type HomePageChromeProps = {
  displayName: string
  avatarUrl: string | null
  userId?: string
  namePending?: boolean
  children: ReactNode
}

export function HomePageChrome({
  displayName,
  avatarUrl,
  userId,
  namePending = false,
  children,
}: HomePageChromeProps) {
  return (
    <div
      className={cn(
        "relative flex h-screen flex-col overflow-hidden text-white",
        menuNatureShellClass,
        "bg-background",
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
            className="inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,255,255,0.22)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
              {namePending ? (
                <span
                  className="h-4 w-28 animate-pulse rounded-md bg-white/12"
                  aria-hidden
                />
              ) : (
                <span className={cn("truncate text-sm", menuRealmBodyClass)}>
                  {displayName}
                </span>
              )}
            </div>
            <HomeHeaderUserCluster
              userName={namePending ? "" : displayName}
              userAvatarSrc={avatarUrl}
              userId={userId}
            />
          </div>
        </div>
      </PopGlassChrome>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-x-hidden overflow-y-auto px-5 sm:px-8 lg:px-10">
        <section className="flex min-h-0 flex-1 flex-col items-center justify-center py-6 sm:py-8">
          <div className="w-full max-w-xl text-center">
            <h1 className={cn("text-balance text-3xl sm:text-4xl", menuRealmTitleClass)}>
              {namePending ? (
                <>
                  Bienvenid@{" "}
                  <span
                    className="inline-block h-8 w-36 align-middle animate-pulse rounded-md bg-white/12 sm:h-9 sm:w-44"
                    aria-hidden
                  />
                </>
              ) : (
                <>Bienvenid@ {displayName}!</>
              )}{" "}
              <span className="inline-block origin-bottom-right animate-[wave_2.4s_ease-in-out_infinite]">
                👋
              </span>
            </h1>
            <p className={cn("mt-2 text-base sm:text-lg", menuRealmLightMutedClass)}>
              A que punto de venta queres ingresar?
            </p>
          </div>

          <div className="mt-7 w-full sm:mt-8">{children}</div>
        </section>

        <footer className="mt-auto flex shrink-0 justify-center border-t border-white/[0.06] bg-black/10 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
          <div
            className={cn(
              "flex max-w-lg items-center gap-3 px-1 sm:px-2",
            )}
          >
            <p className={cn("hidden text-sm sm:block", menuRealmLightMutedClass)}>
              Instala el sistema en tu compu y accede mas facil y rapido.
            </p>
            <button
              type="button"
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                menuRealmLightStaticClass,
                "hover:text-white",
              )}
            >
              <Download className="size-4" aria-hidden />
              Descargar
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}
