/**
 * Suelo empapado — pie de tablas y toolbox de operar.
 * Tierra casi negra: earth-900 bajo sombra, savia-990 en el fondo.
 */

import { EARTH_FAMILY } from "@/app/library/color/rootsyNaturePalette"
import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

function earthHex(label: string): string {
  const step = EARTH_FAMILY.steps.find((item) => item.label === label)
  if (!step) throw new Error(`Unknown earth step: ${label}`)
  return step.hex
}

export const ROOTSY_LAYOUTS_EARTH_FLOOR = {
  background: `linear-gradient(180deg, color-mix(in srgb, ${earthHex("900")} 52%, ${hx("sombra", "900")}) 0%, color-mix(in srgb, ${earthHex("900")} 22%, ${hx("sombra", "950")}) 55%, color-mix(in srgb, ${hx("savia", "990")} 38%, ${hx("sombra", "950")}) 100%)`,
  borderTop: `1px solid color-mix(in srgb, ${earthHex("800")} 26%, transparent)`,
  dividerColor: `color-mix(in srgb, ${earthHex("800")} 20%, transparent)`,
  baseCss: hx("sombra", "950"),
  textColor: earthHex("50"),
  mutedColor: earthHex("400"),
  moistureColor: hx("savia", "800"),
  chromeToken: "tierra empapada · earth-900 / sombra-950 · savia-990",
} as const

export const rootsyLayoutsEarthFloorSurfaceClass =
  "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--nature-earth-900,#292524)_52%,var(--rootsy-sombra-900))_0%,color-mix(in_srgb,var(--nature-earth-900,#292524)_22%,var(--rootsy-sombra-950))_55%,color-mix(in_srgb,var(--rootsy-savia-990)_38%,var(--rootsy-sombra-950))_100%)]"

export const rootsyLayoutsEarthFloorBorderClass =
  "border-t border-[color-mix(in_srgb,var(--nature-earth-800,#44403C)_28%,transparent)]"

export const rootsyLayoutsEarthFloorShadowClass =
  "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--nature-earth-700,#57534E)_14%,transparent),inset_0_18px_36px_color-mix(in_srgb,var(--rootsy-savia-950)_22%,transparent)]"

/** Piedra sobre el barro — ver rootsyLayoutsEarthFloor.css */
export const rootsyLayoutsEarthFloorSlotClass = "layouts-operar-earth-slot"
export const rootsyLayoutsEarthFloorSlotConfiguredClass = "is-configured"
export const rootsyLayoutsEarthFloorSlotIconClass = "layouts-operar-earth-slot-icon"
export const rootsyLayoutsEarthFloorSlotLabelClass = "layouts-operar-earth-slot-label"
export const rootsyLayoutsEarthFloorSlotValueClass = "layouts-operar-earth-slot-value"
