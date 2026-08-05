/** Raíz y subsecciones del componente Texto. */
export const TEXT_COMPONENT_LIBRARY_ROOT = {
  id: "component-text",
  label: "Texto",
} as const

export const TEXT_COMPONENT_LIBRARY_SUBITEMS = [
  { id: "component-text-headings", label: "Títulos" },
  { id: "component-text-body", label: "Cuerpo" },
  { id: "component-text-labels", label: "Labels" },
  { id: "component-text-meta", label: "Metadatos" },
  { id: "component-text-metric", label: "Métrica" },
  { id: "component-text-reading", label: "Lectura" },
  { id: "component-text-code", label: "Código" },
] as const

export const TEXT_COMPONENT_LIBRARY_ITEMS = [
  TEXT_COMPONENT_LIBRARY_ROOT,
  ...TEXT_COMPONENT_LIBRARY_SUBITEMS,
] as const

export const TEXT_COMPONENT_SECTION_IDS = TEXT_COMPONENT_LIBRARY_ITEMS.map(
  (item) => item.id,
)

export function isTextComponentLibrarySection(sectionId: string): boolean {
  return (TEXT_COMPONENT_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type TextComponentPageMeta = {
  id: string
  title: string
  description: string
}

export const TEXT_COMPONENT_PAGE_META: Record<string, TextComponentPageMeta> = {
  "component-text": {
    id: "component-text",
    title: "Texto",
    description:
      "Roles tipográficos en componentes — títulos, cuerpo, labels y montos con tokens del sistema.",
  },
  "component-text-headings": {
    id: "component-text-headings",
    title: "Títulos",
    description:
      "Jerarquía de headings en pantallas, modales y cards — un nivel principal por vista.",
  },
  "component-text-body": {
    id: "component-text-body",
    title: "Cuerpo",
    description:
      "Texto principal de filas, descripciones y copy de apoyo — default 14px en UI.",
  },
  "component-text-labels": {
    id: "component-text-labels",
    title: "Labels",
    description:
      "Etiquetas de sección, campos y eyebrows — peso y tracking que orientan sin gritar.",
  },
  "component-text-meta": {
    id: "component-text-meta",
    title: "Metadatos",
    description:
      "Hints, timestamps y contexto secundario — 12px, color atenuado, nunca párrafos largos.",
  },
  "component-text-metric": {
    id: "component-text-metric",
    title: "Métrica",
    description:
      "Montos, KPIs y totales — Inter bold tabular; la etiqueta debajo en body.small.",
  },
  "component-text-reading": {
    id: "component-text-reading",
    title: "Lectura",
    description:
      "Prosa larga con Source Sans 3 — artículos, ayuda extendida y descripciones.",
  },
  "component-text-code": {
    id: "component-text-code",
    title: "Código",
    description:
      "Snippets y tokens técnicos — JetBrains Mono solo en docs y referencias.",
  },
}

export function getTextComponentPageMeta(
  sectionId: string,
): TextComponentPageMeta | undefined {
  return TEXT_COMPONENT_PAGE_META[sectionId]
}

export const TEXT_COMPONENT_RELATED_LINKS = [
  { sectionId: "typography", label: "Tipografía", hint: "Escala, familias y tokens base." },
  { sectionId: "typography-applying", label: "En producto", hint: "Demos tipográficas en contexto." },
  { sectionId: "colors-new", label: "Color", hint: "Contraste de texto y tokens muted." },
  { sectionId: "spacing", label: "Espaciado", hint: "Ritmo entre bloques de texto." },
] as const
