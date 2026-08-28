import type { ButtonsUiInteractionState } from "@/app/library/ui-components/buttonsUiHardcodedSpec"
import { cn } from "@/lib/utils"

export type EterSubtleSurface = {
  backgroundColor: string
  color: string
  border: string
  boxShadow?: string
  opacity?: number
}

/** Receta subtle de /home — rampa éter, no chrome POS ni sombra. */
export function getEterSubtleSurface(
  state: ButtonsUiInteractionState,
): EterSubtleSurface {
  const base: EterSubtleSurface = {
    backgroundColor: "transparent",
    color: "var(--rootsy-eter-300)",
    border: "1px solid transparent",
  }

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: "var(--rootsy-eter-800)",
        color: "var(--rootsy-eter-50)",
      }
    case "active":
      return {
        ...base,
        backgroundColor: "var(--rootsy-eter-700)",
        color: "var(--rootsy-eter-50)",
      }
    case "focus":
      return {
        ...base,
        boxShadow: "0 0 0 2px color-mix(in srgb, var(--rootsy-eter-100) 22%, transparent)",
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
}

/** Acción principal sobre éter — misma familia, un paso más lit. */
export function getEterPrimarySurface(
  state: ButtonsUiInteractionState,
): EterSubtleSurface {
  const base: EterSubtleSurface = {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.96)",
    border: "1px solid transparent",
  }

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: "rgba(255,255,255,0.12)",
        color: "#ffffff",
      }
    case "active":
      return {
        ...base,
        backgroundColor: "rgba(255,255,255,0.16)",
        color: "#ffffff",
      }
    case "focus":
      return {
        ...base,
        boxShadow: "0 0 0 2px color-mix(in srgb, var(--rootsy-eter-100) 22%, transparent)",
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
}

const ETER_DANGER = "var(--rootsy-lava-600)"
const ETER_DANGER_HOVER = "var(--rootsy-lava-500)"
const ETER_DANGER_ACTIVE = "var(--rootsy-lava-700)"

export function getEterDangerSurface(
  state: ButtonsUiInteractionState,
): EterSubtleSurface {
  const base: EterSubtleSurface = {
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.56)",
    border: "1px solid transparent",
  }

  switch (state) {
    case "default":
      return base
    case "hover":
      return {
        ...base,
        backgroundColor: `color-mix(in srgb, ${ETER_DANGER} 18%, transparent)`,
        color: ETER_DANGER_HOVER,
      }
    case "active":
      return {
        ...base,
        backgroundColor: `color-mix(in srgb, ${ETER_DANGER} 24%, transparent)`,
        color: ETER_DANGER_ACTIVE,
      }
    case "focus":
      return {
        ...base,
        boxShadow: "0 0 0 2px color-mix(in srgb, var(--rootsy-eter-100) 22%, transparent)",
      }
    case "disabled":
      return { ...base, opacity: 0.5 }
    case "loading":
      return { ...base, opacity: 0.92 }
  }
}

export const eterHeaderTextShadow = "0 1px 2px rgba(0,0,0,0.38)"

export const eterHeaderTitleClass = cn(
  "antialiased text-white/96",
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.38)]",
)

export const eterHeaderBodyClass = cn(
  "font-normal antialiased text-white/96",
  "drop-shadow-[0_1px_2px_rgba(0,0,0,0.38)]",
)

export const eterHeaderMutedClass =
  "text-[color-mix(in_srgb,var(--rootsy-eter-100)_52%,transparent)]"

export const eterHeaderDividerClass =
  "bg-[color-mix(in_srgb,var(--rootsy-eter-100)_18%,transparent)]"

export const eterHeaderHairlineClass =
  "ring-1 ring-[color-mix(in_srgb,var(--rootsy-eter-100)_16%,transparent)]"

export const eterHeaderFocusRingClass =
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-eter-100)_22%,transparent)]"

/** Overlay del header éter — mismo vacío y hairline, no el panel sombra. */
export const eterHeaderDropdownSurfaceClass = cn(
  "!border-[color-mix(in_srgb,var(--rootsy-eter-100)_16%,transparent)]",
  "!bg-[var(--rootsy-eter-950)]",
  "text-white/96",
  "!shadow-[0_24px_64px_-18px_rgb(4_5_6/0.72)]",
  "[&_[data-slot=dropdown-menu-item]:not([data-variant=destructive])]:text-white/96",
  "[&_[data-slot=dropdown-menu-item]:not([data-variant=destructive])]:data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-eter-100)_8%,transparent)]",
  "[&_[data-slot=dropdown-menu-item]:not([data-variant=destructive])]:data-[highlighted]:text-white",
  "[&_[data-slot=dropdown-menu-item]:not([data-variant=destructive])_svg:not([class*='text-'])]:text-[color-mix(in_srgb,var(--rootsy-eter-100)_52%,transparent)]",
  "[&_[data-slot=dropdown-menu-item][data-variant=destructive]]:data-[highlighted]:bg-[color-mix(in_srgb,var(--color-status-danger,#dc2626)_8%,var(--rootsy-eter-950))]",
  "[&_[data-slot=dropdown-menu-separator]]:!bg-[color-mix(in_srgb,var(--rootsy-eter-100)_18%,transparent)]",
  "[&_[data-slot=dropdown-menu-label]]:text-[color-mix(in_srgb,var(--rootsy-eter-100)_52%,transparent)]",
)
