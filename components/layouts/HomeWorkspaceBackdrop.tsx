"use client"

import { useEffect, useState } from "react"
import {
  homeHarmonyWashClass,
  homeHorizonGlowClass,
  homeVignetteClass,
  menuAmbientTopGlowClass,
  menuPlanetOrbClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/home/homeHarmony.css"
import { cn } from "@/lib/utils"

type Particle = {
  width: number
  height: number
  left: number
  top: number
  opacity: number
  duration: number
  delay: number
}

type HomeWorkspaceBackdropProps = {
  className?: string
}

/** Firmamento del reinado — tres mundos en armonía, sin seguir al cursor. */
export function HomeWorkspaceBackdrop({ className }: HomeWorkspaceBackdropProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 16 }, () => ({
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.22 + 0.06,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      })),
    )
  }, [])

  const orbPositions = [
    { left: "28%", top: "50%" },
    { left: "50%", top: "44%" },
    { left: "72%", top: "50%" },
  ] as const

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 opacity-90",
          homeHarmonyWashClass,
          "home-constellation-wash",
        )}
      />

      {(["operar", "administrar", "configurar"] as const).map((sectionKey, index) => (
        <div
          key={sectionKey}
          className={cn(
            "home-firmament-orb absolute rounded-full blur-[140px]",
            menuPlanetOrbClass(sectionKey),
          )}
          style={{
            width: 480,
            height: 480,
            left: orbPositions[index].left,
            top: orbPositions[index].top,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <div
        className={cn(
          "absolute top-0 left-1/2 h-[420px] w-[1100px] -translate-x-1/2 rounded-full blur-[120px]",
          menuAmbientTopGlowClass,
        )}
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-[45%] opacity-80",
          homeHorizonGlowClass,
        )}
      />

      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full motion-reduce:animate-none animate-float"
          style={{
            width: particle.width + "px",
            height: particle.height + "px",
            left: particle.left + "%",
            top: particle.top + "%",
            background: "rgba(255,255,255,0.55)",
            opacity: particle.opacity,
            animationDuration: particle.duration + "s",
            animationDelay: particle.delay + "s",
          }}
        />
      ))}

      <div className={cn("absolute inset-0", homeVignetteClass)} />
    </div>
  )
}

/** @deprecated Usar menuNatureShellClass en el shell raíz */
export const homeWorkspaceSurfaceClass = "bg-[#070a09]"
