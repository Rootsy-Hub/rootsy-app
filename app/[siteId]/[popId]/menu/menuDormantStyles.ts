import {
  menuAmbientTopGlowClass,
  menuVignetteClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import { cn } from "@/lib/utils"

/** Firmamento en reposo — bruma y vacío, sin reinados aún despertos. */
export const menuDormantAmbientWashClass =
  "bg-[radial-gradient(ellipse_at_center,rgba(228,242,248,0.035)_0%,rgba(8,28,38,0.05)_44%,transparent_78%)]"

export const menuDormantCoreOrbClass =
  "bg-[radial-gradient(circle,rgba(228,242,248,0.07)_0%,rgba(8,28,38,0.03)_52%,transparent_76%)]"

export const menuDormantHaloOrbClass = "bg-[rgba(228,242,248,0.04)]"

export const menuDormantFirmamentLayerClass = cn(
  "pointer-events-none absolute inset-0 overflow-hidden",
)

export { menuAmbientTopGlowClass, menuVignetteClass }
