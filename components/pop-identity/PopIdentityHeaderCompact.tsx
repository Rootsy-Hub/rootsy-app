"use client"

import { Avatar } from "@/components/Avatar"
import {
  menuGhostBarClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { PopLogoLightboxButton } from "@/components/pop-identity/PopLogoLightboxButton"
import {
  eterHeaderHairlineClass,
  eterHeaderTitleClass,
} from "@/lib/eter/eterChrome"
import { buildPopLogoFallbackUrl } from "@/lib/popIdentityDisplay"
import { PopLink as Link } from "@/lib/pop-spa/PopLink"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  imageUrl?: string | null
  fallbackSeed?: string
  /** `dark` = chrome del workspace; `light` = espécimen de library. */
  tone?: "dark" | "light"
  pending?: boolean
  className?: string
  /** Si hay href, isotipo y nombre van a esa ruta (menú del POP). */
  href?: string
}

/** Header workspace · avatar cuadrado + nombre — `/library/logos` variant `header-compact`. */
export function PopIdentityHeaderCompact({
  name,
  imageUrl,
  fallbackSeed = "pop",
  tone = "dark",
  pending = false,
  className,
  href,
}: Props) {
  const trimmedName = name.trim() || "Punto de venta"
  const logoSrc =
    imageUrl?.trim() || buildPopLogoFallbackUrl(fallbackSeed || trimmedName)
  const isDark = tone === "dark"

  if (pending) {
    return (
      <div className={cn("flex min-w-0 items-center gap-2.5", className)} aria-hidden>
        <Avatar pending initials={trimmedName.slice(0, 2).toUpperCase() || "·"} size="md" shape="square" />
        <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
      </div>
    )
  }

  const identity = (
    <>
      {href ? (
        <Avatar
          imageUrl={logoSrc}
          initials={trimmedName.slice(0, 2).toUpperCase() || "·"}
          size="md"
          shape="square"
          className={cn(isDark ? eterHeaderHairlineClass : "ring-1 ring-border")}
        />
      ) : (
        <PopLogoLightboxButton
          src={logoSrc}
          name={trimmedName}
          className={cn(
            "size-8",
            isDark ? eterHeaderHairlineClass : "ring-1 ring-border",
          )}
        />
      )}
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
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`Ir al menú de ${trimmedName}`}
        className={cn(
          "flex min-w-0 items-center gap-2.5 rounded-lg outline-none",
          "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-eter-100)_22%,transparent)]",
          className,
        )}
      >
        {identity}
      </Link>
    )
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {identity}
    </div>
  )
}
