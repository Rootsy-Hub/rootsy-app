/**
 * Toolbox operar — umbral luz filtrada, 79px.
 * Misma familia que el cierre: bruma 100, hairline 200.
 */

import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

export const ROOTSY_LAYOUTS_EARTH_FLOOR = {
  background: hx("bruma", "100"),
  borderTop: `1px solid ${hx("bruma", "200")}`,
  dividerColor: hx("bruma", "200"),
  baseCss: hx("bruma", "100"),
  textColor: hx("bruma", "900"),
  mutedColor: hx("bruma", "500"),
  moistureColor: hx("savia", "500"),
  chromeToken: "luz filtrada · barra 100 · hairline 200 · savia solo ícono",
} as const

export const rootsyLayoutsEarthFloorSurfaceClass =
  "bg-[var(--rootsy-bruma-100)]"

export const rootsyLayoutsEarthFloorBorderClass =
  "border-t border-[var(--rootsy-bruma-200)]"

export const rootsyLayoutsEarthFloorShadowClass =
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-blanco)_55%,transparent)]"

/** Piso del toolbox — umbral luz filtrada. */
export const rootsyLayoutsEarthFloorBandClass = "layouts-operar-earth-floor"

/** Slot sobre la banda — ver rootsyLayoutsEarthFloor.css */
export const rootsyLayoutsEarthFloorSlotClass = "layouts-operar-earth-slot"
export const rootsyLayoutsEarthFloorSlotConfiguredClass = "is-configured"
export const rootsyLayoutsEarthFloorSlotIconClass = "layouts-operar-earth-slot-icon"
export const rootsyLayoutsEarthFloorSlotLabelClass = "layouts-operar-earth-slot-label"
export const rootsyLayoutsEarthFloorSlotValueClass = "layouts-operar-earth-slot-value"
export const rootsyLayoutsEarthFloorSlotMetaClass = "layouts-operar-earth-slot-meta"
