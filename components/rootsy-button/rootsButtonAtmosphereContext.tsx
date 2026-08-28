"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"
import type { RootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphere"

const RootsButtonAtmosphereContext = createContext<RootsButtonAtmosphere | null>(null)

export function RootsButtonAtmosphereProvider({
  atmosphere,
  children,
}: {
  atmosphere: RootsButtonAtmosphere
  children: ReactNode
}) {
  return (
    <RootsButtonAtmosphereContext.Provider value={atmosphere}>
      {children}
    </RootsButtonAtmosphereContext.Provider>
  )
}

export function useRootsButtonAtmosphere(
  override?: RootsButtonAtmosphere,
): RootsButtonAtmosphere | undefined {
  const inherited = useContext(RootsButtonAtmosphereContext)
  return override ?? inherited ?? undefined
}
