export const LANDING_VIEW_IDS = [
  "inicio",
  "empezar",
  "precios",
  "rubros",
  "control",
  "clientes",
  "faq",
] as const

export type LandingViewId = (typeof LANDING_VIEW_IDS)[number]

export type LandingViewMeta = {
  id: LandingViewId
  label: string
  title: string
  tagline?: string
  centered?: boolean
}

export type LandingDesktopStageMode = "fit" | "scroll"

export type LandingMobileSectionHeight = "viewport" | "content"

export type LandingViewStructure = {
  desktopStage: LandingDesktopStageMode
  mobileSection: LandingMobileSectionHeight
}

export const LANDING_VIEW_META: Record<LandingViewId, LandingViewMeta> = {
  inicio: {
    id: "inicio",
    label: "Inicio",
    title: "Gestioná en minutos",
    tagline: "En la nube, desde el navegador.",
    centered: true,
  },
  empezar: {
    id: "empezar",
    label: "Empezar",
    title: "Tres pasos para arrancar",
    tagline: "La complejidad llega cuando vos la buscás.",
    centered: true,
  },
  rubros: {
    id: "rubros",
    label: "Rubros",
    title: "Adaptado a tu rubro",
    tagline: "Comercio, gastronomía, fabricación, servicios y más.",
  },
  control: {
    id: "control",
    label: "Control",
    title: "Control desde cualquier lugar",
    tagline: "Navegador y celular, ventas y stock en vivo.",
    centered: true,
  },
  clientes: {
    id: "clientes",
    label: "Clientes",
    title: "Ya confían en nosotros",
    tagline: "Marcas y equipos que ya dieron el salto.",
  },
  faq: {
    id: "faq",
    label: "Preguntas",
    title: "Preguntas frecuentes",
    tagline: "Respuestas claras antes de registrarte.",
  },
  precios: {
    id: "precios",
    label: "Precios",
    title: "Elegí tu plan",
    tagline: "7 días de prueba con tarjeta — sin cargo hasta que termina.",
  },
}

export const LANDING_NAV: ReadonlyArray<{ id: LandingViewId; label: string }> =
  LANDING_VIEW_IDS.map((id) => ({
    id,
    label: LANDING_VIEW_META[id].label,
  }))

/** Comportamiento del shell por capítulo (estructura, no contenido). */
export const LANDING_VIEW_STRUCTURE: Record<LandingViewId, LandingViewStructure> = {
  inicio: { desktopStage: "fit", mobileSection: "viewport" },
  empezar: { desktopStage: "fit", mobileSection: "content" },
  rubros: { desktopStage: "scroll", mobileSection: "content" },
  control: { desktopStage: "fit", mobileSection: "content" },
  clientes: { desktopStage: "scroll", mobileSection: "content" },
  faq: { desktopStage: "scroll", mobileSection: "content" },
  precios: { desktopStage: "scroll", mobileSection: "content" },
}

const LEGACY_HASH: Record<string, LandingViewId> = {
  explorar: "rubros",
  soluciones: "rubros",
  "primeros-pasos": "empezar",
}

export function isLandingViewId(value: string): value is LandingViewId {
  return (LANDING_VIEW_IDS as readonly string[]).includes(value)
}

export function viewFromHash(hash: string): LandingViewId {
  const raw = hash.replace(/^#/, "").trim().toLowerCase()
  if (!raw) return "inicio"
  const legacy = LEGACY_HASH[raw]
  if (legacy) return legacy
  if (isLandingViewId(raw)) return raw
  return "inicio"
}

export function landingAdjacentView(
  id: LandingViewId,
  direction: -1 | 1,
): LandingViewId {
  const i = LANDING_VIEW_IDS.indexOf(id)
  const next = (i + direction + LANDING_VIEW_IDS.length) % LANDING_VIEW_IDS.length
  return LANDING_VIEW_IDS[next]
}
