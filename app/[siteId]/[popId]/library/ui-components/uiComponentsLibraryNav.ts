/** Componentes UI — specs de componentes según fundamentos Rootsy. */

export const UI_COMPONENTS_LIBRARY_ROOT = {
  id: "ui-components",
  label: "Componentes UI",
} as const

export const UI_COMPONENTS_LIBRARY_SUBITEMS = [
  { id: "ui-components-buttons", label: "Botones UI" },
  { id: "ui-components-forms", label: "Formulario UI" },
  { id: "ui-components-modals", label: "Modales UI" },
  { id: "ui-components-banners", label: "Banners UI" },
  { id: "ui-components-dropdown", label: "Dropdown UI" },
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
      "Captura datos — stack field · space.500 · inline-icon · leading sunken · form.context.toolbar-list · tokens border/elevation/spacing.",
  },
  "ui-components-modals": {
    id: "ui-components-modals",
    title: "Modales UI",
    description:
      "Scrim viewport · panel overlay + shadow.overlay + color.border · body sunken · alert compacto — specs tabuladas + previews completos.",
  },
  "ui-components-banners": {
    id: "ui-components-banners",
    title: "Banners UI",
    description:
      "Feedback inline — intents semánticos · tint 8% · radius.large · sin shadow · densidad default/compact · acción y dismiss.",
  },
  "ui-components-dropdown": {
    id: "ui-components-dropdown",
    title: "Dropdown UI",
    description:
      "Panel overlay + shadow.overlay · color.border · radius.xlarge — anclado al trigger, sin scrim. Ítems · triggers · destructive aislado.",
  },
}

export function getUiComponentsPageMeta(sectionId: string): UiComponentsPageMeta | undefined {
  return UI_COMPONENTS_PAGE_META[sectionId]
}

export const UI_COMPONENTS_RELATED_LINKS = [
  { sectionId: "ui-components-buttons", label: "Botones UI", hint: "Appearances · tamaños · estados." },
  { sectionId: "ui-components-forms", label: "Formulario UI", hint: "Controles · stack · toolbar listado." },
  { sectionId: "ui-components-modals", label: "Modales UI", hint: "Modal · alert · footers." },
  { sectionId: "ui-components-banners", label: "Banners UI", hint: "Intents · densidad · dismiss." },
  { sectionId: "ui-components-dropdown", label: "Dropdown UI", hint: "Overlay · ítems · triggers." },
  { sectionId: "colors-new", label: "Color", hint: "Savia · bruma · funcional." },
  { sectionId: "typography", label: "Tipografía", hint: "Labels y body en campos." },
  { sectionId: "radius", label: "Radio", hint: "radius.large en controles." },
  { sectionId: "border", label: "Borde", hint: "border.form · focus savia." },
  { sectionId: "spacing", label: "Espaciado", hint: "field-stack · space.100." },
] as const
