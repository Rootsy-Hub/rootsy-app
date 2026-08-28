"use client"

import {
  resolveRootsButtonAtmosphere,
  type RootsButtonAtmosphere,
} from "@/components/rootsy-button/rootsButtonAtmosphere"
import { useRootsButtonAtmosphere } from "@/components/rootsy-button/rootsButtonAtmosphereContext"
import {
  rootsNaturePillClassName,
  type RootsNaturePillVariant,
} from "@/components/rootsy-pill/rootsyNaturePillStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  variant?: RootsNaturePillVariant
  atmosphere?: RootsButtonAtmosphere
  children: ReactNode
  className?: string
  title?: string
  strike?: boolean
}

export function RootsNaturePill({
  variant = "bruma",
  atmosphere,
  children,
  className,
  title,
  strike = false,
}: Props) {
  const inheritedAtmosphere = useRootsButtonAtmosphere(atmosphere)
  const resolvedAtmosphere = resolveRootsButtonAtmosphere({
    atmosphere: inheritedAtmosphere,
  })

  return (
    <span
      className={cn(
        rootsNaturePillClassName(variant, resolvedAtmosphere, strike),
        className,
      )}
      title={title}
      data-rootsy-atmosphere={resolvedAtmosphere}
    >
      {children}
    </span>
  )
}
