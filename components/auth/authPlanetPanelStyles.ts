import {
  menuHoloChromeVeilClass,
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"

/** Entidad de acceso — portal vivo instalado en el firmamento. */
export const authPlanetEntityClass = cn(
  "auth-planet-entity auth-planet-panel relative isolate w-full",
)

export const authPlanetEntityBodyClass = cn(
  "auth-planet-entity-body relative overflow-hidden rounded-[1.35rem]",
  "border border-[rgba(147,210,255,0.34)]",
  "bg-[linear-gradient(168deg,rgba(186,230,253,0.1)_0%,rgba(14,42,54,0.38)_52%,rgba(5,12,16,0.55)_100%)]",
  "backdrop-blur-[8px] backdrop-saturate-[1.22]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-18px_28px_rgba(0,0,0,0.14),0_0_0_1px_rgba(36,173,106,0.1),0_4px_24px_rgba(14,116,144,0.16),0_18px_56px_rgba(14,87,57,0.24),0_0_80px_rgba(36,173,106,0.14)]",
)

export const authPlanetEntityVeilClass = cn(
  "pointer-events-none absolute inset-0 opacity-70",
  menuHoloChromeVeilClass,
)

export const authPlanetEntityContentClass = "auth-planet-entity-content relative z-[2]"

export const authPlanetEntityInnerClass = "auth-planet-entity-inner relative z-[1]"

/** Luz de estrella — títulos y etiquetas dentro del firmamento interior. */
export const authPlanetStarlightClass = cn(
  menuRealmLightStaticClass,
  "[text-shadow:0_0_18px_rgba(255,255,255,0.14)]",
)

/** Cuerpo secundario — legible como constelación tenue. */
export const authPlanetStarMutedClass = cn(
  menuRealmLightMutedClass,
  "text-[rgba(255,255,255,0.68)]",
)

export const authPlanetEyebrowClass = cn(
  "text-[11px] font-bold uppercase tracking-[0.16em] text-[rgba(111,216,156,0.95)]",
  "drop-shadow-[0_0_12px_rgba(36,173,106,0.35)]",
)

/** @deprecated Usar authPlanetStarlightClass */
export const authPlanetTextLiftClass = authPlanetStarlightClass

/** @deprecated Usar authPlanetStarMutedClass */
export const authPlanetLeadLiftClass = authPlanetStarMutedClass

/** @deprecated Usar AuthPlanetEntity */
export const authPlanetPanelClass = authPlanetEntityClass

/** @deprecated Usar AuthPlanetEntity */
export const authPlanetPanelScrimClass = ""

/** @deprecated Usar AuthPlanetEntity */
export const authPlanetPanelFrameClass = ""
