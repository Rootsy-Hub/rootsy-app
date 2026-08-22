/**
 * Suelo · tierra mojada — pie de tablas y toolbox de operar.
 * Humus oliva bajo el dosel, humedad savia. No es earth de forms ni sombra sola.
 */

import { ROOTSY_SUELO, rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

export const ROOTSY_LAYOUTS_EARTH_FLOOR = {
  background: `linear-gradient(180deg, color-mix(in srgb, ${ROOTSY_SUELO["900"]} 56%, ${hx("sombra", "900")}) 0%, color-mix(in srgb, ${ROOTSY_SUELO["900"]} 28%, ${hx("sombra", "950")}) 52%, color-mix(in srgb, ${hx("savia", "900")} 22%, ${hx("sombra", "950")}) 100%)`,
  borderTop: `1px solid color-mix(in srgb, ${ROOTSY_SUELO["700"]} 32%, transparent)`,
  dividerColor: `color-mix(in srgb, ${ROOTSY_SUELO["800"]} 20%, transparent)`,
  baseCss: hx("sombra", "950"),
  textColor: ROOTSY_SUELO["50"],
  mutedColor: ROOTSY_SUELO["400"],
  moistureColor: hx("savia", "800"),
  chromeToken: "tierra mojada · suelo-900 / sombra-950 · savia",
} as const

export const rootsyLayoutsEarthFloorSurfaceClass =
  "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--rootsy-suelo-900)_56%,var(--rootsy-sombra-900))_0%,color-mix(in_srgb,var(--rootsy-suelo-900)_28%,var(--rootsy-sombra-950))_52%,color-mix(in_srgb,var(--rootsy-savia-900)_22%,var(--rootsy-sombra-950))_100%)]"

export const rootsyLayoutsEarthFloorBorderClass =
  "border-t border-[color-mix(in_srgb,var(--rootsy-suelo-700)_32%,transparent)]"

export const rootsyLayoutsEarthFloorShadowClass =
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--rootsy-suelo-400)_14%,transparent),inset_0_18px_36px_color-mix(in_srgb,var(--rootsy-savia-950)_26%,transparent)]"

/** Piedra sobre el barro — ver rootsyLayoutsEarthFloor.css */
export const rootsyLayoutsEarthFloorSlotClass = "layouts-operar-earth-slot"
export const rootsyLayoutsEarthFloorSlotConfiguredClass = "is-configured"
export const rootsyLayoutsEarthFloorSlotIconClass = "layouts-operar-earth-slot-icon"
export const rootsyLayoutsEarthFloorSlotLabelClass = "layouts-operar-earth-slot-label"
export const rootsyLayoutsEarthFloorSlotValueClass = "layouts-operar-earth-slot-value"
