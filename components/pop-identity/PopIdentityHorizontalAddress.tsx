"use client"

import {
  buildPopLogoFallbackUrl,
  formatPopDisplayAddress,
} from "@/lib/popIdentityDisplay"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  imageUrl?: string | null
  streetAddress?: string | null
  city?: string | null
  fallbackSeed?: string
  className?: string
}

/** Ficha horizontal · dirección — `/library/logos` variant `horizontal-address`. */
export function PopIdentityHorizontalAddress({
  name,
  imageUrl,
  streetAddress,
  city,
  fallbackSeed = "pop",
  className,
}: Props) {
  const trimmedName = name.trim() || "Punto de venta"
  const address = formatPopDisplayAddress(streetAddress, city)
  const logoSrc =
    imageUrl?.trim() || buildPopLogoFallbackUrl(fallbackSeed || trimmedName)

  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" className="size-full object-cover" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--rootsy-bruma-900)]">
          {trimmedName}
        </p>
        {address ? (
          <p className="truncate text-xs text-[var(--rootsy-bruma-500)]">
            {address}
          </p>
        ) : null}
      </div>
    </div>
  )
}
