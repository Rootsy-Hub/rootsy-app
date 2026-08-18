"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  homeHarmonyWashClass,
  homeHorizonGlowClass,
  homePlanetHaloClass,
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

const AUTH_WORLD_IMAGE = "/images/rootsyplanet.jpeg"

/** Panorámica continua — un solo cielo y valle de borde a borde. */
const authWorldImageClass = "object-cover object-[28%_42%] opacity-100"

const authWorldAmbientClass =
  "object-cover object-[28%_42%] opacity-[0.14] mix-blend-soft-light blur-3xl"

/** Un ecosistema — sin corte vertical entre columnas. */
export function AuthMarketingBackdrop() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 16 }, () => ({
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.2 + 0.05,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      })),
    )
  }, [])

  const orbLayout = [
    { section: "operar" as const, left: "22%", top: "44%", size: 540, opacity: 0.55 },
    { section: "administrar" as const, left: "50%", top: "38%", size: 520, opacity: 0.38 },
    { section: "configurar" as const, left: "76%", top: "46%", size: 460, opacity: 0.32 },
  ]

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#070a09]"
      aria-hidden
    >
      {/* Resplandor central — une valle y firmamento */}
      <div
        className={cn(
          "absolute left-1/2 top-[42%] size-[min(90vw,820px)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]",
          homePlanetHaloClass("operar"),
        )}
        style={{ opacity: 0.36 }}
      />

      <div className="absolute inset-0">
        <Image
          src={AUTH_WORLD_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className={authWorldImageClass}
        />
        <Image
          src={AUTH_WORLD_IMAGE}
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className={authWorldAmbientClass}
        />
      </div>

      {/* Horizonte único — suelo compartido en todo el ancho */}
      <div
        className="absolute inset-x-0 bottom-0 h-[min(44vh,460px)]"
        style={{
          background: `
            linear-gradient(180deg, transparent 0%, rgba(7, 10, 9, 0.06) 32%, rgba(7, 10, 9, 0.38) 100%),
            radial-gradient(ellipse 70% 58% at 22% 100%, rgba(36, 173, 106, 0.12) 0%, transparent 68%),
            radial-gradient(ellipse 55% 48% at 78% 100%, rgba(56, 189, 248, 0.08) 0%, transparent 72%)
          `,
        }}
      />

      {/* Armonía de los tres mundos — pantalla completa, tenue */}
      <div
        className={cn(
          "absolute inset-0 opacity-[0.28]",
          homeHarmonyWashClass,
          "home-constellation-wash",
        )}
      />

      {orbLayout.map(({ section, left, top, size, opacity }) => (
        <div
          key={section}
          className={cn(
            "home-firmament-orb absolute rounded-full blur-[140px]",
            menuPlanetOrbClass(section),
          )}
          style={{
            width: size,
            height: size,
            left,
            top,
            opacity,
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
          "absolute inset-x-0 bottom-0 h-[42%] opacity-60",
          homeHorizonGlowClass,
        )}
      />

      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full motion-reduce:animate-none animate-float"
          style={{
            width: `${particle.width}px`,
            height: `${particle.height}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            background: "rgba(255,255,255,0.55)",
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      <div className={cn("absolute inset-0 opacity-40", homeVignetteClass)} />
    </div>
  )
}
