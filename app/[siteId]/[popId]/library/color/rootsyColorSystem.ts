/**
 * Sistema de color Rootsy — solo paleta de producto.
 * Cuatro familias: ceniza, bruma, savia, landing.
 * Tres contextos: POS, workspace, landing (+ librería como demo del split).
 */

import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex } from "@/lib/design-system"

const hx = rootsyColorHex
const W = ROOTSY_COLOR_SEMANTIC.white
const ON_DARK = ROOTSY_COLOR_SEMANTIC.textOnDark

/** Atajos para demos y docs — espejo de CONCEPT_TOKENS. */
export const COLOR_TOKENS = {
  bruma100: hx("bruma", "100"),
  bruma50: hx("bruma", "50"),
  bruma200: hx("bruma", "200"),
  bruma500: hx("bruma", "500"),
  bruma700: hx("bruma", "700"),
  bruma900: hx("bruma", "900"),
  savia600: hx("savia", "600"),
  savia500: hx("savia", "500"),
  savia400: hx("savia", "400"),
  savia100: hx("savia", "100"),
  ceniza600: hx("ceniza", "600"),
  ceniza700: hx("ceniza", "700"),
  ceniza500: hx("ceniza", "500"),
  ceniza300: hx("ceniza", "300"),
  landing950: hx("landing", "950"),
  white: W,
} as const

/** Colores funcionales UX — fuera de las cuatro familias. */
const FUNCTIONAL = {
  warning: "#D97706",
  warningText: "#78350F",
  danger: "#DC2626",
  dangerDark: "#B91C1C",
  warningDark: "#B45309",
  infoText: "#0F766E",
  infoDark: "#0D9488",
} as const

export type ColorThemeId = "pos" | "workspace" | "landing" | "library"

export type SemanticToken = {
  id: string
  token: string
  label: string
  hex: string
  textHex?: string
  borderHex?: string
  usage: string
  themes: ColorThemeId[]
}

export type ColorTheme = {
  id: ColorThemeId
  label: string
  subtitle: string
  description: string
  shell: string
  surface: string
  elevated: string
  border: string
  textPrimary: string
  textSecondary: string
  action: string
  actionText: string
  accent: string
}

export type ComplementaryPairing = {
  id: string
  title: string
  description: string
  primary: { label: string; hex: string }
  secondary: { label: string; hex: string }
  accent?: { label: string; hex: string }
  harmony: "split" | "analogous" | "complementary" | "neutral-action"
  usage: string
}

export type ContrastPair = {
  id: string
  foreground: string
  background: string
  ratio: string
  level: "AAA" | "AA" | "Fail"
  context: string
}

export type SurfaceLayer = {
  level: number
  label: string
  token: string
  hex: string
  usage: string
}

export type ProductColorRole = {
  roleLabel: string
  description: string
  bg: string
  text: string
  border?: string
  exampleLabel: string
}

export type ProductEmphasisLevel = {
  id: string
  label: string
  hex: string
}

export type ProductEmphasisFamily = {
  id: string
  label: string
  levels: ProductEmphasisLevel[]
}

export const ROOTSY_COLOR_MANIFESTO =
  "Cuatro familias, cero ambigüedad. Ceniza oscurece el mostrador; bruma aclara el ticket; savia mueve cada acción; landing promete antes del login. Todo lo demás — estados, gráficos, avisos — se apoya en estas rampas o en neutros funcionales documentados aparte."

export const ROOTSY_COLOR_PRINCIPLES = [
  {
    title: "Cuatro familias, roles fijos",
    detail:
      "Ceniza, bruma, savia y landing no se intercambian. Cada una responde a una superficie real del producto.",
  },
  {
    title: "Un verde operativo",
    detail:
      "Savia es el único verde de acción en POS y workspace. Landing usa forest/meadow del hero — mismo matiz, distinto contexto.",
  },
  {
    title: "Temperatura fría en operación",
    detail:
      "Ceniza y bruma comparten eje azul-ceniza. En columnas POS no entra ningún neutro cálido.",
  },
  {
    title: "Contraste como requisito",
    detail:
      "Texto bruma 900 sobre bruma 100; inverso #F8FAFC sobre ceniza 500+. Savia 600 lleva blanco en CTAs.",
  },
  {
    title: "Estados fuera de la marca",
    detail:
      "Aviso, peligro e info usan ámbar, rojo y teal funcionales — no son familias del sistema, solo semántica UX.",
  },
  {
    title: "Decoración aislada",
    detail:
      "Aurora neón (#25FE02) vive solo en capas blur de landing. Nunca texto, borde ni botón.",
  },
] as const

export const ROOTSY_THEMES: ColorTheme[] = [
  {
    id: "pos",
    label: "Mostrador POS",
    subtitle: "Vender",
    description:
      "Split ceniza + bruma con savia en acciones. Rail, canvas y cards en ceniza; ticket en bruma; totales en gradiente savia profundo.",
    shell: hx("ceniza", "950"),
    surface: hx("ceniza", "600"),
    elevated: hx("ceniza", "500"),
    border: hx("bruma", "700"),
    textPrimary: ON_DARK,
    textSecondary: hx("ceniza", "300"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
  {
    id: "workspace",
    label: "Workspace",
    subtitle: "Backoffice",
    description:
      "Superficies bruma y blanco; texto bruma 900; acciones savia 600. Header y rail opcionales en ceniza — misma familia que POS.",
    shell: hx("bruma", "100"),
    surface: W,
    elevated: hx("bruma", "50"),
    border: hx("bruma", "200"),
    textPrimary: hx("bruma", "900"),
    textSecondary: hx("bruma", "500"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
  {
    id: "landing",
    label: "Landing",
    subtitle: "Hero promocional",
    description:
      "Shell landing 950, acentos forest/meadow, CTA emerald→teal 500, auroras neón solo en atmósfera.",
    shell: hx("landing", "950"),
    surface: hx("landing", "800"),
    elevated: "#141C19",
    border: hx("ceniza", "700"),
    textPrimary: W,
    textSecondary: hx("ceniza", "300"),
    action: hx("savia", "500"),
    actionText: W,
    accent: hx("savia", "400"),
  },
  {
    id: "library",
    label: "Librería",
    subtitle: "Documentación",
    description:
      "Demostración del split: rail ceniza 700, contenido bruma 100 — la propia página de color como spec.",
    shell: hx("ceniza", "700"),
    surface: hx("bruma", "100"),
    elevated: W,
    border: hx("bruma", "200"),
    textPrimary: hx("bruma", "900"),
    textSecondary: hx("bruma", "500"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
]

export const ROOTSY_SEMANTIC_TOKENS: SemanticToken[] = [
  {
    id: "background-shell",
    token: "--color-background-shell",
    label: "Shell",
    hex: hx("ceniza", "950"),
    usage: "Viewport raíz — POS oscuro y landing.",
    themes: ["pos", "landing"],
  },
  {
    id: "background-surface",
    token: "--color-background-surface",
    label: "Superficie",
    hex: hx("ceniza", "600"),
    usage: "Canvas catálogo, panel base POS.",
    themes: ["pos"],
  },
  {
    id: "background-elevated",
    token: "--color-background-elevated",
    label: "Elevada",
    hex: hx("ceniza", "500"),
    usage: "Cards de producto sobre canvas.",
    themes: ["pos"],
  },
  {
    id: "background-ticket",
    token: "--color-background-ticket",
    label: "Ticket",
    hex: hx("bruma", "100"),
    textHex: hx("bruma", "900"),
    borderHex: hx("bruma", "200"),
    usage: "Columna TU PEDIDO, filas de ticket.",
    themes: ["pos", "workspace", "library"],
  },
  {
    id: "background-workspace",
    token: "--color-background-workspace",
    label: "Workspace",
    hex: hx("bruma", "50"),
    textHex: hx("bruma", "900"),
    borderHex: hx("bruma", "200"),
    usage: "Filas alternadas, wells, fondo secundario claro.",
    themes: ["workspace", "library"],
  },
  {
    id: "foreground-primary",
    token: "--color-foreground-primary",
    label: "Texto primario",
    hex: hx("bruma", "900"),
    usage: "Cuerpo en bruma — ticket y workspace.",
    themes: ["workspace", "pos", "library"],
  },
  {
    id: "foreground-inverse",
    token: "--color-foreground-inverse",
    label: "Texto inverso",
    hex: ON_DARK,
    usage: "Títulos sobre ceniza y cards POS.",
    themes: ["pos", "landing", "library"],
  },
  {
    id: "foreground-muted",
    token: "--color-foreground-muted",
    label: "Texto secundario",
    hex: hx("bruma", "500"),
    usage: "Metadatos — bruma 500 / ceniza 400 según fondo.",
    themes: ["pos", "workspace", "landing", "library"],
  },
  {
    id: "border-subtle",
    token: "--color-border-subtle",
    label: "Borde sutil",
    hex: hx("bruma", "200"),
    usage: "Hairlines en ticket y tablas claras.",
    themes: ["workspace", "pos", "library"],
  },
  {
    id: "border-strong",
    token: "--color-border-strong",
    label: "Borde fuerte",
    hex: hx("bruma", "700"),
    usage: "Separadores en UI ceniza — rail, toolbox.",
    themes: ["pos"],
  },
  {
    id: "action-primary",
    token: "--color-action-primary",
    label: "Acción",
    hex: hx("savia", "600"),
    textHex: W,
    usage: "Vender, guardar, confirmar — savia 600 en todo producto.",
    themes: ["pos", "workspace", "library"],
  },
  {
    id: "action-landing",
    token: "--color-action-landing",
    label: "CTA landing",
    hex: hx("savia", "500"),
    textHex: W,
    usage: "Botón hero — gradiente a teal 500 en código.",
    themes: ["landing"],
  },
  {
    id: "accent-focus",
    token: "--color-accent-focus",
    label: "Foco",
    hex: hx("savia", "400"),
    usage: "Selección rail, ring de foco, nav activo — savia 400.",
    themes: ["pos", "landing", "library"],
  },
  {
    id: "status-success",
    token: "--color-status-success",
    label: "Éxito",
    hex: hx("savia", "500"),
    textHex: hx("savia", "800"),
    usage: "Pagado, activo — savia 500/800.",
    themes: ["pos", "workspace"],
  },
  {
    id: "status-warning",
    token: "--color-status-warning",
    label: "Aviso",
    hex: FUNCTIONAL.warning,
    textHex: FUNCTIONAL.warningText,
    usage: "Pendiente, stock — ámbar funcional (fuera de paleta).",
    themes: ["workspace"],
  },
  {
    id: "status-danger",
    token: "--color-status-danger",
    label: "Peligro",
    hex: FUNCTIONAL.danger,
    textHex: W,
    usage: "Eliminar, error — rojo funcional (fuera de paleta).",
    themes: ["workspace"],
  },
  {
    id: "status-info",
    token: "--color-status-info",
    label: "Información",
    hex: hx("landing", "teal"),
    textHex: FUNCTIONAL.infoText,
    usage: "Contexto, en curso — teal landing (fuera de acción).",
    themes: ["workspace", "landing"],
  },
  {
    id: "decorative-aurora",
    token: "--color-decorative-aurora",
    label: "Aurora",
    hex: hx("landing", "neon"),
    usage: "Solo blur en landing — no UI.",
    themes: ["landing"],
  },
]

export const ROOTSY_COLOR_ROLES: ProductColorRole[] = [
  {
    roleLabel: "Ceniza · catálogo",
    description: "Rail, canvas, cards, toolbox — columna oscura POS.",
    bg: hx("ceniza", "600"),
    text: ON_DARK,
    border: hx("bruma", "700"),
    exampleLabel: "Catálogo",
  },
  {
    roleLabel: "Bruma · ticket",
    description: "Resumen pedido, listados, tablas workspace.",
    bg: hx("bruma", "100"),
    text: hx("bruma", "900"),
    border: hx("bruma", "200"),
    exampleLabel: "Tu pedido",
  },
  {
    roleLabel: "Savia · acción",
    description: "Vender, agregar, foco, totales, éxito operativo.",
    bg: hx("savia", "600"),
    text: W,
    exampleLabel: "Vender",
  },
  {
    roleLabel: "Savia · selección",
    description: "Rail activo, ring, barra de foco — sin elevar a CTA.",
    bg: hx("ceniza", "600"),
    text: hx("savia", "400"),
    border: hx("savia", "400"),
    exampleLabel: "Bebidas",
  },
  {
    roleLabel: "Landing · hero",
    description: "Fondo promocional, títulos blancos, links meadow.",
    bg: hx("landing", "950"),
    text: W,
    exampleLabel: "Rootsy",
  },
  {
    roleLabel: "Landing · CTA",
    description: "Emerald a teal — único botón primario del hero.",
    bg: hx("savia", "500"),
    text: W,
    exampleLabel: "Empezar",
  },
]

export const ROOTSY_PRODUCT_EMPHASIS: ProductEmphasisFamily[] = [
  {
    id: "ceniza",
    label: "Ceniza",
    levels: [
      { id: "z950", label: "950 · shell", hex: hx("ceniza", "950") },
      { id: "z700", label: "700 · rail", hex: hx("ceniza", "700") },
      { id: "z600", label: "600 · canvas", hex: hx("ceniza", "600") },
      { id: "z500", label: "500 · card", hex: hx("ceniza", "500") },
    ],
  },
  {
    id: "bruma",
    label: "Bruma",
    levels: [
      { id: "b100", label: "100 · panel", hex: hx("bruma", "100") },
      { id: "b200", label: "200 · divisor", hex: hx("bruma", "200") },
      { id: "b500", label: "500 · muted", hex: hx("bruma", "500") },
      { id: "b900", label: "900 · cuerpo", hex: hx("bruma", "900") },
    ],
  },
  {
    id: "savia",
    label: "Savia",
    levels: [
      { id: "s100", label: "100 · soft", hex: hx("savia", "100") },
      { id: "s400", label: "400 · foco", hex: hx("savia", "400") },
      { id: "s600", label: "600 · CTA", hex: hx("savia", "600") },
      { id: "s975", label: "975 · totales", hex: hx("savia", "975") },
    ],
  },
  {
    id: "landing",
    label: "Landing",
    levels: [
      { id: "l950", label: "950 · hero", hex: hx("landing", "950") },
      { id: "l500", label: "500 · forest", hex: hx("savia", "500") },
      { id: "l400", label: "400 · meadow", hex: hx("savia", "400") },
      { id: "t500", label: "Teal · CTA end", hex: hx("landing", "teal") },
    ],
  },
]

export const ROOTSY_COMPLEMENTARY_PAIRINGS: ComplementaryPairing[] = [
  {
    id: "pos-core",
    title: "Ceniza + Savia",
    description: "Par rector del mostrador — neutro frío sostiene, savia acciona.",
    primary: { label: "Ceniza 600", hex: hx("ceniza", "600") },
    secondary: { label: "Savia 600", hex: hx("savia", "600") },
    harmony: "neutral-action",
    usage: "Catálogo + Vender + cards seleccionadas.",
  },
  {
    id: "pos-split",
    title: "Ceniza + Bruma",
    description: "Split de columnas — mismo matiz azul-ceniza, máxima legibilidad.",
    primary: { label: "Ceniza 700", hex: hx("ceniza", "700") },
    secondary: { label: "Bruma 100", hex: hx("bruma", "100") },
    harmony: "complementary",
    usage: "Layout Vender completo.",
  },
  {
    id: "pos-focus",
    title: "Ceniza + Savia 400",
    description: "Foco sin competir con CTA — anillo y rail activo.",
    primary: { label: "Ceniza 500", hex: hx("ceniza", "500") },
    secondary: { label: "Savia 400", hex: hx("savia", "400") },
    harmony: "analogous",
    usage: "Categoría activa, card seleccionada, ring input.",
  },
  {
    id: "workspace-bruma",
    title: "Bruma + Savia",
    description: "Backoffice claro — lectura bruma 900, confirmación savia 600.",
    primary: { label: "Bruma 100", hex: hx("bruma", "100") },
    secondary: { label: "Savia 600", hex: hx("savia", "600") },
    harmony: "neutral-action",
    usage: "Formularios, modales, tablas workspace.",
  },
  {
    id: "workspace-header",
    title: "Ceniza header + Bruma body",
    description: "Continuidad POS→workspace — header ceniza, contenido bruma.",
    primary: { label: "Ceniza 700", hex: hx("ceniza", "700") },
    secondary: { label: "Bruma 100", hex: hx("bruma", "100") },
    harmony: "complementary",
    usage: "DataWorkspace, librería, listados.",
  },
  {
    id: "landing-cta",
    title: "Forest + Teal",
    description: "CTA promocional — confianza emerald, cierre teal.",
    primary: { label: "Forest 500", hex: hx("savia", "500") },
    secondary: { label: "Teal 500", hex: hx("landing", "teal") },
    harmony: "analogous",
    usage: "Botón hero landing.",
  },
  {
    id: "landing-glow",
    title: "Landing 950 + Meadow",
    description: "Hero nocturno — carbón verdoso, acento luminoso.",
    primary: { label: "Landing 950", hex: hx("landing", "950") },
    secondary: { label: "Meadow 400", hex: hx("savia", "400") },
    accent: { label: "Aurora", hex: hx("landing", "neon") },
    harmony: "split",
    usage: "Títulos, links, glow — aurora solo en blur.",
  },
  {
    id: "status-functional",
    title: "Éxito · Aviso · Peligro",
    description: "Semántica UX — savia para OK; ámbar y rojo funcionales.",
    primary: { label: "Savia 500", hex: hx("savia", "500") },
    secondary: { label: "Ámbar", hex: FUNCTIONAL.warning },
    accent: { label: "Rojo", hex: FUNCTIONAL.danger },
    harmony: "split",
    usage: "Pills y banners — no reutilizar en decoración.",
  },
]

export const ROOTSY_CONTRAST_PAIRS: ContrastPair[] = [
  {
    id: "ticket-body",
    foreground: hx("bruma", "900"),
    background: hx("bruma", "100"),
    ratio: "12.4:1",
    level: "AAA",
    context: "Texto principal en TU PEDIDO.",
  },
  {
    id: "pos-muted",
    foreground: hx("ceniza", "300"),
    background: hx("ceniza", "600"),
    ratio: "5.8:1",
    level: "AA",
    context: "Labels inactivos rail sobre ceniza 600.",
  },
  {
    id: "pos-primary-text",
    foreground: ON_DARK,
    background: hx("ceniza", "500"),
    ratio: "11.2:1",
    level: "AAA",
    context: "Título producto en card ceniza 500.",
  },
  {
    id: "cta-savia-white",
    foreground: W,
    background: hx("savia", "600"),
    ratio: "4.6:1",
    level: "AA",
    context: "Botón Vender — savia 600.",
  },
  {
    id: "cta-savia-dark",
    foreground: hx("savia", "950"),
    background: hx("savia", "400"),
    ratio: "7.1:1",
    level: "AAA",
    context: "Icono + en botón agregar.",
  },
  {
    id: "workspace-body",
    foreground: hx("bruma", "900"),
    background: hx("bruma", "100"),
    ratio: "12.4:1",
    level: "AAA",
    context: "Cuerpo en formularios workspace.",
  },
  {
    id: "landing-hero",
    foreground: W,
    background: hx("landing", "950"),
    ratio: "15.8:1",
    level: "AAA",
    context: "Headline hero landing.",
  },
  {
    id: "landing-meadow",
    foreground: hx("savia", "400"),
    background: hx("landing", "950"),
    ratio: "8.9:1",
    level: "AAA",
    context: "Links meadow en hero.",
  },
  {
    id: "library-nav",
    foreground: hx("savia", "400"),
    background: hx("ceniza", "700"),
    ratio: "6.2:1",
    level: "AA",
    context: "Nav activo savia 400 sobre ceniza 700.",
  },
  {
    id: "fail-muted-light",
    foreground: hx("bruma", "400"),
    background: hx("bruma", "100"),
    ratio: "2.8:1",
    level: "Fail",
    context: "Evitar — bruma 400 sobre bruma 100.",
  },
]

export const ROOTSY_SURFACE_STACKS: Record<ColorThemeId, SurfaceLayer[]> = {
  pos: [
    { level: 0, label: "Shell", token: "ceniza-950", hex: hx("ceniza", "950"), usage: "Viewport." },
    { level: 1, label: "Rail", token: "ceniza-700", hex: hx("ceniza", "700"), usage: "Categorías." },
    { level: 2, label: "Canvas", token: "ceniza-600", hex: hx("ceniza", "600"), usage: "Grilla." },
    { level: 3, label: "Card", token: "ceniza-500", hex: hx("ceniza", "500"), usage: "Producto." },
    { level: 4, label: "Toolbox", token: "ceniza-900", hex: hx("ceniza", "900"), usage: "Barra inferior." },
    { level: 5, label: "Totales", token: "savia-975→990", hex: hx("savia", "975"), usage: "Gradiente cobro." },
  ],
  workspace: [
    { level: 0, label: "Shell", token: "bruma-100", hex: hx("bruma", "100"), usage: "Fondo página." },
    { level: 1, label: "Surface", token: "white", hex: W, usage: "Cards, inputs." },
    { level: 2, label: "Subtle", token: "bruma-50", hex: hx("bruma", "50"), usage: "Filas zebra." },
    { level: 3, label: "Header", token: "ceniza-700", hex: hx("ceniza", "700"), usage: "Cabecera oscura." },
    { level: 4, label: "Overlay", token: "ceniza-950/40", hex: "#070A0966", usage: "Scrim modal." },
  ],
  landing: [
    { level: 0, label: "Atmosphere", token: "landing-950", hex: hx("landing", "950"), usage: "Hero fijo." },
    { level: 1, label: "Content", token: "landing-800", hex: hx("landing", "800"), usage: "Paneles." },
    { level: 2, label: "Glass", token: "white/6", hex: "#FFFFFF0F", usage: "Tiles." },
    { level: 3, label: "Glow", token: "meadow/32", hex: "#34D39952", usage: "Halos blur." },
  ],
  library: [
    { level: 0, label: "Rail", token: "ceniza-700", hex: hx("ceniza", "700"), usage: "Sidebar nav." },
    { level: 1, label: "Content", token: "bruma-100", hex: hx("bruma", "100"), usage: "Área lectura." },
    { level: 2, label: "Card", token: "white", hex: W, usage: "Docs, tablas." },
    { level: 3, label: "Header", token: "ceniza-gradient", hex: hx("ceniza", "950"), usage: "Top bar." },
  ],
}

export const ROOTSY_INTERACTION_STATES = [
  {
    id: "ws-rest",
    label: "Reposo",
    border: hx("bruma", "200"),
    background: W,
    ring: "none",
    context: "workspace",
  },
  {
    id: "ws-hover",
    label: "Hover",
    border: hx("bruma", "300"),
    background: hx("bruma", "50"),
    ring: "none",
    context: "workspace",
  },
  {
    id: "ws-focus",
    label: "Foco",
    border: hx("savia", "400"),
    background: W,
    ring: `0 0 0 3px ${hx("savia", "400")}40`,
    context: "workspace",
  },
  {
    id: "pos-rest",
    label: "Reposo POS",
    border: hx("bruma", "700"),
    background: hx("ceniza", "500"),
    ring: "none",
    context: "pos",
  },
  {
    id: "pos-active",
    label: "Activo POS",
    border: hx("savia", "400"),
    background: hx("ceniza", "600"),
    ring: `0 0 0 2px ${hx("savia", "400")}66`,
    context: "pos",
  },
  {
    id: "pos-cta",
    label: "CTA",
    border: "transparent",
    background: hx("savia", "600"),
    ring: "none",
    context: "pos",
  },
] as const

/** Secuencia categórica — solo familias de producto. */
export const ROOTSY_CHART_SEQUENCE = [
  { id: "ch1", label: "Savia", hex: hx("savia", "600"), usage: "Serie principal." },
  { id: "ch2", label: "Teal", hex: hx("landing", "teal"), usage: "Serie 2 — landing." },
  { id: "ch3", label: "Ceniza", hex: hx("ceniza", "400"), usage: "Referencia neutra." },
  { id: "ch4", label: "Bruma", hex: hx("bruma", "600"), usage: "Serie secundaria." },
  { id: "ch5", label: "Meadow", hex: hx("savia", "400"), usage: "Highlight POS." },
] as const

/** Estados en gráficos — savia + funcionales. */
export const ROOTSY_CHART_STATUS = [
  { id: "ok", label: "OK / en curso", hex: hx("savia", "500"), boldHex: hx("savia", "600") },
  { id: "warn", label: "Atención", hex: FUNCTIONAL.warning, boldHex: FUNCTIONAL.warningDark },
  { id: "crit", label: "Crítico", hex: FUNCTIONAL.danger, boldHex: FUNCTIONAL.dangerDark },
  { id: "info", label: "Información", hex: hx("landing", "teal"), boldHex: FUNCTIONAL.infoDark },
  { id: "idle", label: "Pendiente", hex: hx("ceniza", "300"), boldHex: hx("bruma", "500") },
] as const
