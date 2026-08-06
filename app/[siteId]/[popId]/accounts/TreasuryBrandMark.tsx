"use client"

import { getTreasuryBrandIsotype } from "@/lib/treasuryBrandLogos"
import type { TreasuryAccountBrandPreset } from "@/lib/treasuryAccountBrands"
import { cn } from "@/lib/utils"

type IsotypeSize = "sm" | "md" | "lg"

const boxClass: Record<IsotypeSize, string> = {
  sm: "size-9 rounded-xl text-[10px]",
  md: "size-11 rounded-xl text-xs",
  lg: "size-11 rounded-xl text-xs",
}

type IsotypeProps = {
  brandKey?: string | null
  /** Iniciales si no hay isotipo (2–4 caracteres). */
  monogram?: string
  headerTextClass?: string
  /** Header con marca / color fuerte (p. ej. Mercado Pago). */
  onColoredHeader?: boolean
  size?: IsotypeSize
  className?: string
}

/** Isotipo de marca o iniciales con el mismo formato visual. */
export function TreasuryBrandIsotype({
  brandKey,
  monogram = "—",
  headerTextClass = "text-white",
  onColoredHeader = false,
  size = "md",
  className,
}: IsotypeProps) {
  const config = brandKey ? getTreasuryBrandIsotype(brandKey) : null

  if (config) {
    const isCover = config.fit !== "contain"
    const isRaster = /\.(png|jpe?g|webp|avif)$/i.test(config.src)
    /** PNG/JPG a color: el asset llena el badge sin caja blanca ni zoom. */
    const fullBleed = isCover && isRaster

    const box = cn(
      "relative shrink-0 overflow-hidden",
      boxClass[size],
      fullBleed
        ? "bg-transparent"
        : "flex items-center justify-center bg-white/95 shadow-sm ring-1 ring-black/5",
      className,
    )

    return (
      <div className={box} aria-hidden>
        <img
          src={config.src}
          alt=""
          draggable={false}
          className={cn(
            "block select-none",
            fullBleed
              ? "size-full object-cover object-center"
              : isCover
                ? "size-full object-cover object-center"
                : "size-[72%] object-contain object-center",
          )}
          style={{
            objectPosition: config.position ?? "center",
          }}
          decoding="async"
        />
      </div>
    )
  }

  const box = cn(
    "flex shrink-0 items-center justify-center overflow-hidden font-bold tracking-tight",
    boxClass[size],
    onColoredHeader
      ? cn(
          "bg-white/20 backdrop-blur-sm ring-1 ring-white/25",
          headerTextClass,
        )
      : "bg-white text-foreground/80 shadow-sm ring-1 ring-black/10",
    className,
  )

  return (
    <div className={box} aria-hidden>
      {monogram.slice(0, 3).toUpperCase()}
    </div>
  )
}

type NameProps = {
  preset?: TreasuryAccountBrandPreset | null
  name: string
  compact?: boolean
  className?: string
  textClass?: string
}

/** Nombre escrito de la cuenta / institución. */
export function TreasuryBrandName({
  preset,
  name,
  compact = false,
  className,
  textClass = "text-white",
}: NameProps) {
  const label = name.trim() || preset?.label || "—"

  return (
    <p
      className={cn(
        "min-w-0 truncate font-semibold tracking-tight",
        compact ? "text-sm" : "text-base",
        textClass,
        className,
      )}
    >
      {label}
    </p>
  )
}

/** @deprecated Usar TreasuryBrandIsotype */
export const TreasuryBrandMark = TreasuryBrandIsotype

/** @deprecated Usar TreasuryBrandName */
export function TreasuryBrandWordmark({
  preset,
  name,
  compact,
  className,
  textClass,
}: NameProps) {
  return (
    <TreasuryBrandName
      preset={preset}
      name={name}
      compact={compact}
      className={className}
      textClass={textClass}
    />
  )
}
