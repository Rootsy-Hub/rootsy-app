/**
 * Piso de toolbox operar — Sotobosque · Sombra.
 * Banda 950 sobre el vacío negro. Encima, savia se prende en el slot.
 */

import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

export const ROOTSY_LAYOUTS_EARTH_FLOOR = {
  background: hx("sombra", "950"),
  borderTop: `1px solid ${hx("sombra", "700")}`,
  dividerColor: hx("sombra", "700"),
  baseCss: hx("sombra", "950"),
  textColor: hx("sombra", "50"),
  mutedColor: hx("sombra", "300"),
  moistureColor: hx("savia", "500"),
  chromeToken: "sombra · banda 950 · savia 500",
} as const

export const rootsyLayoutsEarthFloorSurfaceClass =
  "bg-[var(--rootsy-sombra-950)]"

export const rootsyLayoutsEarthFloorBorderClass =
  "border-t border-[var(--rootsy-sombra-700)]"

export const rootsyLayoutsEarthFloorShadowClass =
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-sombra-400)_18%,transparent)]"

/** Piso del toolbox — banda 950 sobre el vacío negro. */
export const rootsyLayoutsEarthFloorBandClass = "layouts-operar-earth-floor"

/** Slot sobre la banda — ver rootsyLayoutsEarthFloor.css */
export const rootsyLayoutsEarthFloorSlotClass = "layouts-operar-earth-slot"
export const rootsyLayoutsEarthFloorSlotConfiguredClass = "is-configured"
export const rootsyLayoutsEarthFloorSlotIconClass = "layouts-operar-earth-slot-icon"
export const rootsyLayoutsEarthFloorSlotLabelClass = "layouts-operar-earth-slot-label"
export const rootsyLayoutsEarthFloorSlotValueClass = "layouts-operar-earth-slot-value"
export const rootsyLayoutsEarthFloorSlotMetaClass = "layouts-operar-earth-slot-meta"
