import { Download } from "lucide-react"
import {
  HomeWorkspaceBackdrop,
} from "@/components/layouts/HomeWorkspaceBackdrop"
import { menuNatureShellClass } from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeGreeting } from "@/app/home/HomeGreeting"
import { HomeSaludoHoverProvider } from "@/app/home/HomeSaludoHover"
import { HomePageHeader } from "@/app/home/HomePageHeader"
import { HomeSubtleButton } from "@/app/home/HomeSubtleButton"
import { menuRealmLightMutedClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type HomePageChromeProps = {
  displayName: string
  userId?: string
  loading?: boolean
  namePending?: boolean
  children: ReactNode
}

export function HomePageChrome({
  displayName,
  userId,
  loading,
  namePending = false,
  children,
}: HomePageChromeProps) {
  return (
    <div
      className={cn(
        "relative flex h-dvh max-h-dvh flex-col overflow-hidden text-white",
        menuNatureShellClass,
        "bg-background",
      )}
    >
      <HomeWorkspaceBackdrop />

      <HomePageHeader userId={userId} loading={loading} />

      <main className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto">
        <section className="mx-auto flex min-h-0 w-full max-w-[81rem] flex-1 flex-col items-center justify-center px-4 py-5 sm:px-8 sm:py-8">
          <HomeSaludoHoverProvider>
            <HomeGreeting displayName={displayName} namePending={namePending} />

            <div className="mt-5 w-full sm:mt-8">{children}</div>
          </HomeSaludoHoverProvider>
        </section>

        <footer className="relative mt-auto flex w-full shrink-0 justify-center px-4 py-3 sm:px-6 sm:py-5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex flex-nowrap items-center justify-center gap-3 px-1 sm:px-2">
            <p
              className={cn(
                "hidden shrink-0 whitespace-nowrap text-sm md:block",
                menuRealmLightMutedClass,
              )}
            >
              {HOME_COPY.footerLead}
            </p>
            <HomeSubtleButton withIcon>
              <Download className="size-4" aria-hidden />
              {HOME_COPY.download}
            </HomeSubtleButton>
          </div>
        </footer>
      </main>
    </div>
  )
}
