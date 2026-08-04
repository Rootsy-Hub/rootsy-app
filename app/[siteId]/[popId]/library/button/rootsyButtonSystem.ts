/**
 * Sistema de botones Rootsy — fuente de verdad del design system.
 * Alineado a Atlassian Button: appearance, tamaño, estados e iconografía.
 * @see https://atlassian.design/components/button
 */

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
  "Un botón comunica qué pasa después. Una acción primary por sección — el resto en default o subtle. Verbos imperativos, sentence case, iconos en currentColor. Loading sin saltar layout."

export const ROOTSY_BUTTON_PRINCIPLES = [
  {
    title: "Un primary por área",
    detail: "Solo un appearance primary por footer, toolbar o sección. Si hay dos, uno debería ser default.",
  },
  {
    title: "Verbo imperativo",
    detail: "Guardar, Crear artículo, Eliminar — nunca OK, Submit ni genéricos vacíos.",
  },
  {
    title: "Subtle antes que inventar",
    detail: "Cancelar y acciones de bajo peso usan subtle (ghost-neutral), no un estilo ad-hoc.",
  },
  {
    title: "Danger solo destructivo",
    detail: "appearance danger confirma acciones irreversibles — no para CTAs normales.",
  },
] as const

/** Appearances alineados a Atlassian — mapeados a shadcn + rootsButtonStyles. */
export const ROOTSY_BUTTON_APPEARANCES: ButtonAppearance[] = [
  {
    id: "default",
    appearance: "default",
    natureName: "Estándar",
    rootsyVariant: "outline",
    rootsyClass: "h-10 rounded-lg",
    usage: "Acciones frecuentes que no son la CTA principal — exportar, duplicar, filtrar.",
    atlassianRule: "Menos prominente que primary; texto subtle intencional.",
  },
  {
    id: "primary",
    appearance: "primary",
    natureName: "Principal",
    rootsyVariant: "default",
    rootsyClass: "h-10 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700",
    usage: "Submit de formulario, guardar, confirmar — una sola vez por área.",
    atlassianRule: "Máximo uno por sección o footer de modal.",
  },
  {
    id: "subtle",
    appearance: "subtle",
    natureName: "Sutil",
    rootsyVariant: "ghost-neutral",
    rootsyClass: "h-10 rounded-lg",
    usage: "Cancelar, quitar descuento, acciones terciarias sin borde.",
    atlassianRule: "Par ideal con primary en footers — Cancelar a la izquierda.",
  },
  {
    id: "danger",
    appearance: "danger",
    natureName: "Peligro",
    rootsyVariant: "destructive",
    rootsyClass: "h-10 bg-rose-600 font-semibold text-white shadow-sm hover:bg-rose-500 active:bg-rose-700",
    usage: "Eliminar definitivamente, confirmación destructiva en alert dialog.",
    atlassianRule: "Solo acciones irreversibles — nunca Save en naranja/rojo.",
  },
  {
    id: "link",
    appearance: "link",
    natureName: "Enlace",
    rootsyVariant: "link",
    usage: "Navegación inline de bajo peso — Ver detalle, Más información.",
    atlassianRule: "Preferir link button antes de inventar texto suelto clickeable.",
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
  { sectionId: "radius", label: "Radio", hint: "radius.medium en botones e inputs." },
  { sectionId: "border", label: "Borde", hint: "border.width.focused en focus ring." },
  { sectionId: "iconography", label: "Iconografía", hint: "Iconsax / lucide size-4 en botones." },
  { sectionId: "motion", label: "Movimiento", hint: "transition-all en hover y pressed." },
] as const
