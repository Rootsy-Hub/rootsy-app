"use client"

import {
  menuGhostCircleClass,
  menuGhostTileClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export const AVATAR_SIZES = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "sheet",
  "hero",
] as const

export type AvatarSize = (typeof AVATAR_SIZES)[number]
export type AvatarShape = "circle" | "square"
export type AvatarTone = "dark" | "light"

export type AvatarProps = {
  initials: string
  imageUrl?: string | null
  size?: AvatarSize
  shape?: AvatarShape
  tone?: AvatarTone
  pending?: boolean
  /** Si se omite, no hay punto de presencia. */
  isOnline?: boolean
  ariaLabel?: string
  onClick?: () => void
  className?: string
}

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
  xl: "size-11",
  "2xl": "size-16",
  sheet: "size-20",
  hero: "size-24 sm:size-28",
}

const INITIALS_CLASS: Record<AvatarSize, string> = {
  sm: "text-[10px] font-semibold tracking-wide",
  md: "text-[11px] font-semibold tracking-tight",
  lg: "text-[11px] font-semibold tracking-tight",
  xl: "text-xs font-semibold tracking-tight",
  "2xl": "text-lg font-semibold tracking-tight",
  sheet: "text-xl font-semibold tracking-tight",
  hero: "text-[1.35rem] font-bold tracking-tight sm:text-[1.72rem]",
}

const STATUS_SIZE_CLASS: Record<AvatarSize, string> = {
  sm: "size-1.5 ring-1",
  md: "size-2 ring-1",
  lg: "size-2 ring-2",
  xl: "size-2 ring-2",
  "2xl": "size-2.5 ring-2",
  sheet: "size-3 ring-2",
  hero: "size-3 ring-2",
}

/** Overlay en el borde — no entra al flujo ni agranda el box del avatar. */
const STATUS_INSET_CLASS: Record<AvatarSize, { circle: string; square: string }> = {
  sm: { circle: "right-px bottom-px", square: "right-0 bottom-0" },
  md: { circle: "right-0.5 bottom-0.5", square: "right-0 bottom-0" },
  lg: { circle: "right-0.5 bottom-0.5", square: "right-0 bottom-0" },
  xl: { circle: "right-0.5 bottom-0.5", square: "right-0 bottom-0" },
  "2xl": { circle: "right-1 bottom-1", square: "right-0.5 bottom-0.5" },
  sheet: { circle: "right-1.5 bottom-1.5", square: "right-1.5 bottom-1.5" },
  hero: { circle: "right-2 bottom-2", square: "right-1 bottom-1" },
}

export function Avatar({
  initials,
  imageUrl,
  size = "lg",
  shape = "circle",
  tone = "dark",
  pending = false,
  isOnline,
  ariaLabel,
  onClick,
  className,
}: AvatarProps) {
  const src = imageUrl?.trim() || null
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  const isCircle = shape === "circle"
  const radiusClass = isCircle ? "rounded-full" : "rounded-lg"
  const showPhoto = Boolean(src) && !imageFailed
  const showStatus = !pending && typeof isOnline === "boolean"
  const interactive = Boolean(onClick) && !pending
  const label = ariaLabel?.trim() || undefined

  if (pending) {
    const pendingClass = isCircle
      ? tone === "dark"
        ? cn(SIZE_CLASS[size], menuGhostCircleClass)
        : cn(
            SIZE_CLASS[size],
            "animate-pulse rounded-full bg-[var(--rootsy-bruma-200)]",
          )
      : tone === "dark"
        ? cn(SIZE_CLASS[size], "rounded-lg", menuGhostTileClass)
        : cn(
            SIZE_CLASS[size],
            "animate-pulse rounded-lg bg-[var(--rootsy-bruma-200)]",
          )

    return (
      <span
        className={cn("relative inline-flex shrink-0", radiusClass, pendingClass, className)}
        aria-hidden
      />
    )
  }

  const fallbackClass =
    tone === "dark"
      ? "bg-linear-to-br from-[var(--rootsy-savia-500)] to-[var(--rootsy-savia-700)] text-[var(--rootsy-savia-50)]"
      : isCircle
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_12%,var(--rootsy-bruma-50))] text-[var(--rootsy-savia-800)]"
        : "bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-700)]"

  const statusRing =
    tone === "dark"
      ? "ring-[var(--rootsy-eter-950)]"
      : "ring-[var(--rootsy-bruma-50)]"

  const face = showPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src!}
      alt=""
      className="size-full object-cover"
      onError={() => setImageFailed(true)}
    />
  ) : (
    <span className={cn("flex size-full items-center justify-center", INITIALS_CLASS[size])}>
      {initials}
    </span>
  )

  const status = showStatus ? (
    <span
      role="status"
      aria-label={isOnline ? "En línea" : "Sin conexión"}
      title={isOnline ? "En línea" : "Sin conexión"}
      className={cn(
        "pointer-events-none absolute z-10 rounded-full",
        STATUS_SIZE_CLASS[size],
        isCircle ? STATUS_INSET_CLASS[size].circle : STATUS_INSET_CLASS[size].square,
        statusRing,
        isOnline ? "bg-[var(--rootsy-savia-500)]" : "bg-[var(--rootsy-danger)]",
      )}
    />
  ) : null

  const faceClass = cn(
    "relative flex size-full items-center justify-center overflow-hidden",
    radiusClass,
    !showPhoto && fallbackClass,
    tone === "light" &&
      !isCircle &&
      "box-border border border-[var(--rootsy-bruma-200)]",
  )

  const shellClass = cn(
    "relative inline-flex shrink-0 border-0 bg-transparent p-0 leading-none",
    "overflow-visible align-middle",
    SIZE_CLASS[size],
    radiusClass,
    interactive &&
      cn(
        "group cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2",
        tone === "dark"
          ? "focus-visible:ring-[color-mix(in_srgb,var(--rootsy-eter-100)_40%,transparent)]"
          : "focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-700)_35%,transparent)]",
      ),
    className,
  )

  const body = (
    <>
      <span className={faceClass}>
        {face}
        {interactive ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100",
              tone === "dark"
                ? "bg-[color-mix(in_srgb,var(--rootsy-eter-950)_22%,transparent)]"
                : "bg-[color-mix(in_srgb,var(--rootsy-bruma-900)_10%,transparent)]",
            )}
          />
        ) : null}
      </span>
      {status}
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        aria-label={label ?? initials}
        onClick={(event) => {
          event.stopPropagation()
          onClick?.()
        }}
        className={cn(shellClass, "appearance-none")}
      >
        {body}
      </button>
    )
  }

  return (
    <span className={shellClass} aria-hidden={!label} aria-label={label}>
      {body}
    </span>
  )
}
