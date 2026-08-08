"use client"

import { LandingAmbientProvider } from "@/components/landing/context/LandingAmbientProvider"
import { LandingNavigationProvider } from "@/components/landing/context/LandingNavigationProvider"
import { LandingShellDesktop } from "@/components/landing/shells/LandingShellDesktop"
import { LandingShellMobile } from "@/components/landing/shells/LandingShellMobile"
import type { LandingLayoutMode } from "@/components/landing/types"

type LandingShellProps = {
  layout: LandingLayoutMode
}

function LandingShellBody({ layout }: LandingShellProps) {
  if (layout === "desktop") {
    return <LandingShellDesktop />
  }
  return <LandingShellMobile />
}

export function LandingShell({ layout }: LandingShellProps) {
  return (
    <LandingNavigationProvider layout={layout}>
      <LandingAmbientProvider>
        <LandingShellBody layout={layout} />
      </LandingAmbientProvider>
    </LandingNavigationProvider>
  )
}
