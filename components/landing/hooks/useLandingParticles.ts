"use client"

import { useEffect, useState } from "react"

export type LandingParticle = {
  width: number
  height: number
  left: number
  top: number
  opacity: number
  duration: number
  delay: number
}

export function useLandingParticles(count: number): LandingParticle[] {
  const [particles, setParticles] = useState<LandingParticle[]>([])

  useEffect(() => {
    if (count <= 0) {
      setParticles([])
      return
    }
    setParticles(
      Array.from({ length: count }, () => ({
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.18 + 0.04,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
      })),
    )
  }, [count])

  return particles
}
