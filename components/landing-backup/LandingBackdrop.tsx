"use client"

import { useEffect, useState } from "react"

type Particle = {
  width: number
  height: number
  left: number
  top: number
  opacity: number
  duration: number
  delay: number
}

type LandingBackdropProps = {
  glowX?: number
  glowY?: number
  interactive?: boolean
  showParticles?: boolean
}

const LANDING_BG = "#070a09"

export function LandingBackdrop({
  glowX = 50,
  glowY = 50,
  interactive = false,
  showParticles = false,
}: LandingBackdropProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!showParticles) return
    setParticles(
      Array.from({ length: 12 }, () => ({
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.18 + 0.04,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      })),
    )
  }, [showParticles])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
      style={{ backgroundColor: LANDING_BG }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 85% 70% at 72% 48%, rgba(16, 185, 129, 0.07) 0%, transparent 55%)",
            "radial-gradient(ellipse 100% 55% at 50% -5%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      {interactive ? (
        <div
          className="absolute rounded-full opacity-[0.06] blur-[140px] transition-all duration-[2000ms] ease-out motion-reduce:opacity-0 motion-reduce:transition-none"
          style={{
            width: "min(100vw, 720px)",
            height: "min(100vw, 720px)",
            background:
              "radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, transparent 72%)",
            left: `${glowX}%`,
            top: `${glowY}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : null}

      {showParticles
        ? particles.map((particle, i) => (
            <div
              key={i}
              className="animate-float absolute rounded-full motion-reduce:animate-none"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                background: "var(--rootsy-particle)",
                opacity: particle.opacity,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))
        : null}
    </div>
  )
}
