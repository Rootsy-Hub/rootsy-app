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
import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeGreeting } from "@/app/home/HomeGreeting"
import { HomeHeaderUserCluster } from "@/app/home/HomeHeaderUserCluster"
import {
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type HomePageChromeProps = {
  displayName: string
  userId?: string
  namePending?: boolean
  children: ReactNode
}

export function HomePageChrome({
  displayName,
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

          <HomeHeaderUserCluster userId={userId} />
        </div>
      </PopGlassChrome>

      <main className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <HomeGreeting displayName={displayName} namePending={namePending} />

          <div className="mt-7 w-full sm:mt-8">{children}</div>
        </section>

        <footer className="mt-auto flex w-full shrink-0 justify-center border-t border-white/[0.06] bg-black/10 px-4 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
          <div className="flex flex-nowrap items-center justify-center gap-3 px-1 sm:px-2">
            <p
              className={cn(
                "hidden shrink-0 whitespace-nowrap text-sm sm:block",
                menuRealmLightMutedClass,
              )}
            >
              {HOME_COPY.footerLead}
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
              {HOME_COPY.download}
            </button>
          </div>
        </footer>
      </main>
    </div>
  )
}
