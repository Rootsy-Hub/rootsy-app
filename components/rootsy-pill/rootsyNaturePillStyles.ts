import {
  isRootsButtonAtmosphereDark,
  type RootsButtonAtmosphere,
} from "@/components/rootsy-button/rootsButtonAtmosphere"
import { cn } from "@/lib/utils"

export type RootsNaturePillAtmosphere = RootsButtonAtmosphere

/** Base pill — cápsula compacta, tabular para números. */
export const rootsNaturePillBaseClass =
  "inline-flex w-fit max-w-full items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums"

export const rootsNaturePillStrikeClass = "line-through decoration-current"

export type RootsNaturePillVariant =
  | "savia"
  | "bruma"
  | "brumaMuted"
  | "info"
  | "warning"
  | "danger"
  | "saviaSolid"
  | "sombra"
  | "sombraMuted"

/**
 * Recetas del handbook.
 * Luz filtrada: tint 50 / borde 200 / profundo 700. Sólido: vivo 500 / on 950.
 * Oscuro: la hoja (800) + tinta vivo 500. Neutros de la rampa de la atmósfera.
 */
const PILL_TONE_CLASS: Record<
  RootsNaturePillAtmosphere,
  Record<RootsNaturePillVariant, string>
> = {
  bruma: {
    savia:
      "border-[var(--rootsy-savia-200)] bg-[var(--rootsy-savia-50)] text-[var(--rootsy-savia-700)]",
    bruma:
      "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-700)]",
    brumaMuted:
      "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-500)]",
    info:
      "border-[var(--rootsy-cielo-200)] bg-[var(--rootsy-cielo-50)] text-[var(--rootsy-cielo-700)]",
    warning:
      "border-[var(--rootsy-sol-200)] bg-[var(--rootsy-sol-50)] text-[var(--rootsy-sol-700)]",
    danger:
      "border-[var(--rootsy-lava-200)] bg-[var(--rootsy-lava-50)] text-[var(--rootsy-lava-700)]",
    saviaSolid:
      "border-[var(--rootsy-savia-500)] bg-[var(--rootsy-savia-500)] text-[var(--rootsy-savia-950)]",
    sombra:
      "border-[color-mix(in_srgb,var(--rootsy-savia-500)_45%,transparent)] bg-[var(--rootsy-sombra-900)] text-[var(--rootsy-savia-500)]",
    sombraMuted:
      "border-[color-mix(in_srgb,var(--rootsy-sombra-400)_40%,transparent)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-sombra-300)]",
  },
  sombra: {
    savia:
      "border-[var(--rootsy-savia-500)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-savia-500)]",
    bruma:
      "border-[var(--rootsy-sombra-700)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-sombra-50)]",
    brumaMuted:
      "border-[var(--rootsy-sombra-700)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-sombra-300)]",
    info:
      "border-[var(--rootsy-cielo-500)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-cielo-500)]",
    warning:
      "border-[var(--rootsy-sol-500)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-sol-500)]",
    danger:
      "border-[var(--rootsy-lava-500)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-lava-500)]",
    saviaSolid:
      "border-[var(--rootsy-savia-500)] bg-[var(--rootsy-savia-500)] text-[var(--rootsy-savia-950)]",
    sombra:
      "border-[color-mix(in_srgb,var(--rootsy-savia-500)_45%,transparent)] bg-[var(--rootsy-sombra-900)] text-[var(--rootsy-savia-500)]",
    sombraMuted:
      "border-[color-mix(in_srgb,var(--rootsy-sombra-400)_40%,transparent)] bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-sombra-300)]",
  },
  eter: {
    savia:
      "border-[var(--rootsy-savia-500)] bg-[var(--rootsy-eter-800)] text-[var(--rootsy-savia-500)]",
    bruma:
      "border-[var(--rootsy-eter-700)] bg-[var(--rootsy-eter-800)] text-[var(--rootsy-eter-50)]",
    brumaMuted:
      "border-[var(--rootsy-eter-700)] bg-[var(--rootsy-eter-800)] text-[var(--rootsy-eter-300)]",
    info:
      "border-[var(--rootsy-cielo-500)] bg-[var(--rootsy-eter-800)] text-[var(--rootsy-cielo-500)]",
    warning:
      "border-[var(--rootsy-sol-500)] bg-[var(--rootsy-eter-800)] text-[var(--rootsy-sol-500)]",
    danger:
      "border-[var(--rootsy-lava-500)] bg-[var(--rootsy-eter-800)] text-[var(--rootsy-lava-500)]",
    saviaSolid:
      "border-[var(--rootsy-savia-500)] bg-[var(--rootsy-savia-500)] text-[var(--rootsy-savia-950)]",
    sombra:
      "border-[color-mix(in_srgb,var(--rootsy-savia-500)_45%,transparent)] bg-[var(--rootsy-eter-900)] text-[var(--rootsy-savia-500)]",
    sombraMuted:
      "border-[color-mix(in_srgb,var(--rootsy-eter-400)_40%,transparent)] bg-[var(--rootsy-eter-800)] text-[var(--rootsy-eter-300)]",
  },
}

export function rootsNaturePillToneClass(
  variant: RootsNaturePillVariant,
  atmosphere: RootsNaturePillAtmosphere = "bruma",
): string {
  return PILL_TONE_CLASS[atmosphere][variant]
}

export function rootsNaturePillClassName(
  variant: RootsNaturePillVariant,
  atmosphere: RootsNaturePillAtmosphere = "bruma",
  strike = false,
): string {
  return cn(
    rootsNaturePillBaseClass,
    rootsNaturePillToneClass(variant, atmosphere),
    strike && rootsNaturePillStrikeClass,
  )
}

/** @deprecated Luz filtrada. Preferí rootsNaturePillToneClass(variant, atmosphere). */
export const rootsNaturePillSaviaSoftClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.bruma.savia,
)
export const rootsNaturePillBrumaSoftClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.bruma.bruma,
)
export const rootsNaturePillBrumaMutedSoftClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.bruma.brumaMuted,
)
export const rootsNaturePillWarningSoftClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.bruma.warning,
)
export const rootsNaturePillDangerSoftClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.bruma.danger,
)
export const rootsNaturePillSaviaSolidClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.bruma.saviaSolid,
)
export const rootsNaturePillSombraClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.sombra.sombra,
)
export const rootsNaturePillSombraMutedClass = cn(
  rootsNaturePillBaseClass,
  PILL_TONE_CLASS.sombra.sombraMuted,
)

export const rootsNaturePillVariantClass: Record<
  RootsNaturePillVariant,
  string
> = {
  savia: rootsNaturePillSaviaSoftClass,
  bruma: rootsNaturePillBrumaSoftClass,
  brumaMuted: rootsNaturePillBrumaMutedSoftClass,
  info: cn(rootsNaturePillBaseClass, PILL_TONE_CLASS.bruma.info),
  warning: rootsNaturePillWarningSoftClass,
  danger: rootsNaturePillDangerSoftClass,
  saviaSolid: rootsNaturePillSaviaSolidClass,
  sombra: rootsNaturePillSombraClass,
  sombraMuted: rootsNaturePillSombraMutedClass,
}

export function isRootsNaturePillAtmosphereDark(
  atmosphere: RootsNaturePillAtmosphere,
) {
  return isRootsButtonAtmosphereDark(atmosphere)
}
