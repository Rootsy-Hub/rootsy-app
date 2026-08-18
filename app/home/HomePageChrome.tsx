import Link from "next/link"
import Image from "next/image"
import { Download } from "lucide-react"
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
              {namePending ? (
                <span
                  className="h-4 w-28 animate-pulse rounded-md bg-white/12"
                  aria-hidden
                />
              ) : (
                <span className="truncate text-sm font-semibold text-zinc-100">
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

      <main className="relative z-10 mx-auto flex min-h-0 flex-1 w-full max-w-7xl flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-5 pb-24 pt-14 sm:px-8 lg:px-10">
        <section className="w-full max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {namePending ? (
              <>
                Bienvenid@{" "}
                <span
                  className="inline-block h-9 w-40 align-middle animate-pulse rounded-md bg-white/12 sm:h-11 sm:w-48"
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
          <p className="mt-6 text-lg text-white/70 sm:text-xl">
            A que punto de venta queres ingresar?
          </p>

          {children}
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
