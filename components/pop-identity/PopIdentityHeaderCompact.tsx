"use client"

import {
  menuGhostBarClass,
  menuGhostTileClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { PopLogoLightboxButton } from "@/components/pop-identity/PopLogoLightboxButton"
import {
  eterHeaderHairlineClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"
import { buildPopLogoFallbackUrl } from "@/lib/popIdentityDisplay"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  imageUrl?: string | null
  fallbackSeed?: string
  /** `dark` = chrome del workspace; `light` = espécimen de library. */
  tone?: "dark" | "light"
  pending?: boolean
  className?: string
}

/** Header workspace · avatar cuadrado + nombre — `/library/logos` variant `header-compact`. */
export function PopIdentityHeaderCompact({
  name,
  imageUrl,
  fallbackSeed = "pop",
  tone = "dark",
  pending = false,
  className,
}: Props) {
  const trimmedName = name.trim() || "Punto de venta"
  const logoSrc =
    imageUrl?.trim() || buildPopLogoFallbackUrl(fallbackSeed || trimmedName)
  const isDark = tone === "dark"

  if (pending) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2.5", className)} aria-hidden>
        <div className={cn("size-8 shrink-0 rounded-lg", menuGhostTileClass)} />
        <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
      </div>
    )
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <PopLogoLightboxButton
        src={logoSrc}
        name={trimmedName}
        className={cn(
          "size-8",
          isDark ? eterHeaderHairlineClass : "ring-1 ring-border",
        )}
      />
      <span
        className={cn(
          "truncate text-sm font-semibold",
          isDark
            ? eterHeaderTitleClass
            : "text-[var(--rootsy-bruma-900)]/90",
        )}
      >
        {trimmedName}
      </span>
    </div>
  )
}
