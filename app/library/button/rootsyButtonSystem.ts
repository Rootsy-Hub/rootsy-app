/**
 * Sistema de botones Rootsy — fuente de verdad del design system.
 * Colores: familia savia (primary/link), bruma (neutral), funcional (danger).
 */

import { rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex

export type ButtonAppearance = {
  id: string
  appearance: string
  natureName: string
  rootsyVariant: string
  rootsyClass?: string
  usage: string
  atlassianRule: string
}

export type ButtonSizeToken = {
  id: string
  token: string
  tailwind: string
  height: string
  usage: string
}

export type ButtonSemanticMapping = {
  appearance: string
  context: string
  component: string
  source: string
}

export const ROOTSY_BUTTON_MANIFESTO =
  "Un botón comunica qué pasa después. Savia marca la acción principal — una por área. El resto va en default o subtle. Verbos imperativos, iconos en currentColor, loading sin saltar layout."

export const ROOTSY_BUTTON_PRINCIPLES = [
  {
    title: "Un primary por área",
    detail:
      "Solo un appearance primary por footer, toolbar o sección. Savia aparece donde hay una sola acción decisiva.",
  },
  {
    title: "Verbo imperativo",
    detail: "Guardar, Crear artículo, Eliminar — nunca OK, Submit ni genéricos vacíos.",
  },
  {
    title: "Subtle antes que inventar",
    detail:
      "Cancelar y acciones terciarias usan subtle (ghost-neutral), no un estilo ad-hoc.",
  },
  {
    title: "Danger solo destructivo",
    detail:
      "Appearance danger confirma acciones irreversibles — no para CTAs normales.",
  },
] as const

export type ButtonVariantState = "default" | "disabled" | "loading" | "icon"

export const BUTTON_VARIANT_MATRIX_COLUMNS: ReadonlyArray<{
  id: ButtonVariantState
  label: string
}> = [
  { id: "default", label: "Default" },
  { id: "disabled", label: "Deshabilitado" },
  { id: "loading", label: "Cargando" },
  { id: "icon", label: "Con ícono" },
] as const

export type ButtonColorToken = {
  appearance: string
  role: string
  tokens: ReadonlyArray<{ label: string; token: string; hex: string }>
}

/** Mapeo appearance → familia de color nueva (sombra · bruma · savia). */
export const ROOTSY_BUTTON_COLOR_TOKENS: ButtonColorToken[] = [
  {
    appearance: "primary",
    role: "Acción principal — savia",
    tokens: [
      { label: "Fondo", token: "savia-600", hex: hx("savia", "600") },
      { label: "Hover", token: "savia-500", hex: hx("savia", "500") },
      { label: "Active", token: "savia-700", hex: hx("savia", "700") },
      { label: "Texto", token: "white", hex: "#FFFFFF" },
    ],
  },
  {
    appearance: "default",
    role: "Secundario — bruma + borde",
    tokens: [
      { label: "Fondo", token: "white", hex: "#FFFFFF" },
      { label: "Borde", token: "bruma-200", hex: hx("bruma", "200") },
      { label: "Hover", token: "bruma-50", hex: hx("bruma", "50") },
      { label: "Texto", token: "bruma-900", hex: hx("bruma", "900") },
    ],
  },
  {
    appearance: "subtle",
    role: "Terciario — bruma muted",
    tokens: [
      { label: "Fondo", token: "transparent", hex: "—" },
      { label: "Hover", token: "bruma-50", hex: hx("bruma", "50") },
      { label: "Texto", token: "bruma-600", hex: hx("bruma", "600") },
    ],
  },
  {
    appearance: "danger",
    role: "Destructivo — funcional",
    tokens: [
      { label: "Fondo", token: "danger", hex: "#DC2626" },
      { label: "Hover", token: "danger-light", hex: "#EF4444" },
      { label: "Active", token: "danger-dark", hex: "#B91C1C" },
    ],
  },
  {
    appearance: "link",
    role: "Enlace — savia texto",
    tokens: [
      { label: "Default", token: "savia-700", hex: hx("savia", "700") },
      { label: "Hover", token: "savia-600", hex: hx("savia", "600") },
      { label: "Active", token: "savia-800", hex: hx("savia", "800") },
    ],
  },
]

/** Appearances del sistema — mapeados a shadcn + rootsButtonStyles. */
export const ROOTSY_BUTTON_APPEARANCES: ButtonAppearance[] = [
  {
    id: "primary",
    appearance: "primary",
    natureName: "Savia",
    rootsyVariant: "default",
    rootsyClass: "bg-[var(--rootsy-savia-600)] hover:bg-[var(--rootsy-savia-500)]",
    usage: "Submit de formulario, guardar, confirmar — una sola vez por área.",
    atlassianRule: "Máximo uno por sección o footer de modal.",
  },
  {
    id: "default",
    appearance: "default",
    natureName: "Borde",
    rootsyVariant: "outline",
    rootsyClass: "border bruma-200 · hover bruma-50 · texto bruma-900",
    usage: "Acciones frecuentes que no son la CTA principal — exportar, duplicar, filtrar.",
    atlassianRule: "Menos prominente que primary; borde neutro sobre bruma.",
  },
  {
    id: "subtle",
    appearance: "subtle",
    natureName: "Sutil",
    rootsyVariant: "ghost-neutral",
    rootsyClass: "transparent · hover bruma-50",
    usage: "Cancelar, quitar descuento, acciones terciarias sin borde.",
    atlassianRule: "Par ideal con primary en footers — Cancelar a la izquierda.",
  },
  {
    id: "danger",
    appearance: "danger",
    natureName: "Destructivo",
    rootsyVariant: "destructive",
    rootsyClass: "danger #DC2626 · hover #EF4444",
    usage: "Eliminar definitivamente, confirmación destructiva en alert dialog.",
    atlassianRule: "Solo acciones irreversibles — nunca Save en rojo.",
  },
  {
    id: "danger-subtle",
    appearance: "danger-subtle",
    natureName: "Destructivo sutil",
    rootsyVariant: "destructive-subtle",
    rootsyClass: "texto danger · hover danger/10",
    usage: "Quitar ítem del carrito, eliminar de la operación — footer izquierdo del modal.",
    atlassianRule: "Par con primary a la derecha — menos peso que danger filled.",
  },
  {
    id: "link",
    appearance: "link",
    natureName: "Enlace",
    rootsyVariant: "link",
    rootsyClass: "text savia-700 · hover savia-600",
    usage: "Navegación inline de bajo peso — Ver detalle, Más información.",
    atlassianRule: "Preferir link button antes de texto suelto clickeable.",
  },
]

export const ROOTSY_BUTTON_SIZES: ButtonSizeToken[] = [
  {
    id: "compact",
    token: "compact",
    tailwind: "size=sm · h-8",
    height: "32px",
    usage: "Tablas, toolbars densos, chips de acción — nunca como default global.",
  },
  {
    id: "default",
    token: "default",
    tailwind: "size=default · h-9 / h-10",
    height: "36–40px",
    usage: "Formularios, modales, workspace — altura estándar h-10 en diálogos.",
  },
  {
    id: "large",
    token: "large",
    tailwind: "size=lg · h-12 px-6 text-base",
    height: "48px",
    usage: "CTAs hero o empty states — uso puntual, no reemplaza default.",
  },
  {
    id: "icon-compact",
    token: "icon-compact",
    tailwind: "RootsIconButton · compact · size-8 · icon size-4",
    height: "32px",
    usage: "IconButton compact — light, dark, secondary y ghost.",
  },
  {
    id: "icon",
    token: "icon",
    tailwind: "RootsIconButton · default · size-10 · icon size-5",
    height: "40px",
    usage: "IconButton default — header workspace, menú, utilidades.",
  },
  {
    id: "icon-large",
    token: "icon-large",
    tailwind: "RootsIconButton · large · size-12 · icon size-5",
    height: "48px",
    usage: "IconButton large — menú Home (secondary), CTAs icon-only.",
  },
  {
    id: "icon-light",
    token: "icon-light",
    tailwind: "RootsIconButton · tone=light · surface=light",
    height: "32–48px",
    usage: "Outline neutro — toolbar en superficies claras.",
  },
  {
    id: "icon-secondary-light",
    token: "icon-secondary-light",
    tailwind: "RootsIconButton · tone=secondary · surface=light",
    height: "32–48px",
    usage: "Chrome con borde — menú Home, header workspace claro.",
  },
  {
    id: "icon-ghost-light",
    token: "icon-ghost-light",
    tailwind: "RootsIconButton · tone=ghost · surface=light",
    height: "32–48px",
    usage: "Sin borde — volver detalle, campana/ajustes menú claro.",
  },
  {
    id: "icon-dark",
    token: "icon-dark",
    tailwind: "RootsIconButton · tone=dark",
    height: "32–48px",
    usage: "Chrome bosque nocturno — volver al menú, header workspace.",
  },
  {
    id: "icon-secondary-dark",
    token: "icon-secondary-dark",
    tailwind: "RootsIconButton · tone=secondary · surface=dark",
    height: "32–48px",
    usage: "Mismo chrome que tone=dark — navegación sobre fondo oscuro.",
  },
  {
    id: "icon-ghost-dark",
    token: "icon-ghost-dark",
    tailwind: "RootsIconButton · tone=ghost · surface=dark",
    height: "32–48px",
    usage: "Sin borde — campana/ajustes sobre menú Nature o cristal POP.",
  },
  {
    id: "icon-action",
    token: "icon-action",
    tailwind: "RootsIconButton · tone=action · compact",
    height: "32px",
    usage: "Acciones de fila — neutral / edit / destructive.",
  },
]

export const ROOTSY_BUTTON_STATES = [
  {
    state: "default",
    description: "Reposo — borde o fill según appearance.",
  },
  {
    state: "hover / pressed",
    description: "Tokens hover y active en primary/danger — no hand-author fuera de rootsButtonStyles.",
  },
  {
    state: "disabled",
    description: "disabled + opacity-50 — eventos bloqueados.",
  },
  {
    state: "loading",
    description: "RootsProgressButton — spinner + loadingLabel, sin cambiar ancho.",
  },
  {
    state: "selected",
    description: "aria-pressed=true en toggles — borde selected 2px.",
  },
] as const

export const ROOTSY_BUTTON_SEMANTIC: ButtonSemanticMapping[] = [
  {
    appearance: "primary",
    context: "Modal footer · submit async",
    component: "RootsProgressButton + saleOpDialogPrimaryBtn",
    source: "rootsy-dialog · CheckoutDialogFooter",
  },
  {
    appearance: "subtle",
    context: "Modal footer · cancelar",
    component: "Button variant=ghost-neutral",
    source: "components/ui/button",
  },
  {
    appearance: "default",
    context: "Acciones secundarias en toolbar",
    component: "Button variant=outline size=sm",
    source: "components/ui/button",
  },
  {
    appearance: "danger",
    context: "Alert dialog · confirmar borrado",
    component: "Button + saleOpDialogDestructiveBtn",
    source: "saleOperationStyles",
  },
  {
    appearance: "icon",
    context: "Toolbar / header · light y dark",
    component: "RootsIconButton tone=light|dark",
    source: "components/rootsy-button/RootsIconButton.tsx",
  },
  {
    appearance: "icon-secondary",
    context: "Menú Home · header workspace claro",
    component: "RootsIconButton tone=secondary surface=light",
    source: "components/rootsy-button/RootsIconButton.tsx",
  },
  {
    appearance: "icon-secondary-dark",
    context: "Header workspace nocturno · chrome con borde",
    component: "RootsIconButton tone=secondary surface=dark",
    source: "components/rootsy-button/RootsIconButton.tsx",
  },
  {
    appearance: "icon-ghost",
    context: "Volver detalle · menú campana/ajustes (claro)",
    component: "RootsIconButton tone=ghost surface=light",
    source: "components/rootsy-button/RootsIconButton.tsx",
  },
  {
    appearance: "icon-ghost-dark",
    context: "Utilidades sobre bosque nocturno / menú Nature",
    component: "RootsIconButton tone=ghost surface=dark",
    source: "components/rootsy-button/RootsIconButton.tsx",
  },
  {
    appearance: "icon-action",
    context: "Acciones de fila en tablas",
    component: "RootsIconButton tone=action",
    source: "components/rootsy-button/RootsIconButton.tsx",
  },
]

export const BUTTON_GUIDELINES = {
  do: [
    "Un primary por footer o sección visible",
    "Iconos size-4 heredando currentColor",
    "aria-label en todo botón solo-icono",
    "RootsProgressButton en submits async",
    "Cancelar subtle a la izquierda · primary a la derecha",
  ],
  dont: [
    "Dos botones primary en el mismo footer",
    "Danger para guardar o acciones neutras",
    "Compact como tamaño default en formularios",
    "Icon-only sin nombre accesible",
    "Loading que cambie el ancho del botón",
  ],
} as const

export const BUTTON_RELATED_LINKS = [
  { sectionId: "colors-new", label: "Color", hint: "Savia en primary · bruma en superficies." },
  { sectionId: "component-text", label: "Texto", hint: "Labels y copy en botones." },
  { sectionId: "radius", label: "Radio", hint: "radius.lg en botones e inputs." },
  { sectionId: "iconography", label: "Iconografía", hint: "Lucide size-4 en botones con texto." },
  { sectionId: "motion", label: "Movimiento", hint: "Transiciones en hover y pressed." },
] as const

// ─── Icon button · modelo foundations (tema + énfasis) ───────────────────────

export type IconButtonThemeId = "workspace" | "pos"

export type IconButtonEmphasisId = "outlined" | "filled" | "ghost" | "primary"

export type IconButtonRowIntentId = "neutral" | "edit" | "destructive"

export type IconButtonSizeId = "compact" | "default" | "large"

export const ROOTSY_ICON_BUTTON_MANIFESTO =
  "Solo ícono cuando el verbo no aporta — siempre con aria-label. Tema workspace o POS; énfasis outlined, filled o ghost. Savia solo en acciones de fila edit — danger funcional en destructive."

export const ROOTSY_ICON_BUTTON_SIZES: {
  id: IconButtonSizeId
  token: string
  hitAreaToken: string
  hitAreaPx: number
  iconToken: string
  iconPx: number
  usage: string
}[] = [
  {
    id: "compact",
    token: "icon-button.size.compact",
    hitAreaToken: "space.400",
    hitAreaPx: 32,
    iconToken: "icon.size.medium",
    iconPx: 16,
    usage: "Tablas, filas densas, acciones de fila.",
  },
  {
    id: "default",
    token: "icon-button.size.default",
    hitAreaToken: "space.500",
    hitAreaPx: 40,
    iconToken: "icon.size.large",
    iconPx: 20,
    usage: "Header workspace, toolbar, utilidades.",
  },
  {
    id: "large",
    token: "icon-button.size.large",
    hitAreaToken: "space.600",
    hitAreaPx: 48,
    iconToken: "icon.size.xlarge",
    iconPx: 24,
    usage: "CTA icon-only puntual — hit area space.600 · ícono xlarge.",
  },
]

export const ROOTSY_ICON_BUTTON_VARIANTS: {
  id: string
  theme: IconButtonThemeId
  emphasis: IconButtonEmphasisId
  usage: string
}[] = [
  {
    id: "workspace-outlined",
    theme: "workspace",
    emphasis: "outlined",
    usage: "Outline neutro — toolbar y acciones secundarias sobre bruma.",
  },
  {
    id: "workspace-filled",
    theme: "workspace",
    emphasis: "filled",
    usage: "Chrome con relleno — menú Home, header workspace.",
  },
  {
    id: "workspace-ghost",
    theme: "workspace",
    emphasis: "ghost",
    usage: "Sin borde — volver, campana y ajustes sobre superficie clara.",
  },
  {
    id: "pos-outlined",
    theme: "pos",
    emphasis: "outlined",
    usage: "Chrome con borde — header nocturno sobre sombra.",
  },
  {
    id: "pos-filled",
    theme: "pos",
    emphasis: "filled",
    usage: "Mismo chrome elevado — navegación sobre fondo oscuro.",
  },
  {
    id: "pos-ghost",
    theme: "pos",
    emphasis: "ghost",
    usage: "Sin borde — utilidades sobre tema POS.",
  },
  {
    id: "pos-primary",
    theme: "pos",
    emphasis: "primary",
    usage: "Acción principal del header módulo — savia-600 sobre chrome POS.",
  },
]

export const ROOTSY_ICON_BUTTON_ROW_INTENTS: {
  id: IconButtonRowIntentId
  token: string
  usage: string
}[] = [
  {
    id: "neutral",
    token: "icon-button.row.neutral",
    usage: "Ver detalle, acciones de lectura en tablas.",
  },
  {
    id: "edit",
    token: "icon-button.row.edit",
    usage: "Editar fila — hover savia, default bruma secundario.",
  },
  {
    id: "destructive",
    token: "icon-button.row.destructive",
    usage: "Eliminar fila — danger funcional.",
  },
]

export const ROOTSY_ICON_BUTTON_GUIDELINES = {
  do: [
    "aria-label en todo control solo-ícono",
    "Tema workspace en shell claro · tema POS en shell oscuro",
    "icon.size.medium (16px) en compact · icon.size.large (20px) en default · icon.size.xlarge (24px) en large",
    "radius.medium en hit area",
  ],
  dont: [
    "Inventar tone=light/dark legacy — usar theme + emphasis",
    "Hex sueltos — solo sombra · bruma · savia + funcional danger",
    "Large como tamaño default global",
    "Ícono sin label accesible",
  ],
} as const
