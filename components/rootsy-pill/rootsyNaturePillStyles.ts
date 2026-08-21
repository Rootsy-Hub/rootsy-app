import { cn } from "@/lib/utils"

/** Base pill — cápsula compacta, tabular para números. */
export const rootsNaturePillBaseClass =
  "inline-flex w-fit max-w-full items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums"

/** Soft savia — estado positivo (activo, OK, autorizado). */
export const rootsNaturePillSaviaSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--rootsy-savia-400)]/45 bg-[color:var(--rootsy-savia-100)] text-[color:var(--rootsy-savia-800)]",
)

/** Soft bruma — metadato o tipo sin urgencia. */
export const rootsNaturePillBrumaSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--rootsy-bruma-300)] bg-[color:var(--rootsy-bruma-100)] text-[color:var(--rootsy-bruma-700)]",
)

/** Soft bruma apagada — inactivo o secundario. */
export const rootsNaturePillBrumaMutedSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--rootsy-bruma-200)] bg-[color:var(--rootsy-bruma-50)] text-[color:var(--rootsy-bruma-500)]",
)

/** Soft warning — pendiente o revisión. Ámbar funcional, no sol. */
export const rootsNaturePillWarningSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--rootsy-warning)]/40 bg-[color:var(--rootsy-warning-soft)] text-[color:var(--rootsy-warning-text)]",
)

/** Soft danger — vencido, rechazado, error. */
export const rootsNaturePillDangerSoftClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--rootsy-danger)]/40 bg-[color-mix(in_srgb,var(--rootsy-danger)_10%,white)] text-[color:var(--rootsy-danger-dark)]",
)

/** Solid savia — énfasis alto (descuentos, métricas clave). */
export const rootsNaturePillSaviaSolidClass = cn(
  rootsNaturePillBaseClass,
  "border border-[color:var(--rootsy-savia-800)] bg-[color:var(--rootsy-savia-700)] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]",
)

export type RootsNaturePillVariant =
  | "savia"
  | "bruma"
  | "brumaMuted"
  | "warning"
  | "danger"
  | "saviaSolid"

export const rootsNaturePillVariantClass: Record<
  RootsNaturePillVariant,
  string
> = {
  savia: rootsNaturePillSaviaSoftClass,
  bruma: rootsNaturePillBrumaSoftClass,
  brumaMuted: rootsNaturePillBrumaMutedSoftClass,
  warning: rootsNaturePillWarningSoftClass,
  danger: rootsNaturePillDangerSoftClass,
  saviaSolid: rootsNaturePillSaviaSolidClass,
}
