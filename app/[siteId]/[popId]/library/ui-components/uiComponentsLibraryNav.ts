/** Componentes UI — specs de componentes según fundamentos Rootsy. */

export const UI_COMPONENTS_LIBRARY_ROOT = {
  id: "ui-components",
  label: "Componentes UI",
} as const

export const UI_COMPONENTS_LIBRARY_SUBITEMS = [
  { id: "ui-components-buttons", label: "Botones UI" },
  { id: "ui-components-forms", label: "Formulario UI" },
] as const

export const UI_COMPONENTS_LIBRARY_ITEMS = [
  UI_COMPONENTS_LIBRARY_ROOT,
  ...UI_COMPONENTS_LIBRARY_SUBITEMS,
] as const

export const UI_COMPONENTS_SECTION_IDS = UI_COMPONENTS_LIBRARY_ITEMS.map((item) => item.id)

export function isUiComponentsLibrarySection(sectionId: string): boolean {
  return (UI_COMPONENTS_SECTION_IDS as readonly string[]).includes(sectionId)
}

export type UiComponentsPageMeta = {
  id: string
  title: string
  description: string
}

export const UI_COMPONENTS_PAGE_META: Record<string, UiComponentsPageMeta> = {
  "ui-components": {
    id: "ui-components",
    title: "Componentes UI",
    description:
      "Especificaciones de componentes de interfaz — appearances, tokens, tamaños y estados alineados a color, tipografía, radio y movimiento.",
  },
  "ui-components-buttons": {
    id: "ui-components-buttons",
    title: "Botones UI",
    description:
      "Dispara una acción — appearances, tamaños, botones con ícono e icon buttons por tema workspace/POS.",
  },
  "ui-components-forms": {
    id: "ui-components-forms",
    title: "Formulario UI",
    description:
      "Captura datos — texto, select, booleanos, prefijos w-11, fecha e imagen con stack de campo y estados completos.",
  },
}

export function getUiComponentsPageMeta(sectionId: string): UiComponentsPageMeta | undefined {
  return UI_COMPONENTS_PAGE_META[sectionId]
}

export const UI_COMPONENTS_RELATED_LINKS = [
  { sectionId: "ui-components-buttons", label: "Botones UI", hint: "Appearances · tamaños · estados." },
  { sectionId: "ui-components-forms", label: "Formulario UI", hint: "Controles · stack · estados." },
  { sectionId: "colors-new", label: "Color", hint: "Savia · bruma · funcional." },
  { sectionId: "typography", label: "Tipografía", hint: "Labels y body en campos." },
  { sectionId: "radius", label: "Radio", hint: "radius.large en controles." },
  { sectionId: "border", label: "Borde", hint: "border.form · focus savia." },
  { sectionId: "spacing", label: "Espaciado", hint: "field-stack · space.100." },
] as const
