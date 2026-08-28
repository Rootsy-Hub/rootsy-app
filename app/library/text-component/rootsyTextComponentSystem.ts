/**
 * Componente Texto — roles tipográficos en UI (no controles de formulario).
 * Tokens en typography/rootsyTypographySystem.ts y lib/design-system/tokens/typography.ts
 */

export const ROOTSY_TEXT_COMPONENT_MANIFESTO =
  "El texto en componentes guía la mirada: un título principal, cuerpo legible, metadatos discretos y montos que destacan solos. Cada rol tiene su token — no se mezclan pesos ni familias al azar."

export const ROOTSY_TEXT_COMPONENT_PRINCIPLES = [
  {
    title: "Un rol por bloque",
    detail:
      "Título, label, cuerpo, meta y métrica son capas distintas. No uses heading.bold donde va body.medium.",
  },
  {
    title: "UI por defecto",
    detail:
      "Inter en chrome. Nunito Sans en prosa. Inter tabular en números.",
  },
  {
    title: "12px con criterio",
    detail:
      "body.small para hints y timestamps — nunca para párrafos que el usuario debe leer de corrido.",
  },
] as const

export type TextComponentLabelRole = {
  id: string
  label: string
  token: string
  preview: string
  specs: string
  usage: string
  source: string
}

export const TEXT_COMPONENT_LABEL_ROLES: TextComponentLabelRole[] = [
  {
    id: "section",
    label: "Sección",
    token: "component.label.section",
    preview: "Opciones",
    specs: "10px · semibold · uppercase · tracking 0.12em",
    usage: "Agrupa campos dentro de un panel o modal — CheckoutSectionLabel.",
    source: "components/rootsy-form/rootsFormStyles",
  },
  {
    id: "field",
    label: "Campo",
    token: "component.label.field",
    preview: "Nombre del artículo",
    specs: "14px · medium · sentence case",
    usage: "Label visible junto al input cuando no usa el patrón de sección.",
    source: "TypographyProductScreenDemo · modales upsert",
  },
  {
    id: "eyebrow",
    label: "Eyebrow",
    token: "component.label.eyebrow",
    preview: "Componentes",
    specs: "11px · medium · uppercase · tracking 0.12em · muted",
    usage: "Contexto de página en librería y workspaces — eyebrow sobre el título.",
    source: "libraryColorTheme · libraryContentEyebrowClass",
  },
  {
    id: "list-header",
    label: "Encabezado de lista",
    token: "component.label.list-header",
    preview: "Tu pedido",
    specs: "12px · semibold · uppercase · tracking wide",
    usage: "Título compacto dentro de cards y listas — no compite con el título de página.",
    source: "TypographyInContextDemo",
  },
]

export type TextComponentMetaRole = {
  id: string
  label: string
  token: string
  preview: string
  usage: string
}

export const TEXT_COMPONENT_META_ROLES: TextComponentMetaRole[] = [
  {
    id: "hint",
    label: "Hint",
    token: "font.body.small + color.muted",
    preview: "Se guarda al confirmar la venta.",
    usage: "Ayuda breve debajo de un control o acción.",
  },
  {
    id: "timestamp",
    label: "Timestamp",
    token: "font.body.small + color.muted",
    preview: "Actualizado hace 2 min",
    usage: "Fechas relativas en filas y actividad reciente.",
  },
  {
    id: "context",
    label: "Contexto",
    token: "font.body.small + color.muted",
    preview: "Panadería · x2",
    usage: "Categoría, cantidad o subtítulo secundario en listas.",
  },
  {
    id: "counter",
    label: "Contador",
    token: "font.body.small + color.muted",
    preview: "3 seleccionados",
    usage: "Totales auxiliares en toolbars y selección múltiple.",
  },
]

export const TEXT_COMPONENT_HEADING_GUIDELINES = [
  {
    doText: "font.heading.large una vez por pantalla — el resto baja de nivel.",
    dontText: "Dos títulos large compitiendo en la misma vista.",
  },
  {
    doText: "font.heading.small semibold en headers de modal; heading.medium en secciones de librería.",
    dontText: "Bold suelto sin token — rompe consistencia y accesibilidad.",
  },
] as const

export const TEXT_COMPONENT_BODY_GUIDELINES = [
  {
    doText: "font.body (14px) en filas, flags y copy de apoyo corto.",
    dontText: "font.body.large en labels o botones — ocupa demasiado.",
  },
  {
    doText: "font-medium (500) en nombres de ítem junto a íconos line.",
    dontText: "Regular al lado de íconos — el trazo no alinea visualmente.",
  },
] as const

export const TEXT_COMPONENT_METRIC_GUIDELINES = [
  {
    doText: "Inter bold tabular en el número — body.small muted en la etiqueta debajo.",
    dontText: "Mismo peso y tamaño en monto y descripción.",
  },
  {
    doText: "metric.large en KPI hero; metric.small en tiles compactos.",
    dontText: "Metric token en ejes de chart o leyendas — ahí va body.small.",
  },
] as const
