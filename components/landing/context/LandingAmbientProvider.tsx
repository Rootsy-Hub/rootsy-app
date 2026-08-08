"use client"

import type { ReactNode } from "react"
import { LandingAtmosphere } from "@/components/landing/atmosphere/LandingAtmosphere"
import { useLandingParticles } from "@/components/landing/hooks/useLandingParticles"
import { useLandingPointerGlow } from "@/components/landing/hooks/useLandingPointerGlow"

type LandingAmbientProviderProps = {
  children: ReactNode
}

export function LandingAmbientProvider({ children }: LandingAmbientProviderProps) {
  const glow = useLandingPointerGlow()
  const particles = useLandingParticles(9)

  return (
    <>
      <LandingAtmosphere
        glowX={glow.x}
        glowY={glow.y}
        interactive
        showParticles
        particles={particles}
        richGlow={false}
      />
      {children}
    </>
  )
}
