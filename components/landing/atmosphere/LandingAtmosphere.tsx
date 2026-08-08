"use client"

import { LANDING_BG } from "@/components/landing/constants"
import type { LandingParticle } from "@/components/landing/hooks/useLandingParticles"

type LandingAtmosphereProps = {
  glowX?: number
  glowY?: number
  interactive?: boolean
  showParticles?: boolean
  particles?: LandingParticle[]
  richGlow?: boolean
}

export function LandingAtmosphere({
  glowX = 72,
  glowY = 48,
  interactive = false,
  showParticles = false,
  particles = [],
  richGlow = true,
}: LandingAtmosphereProps) {
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
            // Bright green aurora rising from the bottom-center (Figma hero glow)
            "radial-gradient(ellipse 64% 52% at 50% 96%, rgba(37, 254, 2, 0.26) 0%, rgba(2, 254, 133, 0.20) 34%, transparent 66%)",
            "radial-gradient(ellipse 100% 70% at 50% 108%, rgba(52, 211, 153, 0.30) 0%, transparent 62%)",
            richGlow
              ? "radial-gradient(ellipse 50% 44% at 50% 82%, rgba(168, 243, 208, 0.16), transparent 60%), radial-gradient(ellipse 80% 50% at 78% 34%, rgba(20, 184, 166, 0.07), transparent 60%)"
              : "radial-gradient(ellipse 70% 50% at 50% 92%, rgba(52, 211, 153, 0.14), transparent 60%)",
          ].join(", "),
        }}
      />
      <div className="absolute inset-0 bg-[#080c0b]/35" />

      {interactive ? (
        <div
          className="absolute rounded-full opacity-[0.07] blur-[140px] transition-all duration-[2000ms] ease-out motion-reduce:opacity-0 motion-reduce:transition-none"
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
