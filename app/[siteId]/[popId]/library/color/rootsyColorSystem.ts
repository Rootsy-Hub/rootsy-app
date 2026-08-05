/**
 * Sistema de color Rootsy — solo paleta de producto.
 * Cuatro familias: ceniza, bruma, savia, landing.
 * Tres contextos: POS, workspace, landing (+ librería como demo del split).
 */

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
    shell: "#070A09",
    surface: "#20262E",
    elevated: "#252B34",
    border: "#334155",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    action: "#059669",
    actionText: "#FFFFFF",
    accent: "#34D399",
  },
  {
    id: "workspace",
    label: "Workspace",
    subtitle: "Backoffice",
    description:
      "Superficies bruma y blanco; texto bruma 900; acciones savia 600. Header y rail opcionales en ceniza — misma familia que POS.",
    shell: "#EEF1F5",
    surface: "#FFFFFF",
    elevated: "#F4F6F9",
    border: "#DFE4EA",
    textPrimary: "#121417",
    textSecondary: "#64748B",
    action: "#059669",
    actionText: "#FFFFFF",
    accent: "#34D399",
  },
  {
    id: "landing",
    label: "Landing",
    subtitle: "Hero promocional",
    description:
      "Shell landing 950, acentos forest/meadow, CTA emerald→teal 500, auroras neón solo en atmósfera.",
    shell: "#080C0B",
    surface: "#0A0E0D",
    elevated: "#141C19",
    border: "#1A2027",
    textPrimary: "#FFFFFF",
    textSecondary: "#94A3B8",
    action: "#10B981",
    actionText: "#FFFFFF",
    accent: "#34D399",
  },
  {
    id: "library",
    label: "Librería",
    subtitle: "Documentación",
    description:
      "Demostración del split: rail ceniza 700, contenido bruma 100 — la propia página de color como spec.",
    shell: "#1A2027",
    surface: "#EEF1F5",
    elevated: "#FFFFFF",
    border: "#DFE4EA",
    textPrimary: "#121417",
    textSecondary: "#64748B",
    action: "#059669",
    actionText: "#FFFFFF",
    accent: "#34D399",
  },
]

export const ROOTSY_SEMANTIC_TOKENS: SemanticToken[] = [
  {
    id: "background-shell",
    token: "--color-background-shell",
    label: "Shell",
    hex: "#070A09",
    usage: "Viewport raíz — POS oscuro y landing.",
    themes: ["pos", "landing"],
  },
  {
    id: "background-surface",
    token: "--color-background-surface",
    label: "Superficie",
    hex: "#20262E",
    usage: "Canvas catálogo, panel base POS.",
    themes: ["pos"],
  },
  {
    id: "background-elevated",
    token: "--color-background-elevated",
    label: "Elevada",
    hex: "#252B34",
    usage: "Cards de producto sobre canvas.",
    themes: ["pos"],
  },
  {
    id: "background-ticket",
    token: "--color-background-ticket",
    label: "Ticket",
    hex: "#EEF1F5",
    textHex: "#121417",
    borderHex: "#DFE4EA",
    usage: "Columna TU PEDIDO, filas de ticket.",
    themes: ["pos", "workspace", "library"],
  },
  {
    id: "background-workspace",
    token: "--color-background-workspace",
    label: "Workspace",
    hex: "#F4F6F9",
    textHex: "#121417",
    borderHex: "#DFE4EA",
    usage: "Filas alternadas, wells, fondo secundario claro.",
    themes: ["workspace", "library"],
  },
  {
    id: "foreground-primary",
    token: "--color-foreground-primary",
    label: "Texto primario",
    hex: "#121417",
    usage: "Cuerpo en bruma — ticket y workspace.",
    themes: ["workspace", "pos", "library"],
  },
  {
    id: "foreground-inverse",
    token: "--color-foreground-inverse",
    label: "Texto inverso",
    hex: "#F8FAFC",
    usage: "Títulos sobre ceniza y cards POS.",
    themes: ["pos", "landing", "library"],
  },
  {
    id: "foreground-muted",
    token: "--color-foreground-muted",
    label: "Texto secundario",
    hex: "#64748B",
    usage: "Metadatos — bruma 500 / ceniza 400 según fondo.",
    themes: ["pos", "workspace", "landing", "library"],
  },
  {
    id: "border-subtle",
    token: "--color-border-subtle",
    label: "Borde sutil",
    hex: "#DFE4EA",
    usage: "Hairlines en ticket y tablas claras.",
    themes: ["workspace", "pos", "library"],
  },
  {
    id: "border-strong",
    token: "--color-border-strong",
    label: "Borde fuerte",
    hex: "#334155",
    usage: "Separadores en UI ceniza — rail, toolbox.",
    themes: ["pos"],
  },
  {
    id: "action-primary",
    token: "--color-action-primary",
    label: "Acción",
    hex: "#059669",
    textHex: "#FFFFFF",
    usage: "Vender, guardar, confirmar — savia 600 en todo producto.",
    themes: ["pos", "workspace", "library"],
  },
  {
    id: "action-landing",
    token: "--color-action-landing",
    label: "CTA landing",
    hex: "#10B981",
    textHex: "#FFFFFF",
    usage: "Botón hero — gradiente a #14B8A6 en código.",
    themes: ["landing"],
  },
  {
    id: "accent-focus",
    token: "--color-accent-focus",
    label: "Foco",
    hex: "#34D399",
    usage: "Selección rail, ring de foco, nav activo — savia 400.",
    themes: ["pos", "landing", "library"],
  },
  {
    id: "status-success",
    token: "--color-status-success",
    label: "Éxito",
    hex: "#10B981",
    textHex: "#065F46",
    usage: "Pagado, activo — savia 500/800.",
    themes: ["pos", "workspace"],
  },
  {
    id: "status-warning",
    token: "--color-status-warning",
    label: "Aviso",
    hex: "#D97706",
    textHex: "#78350F",
    usage: "Pendiente, stock — ámbar funcional (fuera de paleta).",
    themes: ["workspace"],
  },
  {
    id: "status-danger",
    token: "--color-status-danger",
    label: "Peligro",
    hex: "#DC2626",
    textHex: "#FFFFFF",
    usage: "Eliminar, error — rojo funcional (fuera de paleta).",
    themes: ["workspace"],
  },
  {
    id: "status-info",
    token: "--color-status-info",
    label: "Información",
    hex: "#14B8A6",
    textHex: "#0F766E",
    usage: "Contexto, en curso — teal landing (fuera de acción).",
    themes: ["workspace", "landing"],
  },
  {
    id: "decorative-aurora",
    token: "--color-decorative-aurora",
    label: "Aurora",
    hex: "#25FE02",
    usage: "Solo blur en landing — no UI.",
    themes: ["landing"],
  },
]

export const ROOTSY_COLOR_ROLES: ProductColorRole[] = [
  {
    roleLabel: "Ceniza · catálogo",
    description: "Rail, canvas, cards, toolbox — columna oscura POS.",
    bg: "#20262E",
    text: "#F8FAFC",
    border: "#334155",
    exampleLabel: "Catálogo",
  },
  {
    roleLabel: "Bruma · ticket",
    description: "Resumen pedido, listados, tablas workspace.",
    bg: "#EEF1F5",
    text: "#121417",
    border: "#DFE4EA",
    exampleLabel: "Tu pedido",
  },
  {
    roleLabel: "Savia · acción",
    description: "Vender, agregar, foco, totales, éxito operativo.",
    bg: "#059669",
    text: "#FFFFFF",
    exampleLabel: "Vender",
  },
  {
    roleLabel: "Savia · selección",
    description: "Rail activo, ring, barra de foco — sin elevar a CTA.",
    bg: "#20262E",
    text: "#34D399",
    border: "#34D399",
    exampleLabel: "Bebidas",
  },
  {
    roleLabel: "Landing · hero",
    description: "Fondo promocional, títulos blancos, links meadow.",
    bg: "#080C0B",
    text: "#FFFFFF",
    exampleLabel: "Rootsy",
  },
  {
    roleLabel: "Landing · CTA",
    description: "Emerald a teal — único botón primario del hero.",
    bg: "#10B981",
    text: "#FFFFFF",
    exampleLabel: "Empezar",
  },
]

export const ROOTSY_PRODUCT_EMPHASIS: ProductEmphasisFamily[] = [
  {
    id: "ceniza",
    label: "Ceniza",
    levels: [
      { id: "z950", label: "950 · shell", hex: "#070A09" },
      { id: "z700", label: "700 · rail", hex: "#1A2027" },
      { id: "z600", label: "600 · canvas", hex: "#20262E" },
      { id: "z500", label: "500 · card", hex: "#252B34" },
    ],
  },
  {
    id: "bruma",
    label: "Bruma",
    levels: [
      { id: "b100", label: "100 · panel", hex: "#EEF1F5" },
      { id: "b200", label: "200 · divisor", hex: "#DFE4EA" },
      { id: "b500", label: "500 · muted", hex: "#64748B" },
      { id: "b900", label: "900 · cuerpo", hex: "#121417" },
    ],
  },
  {
    id: "savia",
    label: "Savia",
    levels: [
      { id: "s100", label: "100 · soft", hex: "#D1FAE5" },
      { id: "s400", label: "400 · foco", hex: "#34D399" },
      { id: "s600", label: "600 · CTA", hex: "#059669" },
      { id: "s975", label: "975 · totales", hex: "#07120E" },
    ],
  },
  {
    id: "landing",
    label: "Landing",
    levels: [
      { id: "l950", label: "950 · hero", hex: "#080C0B" },
      { id: "l500", label: "500 · forest", hex: "#10B981" },
      { id: "l400", label: "400 · meadow", hex: "#34D399" },
      { id: "t500", label: "Teal · CTA end", hex: "#14B8A6" },
    ],
  },
]

export const ROOTSY_COMPLEMENTARY_PAIRINGS: ComplementaryPairing[] = [
  {
    id: "pos-core",
    title: "Ceniza + Savia",
    description: "Par rector del mostrador — neutro frío sostiene, savia acciona.",
    primary: { label: "Ceniza 600", hex: "#20262E" },
    secondary: { label: "Savia 600", hex: "#059669" },
    harmony: "neutral-action",
    usage: "Catálogo + Vender + cards seleccionadas.",
  },
  {
    id: "pos-split",
    title: "Ceniza + Bruma",
    description: "Split de columnas — mismo matiz azul-ceniza, máxima legibilidad.",
    primary: { label: "Ceniza 700", hex: "#1A2027" },
    secondary: { label: "Bruma 100", hex: "#EEF1F5" },
    harmony: "complementary",
    usage: "Layout Vender completo.",
  },
  {
    id: "pos-focus",
    title: "Ceniza + Savia 400",
    description: "Foco sin competir con CTA — anillo y rail activo.",
    primary: { label: "Ceniza 500", hex: "#252B34" },
    secondary: { label: "Savia 400", hex: "#34D399" },
    harmony: "analogous",
    usage: "Categoría activa, card seleccionada, ring input.",
  },
  {
    id: "workspace-bruma",
    title: "Bruma + Savia",
    description: "Backoffice claro — lectura bruma 900, confirmación savia 600.",
    primary: { label: "Bruma 100", hex: "#EEF1F5" },
    secondary: { label: "Savia 600", hex: "#059669" },
    harmony: "neutral-action",
    usage: "Formularios, modales, tablas workspace.",
  },
  {
    id: "workspace-header",
    title: "Ceniza header + Bruma body",
    description: "Continuidad POS→workspace — header ceniza, contenido bruma.",
    primary: { label: "Ceniza 700", hex: "#1A2027" },
    secondary: { label: "Bruma 100", hex: "#EEF1F5" },
    harmony: "complementary",
    usage: "DataWorkspace, librería, listados.",
  },
  {
    id: "landing-cta",
    title: "Forest + Teal",
    description: "CTA promocional — confianza emerald, cierre teal.",
    primary: { label: "Forest 500", hex: "#10B981" },
    secondary: { label: "Teal 500", hex: "#14B8A6" },
    harmony: "analogous",
    usage: "Botón hero landing.",
  },
  {
    id: "landing-glow",
    title: "Landing 950 + Meadow",
    description: "Hero nocturno — carbón verdoso, acento luminoso.",
    primary: { label: "Landing 950", hex: "#080C0B" },
    secondary: { label: "Meadow 400", hex: "#34D399" },
    accent: { label: "Aurora", hex: "#25FE02" },
    harmony: "split",
    usage: "Títulos, links, glow — aurora solo en blur.",
  },
  {
    id: "status-functional",
    title: "Éxito · Aviso · Peligro",
    description: "Semántica UX — savia para OK; ámbar y rojo funcionales.",
    primary: { label: "Savia 500", hex: "#10B981" },
    secondary: { label: "Ámbar", hex: "#D97706" },
    accent: { label: "Rojo", hex: "#DC2626" },
    harmony: "split",
    usage: "Pills y banners — no reutilizar en decoración.",
  },
]

export const ROOTSY_CONTRAST_PAIRS: ContrastPair[] = [
  {
    id: "ticket-body",
    foreground: "#121417",
    background: "#EEF1F5",
    ratio: "12.4:1",
    level: "AAA",
    context: "Texto principal en TU PEDIDO.",
  },
  {
    id: "pos-muted",
    foreground: "#94A3B8",
    background: "#20262E",
    ratio: "5.8:1",
    level: "AA",
    context: "Labels inactivos rail sobre ceniza 600.",
  },
  {
    id: "pos-primary-text",
    foreground: "#F8FAFC",
    background: "#252B34",
    ratio: "11.2:1",
    level: "AAA",
    context: "Título producto en card ceniza 500.",
  },
  {
    id: "cta-savia-white",
    foreground: "#FFFFFF",
    background: "#059669",
    ratio: "4.6:1",
    level: "AA",
    context: "Botón Vender — savia 600.",
  },
  {
    id: "cta-savia-dark",
    foreground: "#022C22",
    background: "#34D399",
    ratio: "7.1:1",
    level: "AAA",
    context: "Icono + en botón agregar.",
  },
  {
    id: "workspace-body",
    foreground: "#121417",
    background: "#EEF1F5",
    ratio: "12.4:1",
    level: "AAA",
    context: "Cuerpo en formularios workspace.",
  },
  {
    id: "landing-hero",
    foreground: "#FFFFFF",
    background: "#080C0B",
    ratio: "15.8:1",
    level: "AAA",
    context: "Headline hero landing.",
  },
  {
    id: "landing-meadow",
    foreground: "#34D399",
    background: "#080C0B",
    ratio: "8.9:1",
    level: "AAA",
    context: "Links meadow en hero.",
  },
  {
    id: "library-nav",
    foreground: "#34D399",
    background: "#1A2027",
    ratio: "6.2:1",
    level: "AA",
    context: "Nav activo savia 400 sobre ceniza 700.",
  },
  {
    id: "fail-muted-light",
    foreground: "#94A3B8",
    background: "#EEF1F5",
    ratio: "2.8:1",
    level: "Fail",
    context: "Evitar — bruma 400 sobre bruma 100.",
  },
]

export const ROOTSY_SURFACE_STACKS: Record<ColorThemeId, SurfaceLayer[]> = {
  pos: [
    { level: 0, label: "Shell", token: "ceniza-950", hex: "#070A09", usage: "Viewport." },
    { level: 1, label: "Rail", token: "ceniza-700", hex: "#1A2027", usage: "Categorías." },
    { level: 2, label: "Canvas", token: "ceniza-600", hex: "#20262E", usage: "Grilla." },
    { level: 3, label: "Card", token: "ceniza-500", hex: "#252B34", usage: "Producto." },
    { level: 4, label: "Toolbox", token: "ceniza-900", hex: "#0B100E", usage: "Barra inferior." },
    { level: 5, label: "Totales", token: "savia-975→990", hex: "#07120E", usage: "Gradiente cobro." },
  ],
  workspace: [
    { level: 0, label: "Shell", token: "bruma-100", hex: "#EEF1F5", usage: "Fondo página." },
    { level: 1, label: "Surface", token: "white", hex: "#FFFFFF", usage: "Cards, inputs." },
    { level: 2, label: "Subtle", token: "bruma-50", hex: "#F4F6F9", usage: "Filas zebra." },
    { level: 3, label: "Header", token: "ceniza-700", hex: "#1A2027", usage: "Cabecera oscura." },
    { level: 4, label: "Overlay", token: "ceniza-950/40", hex: "#070A0966", usage: "Scrim modal." },
  ],
  landing: [
    { level: 0, label: "Atmosphere", token: "landing-950", hex: "#080C0B", usage: "Hero fijo." },
    { level: 1, label: "Content", token: "landing-800", hex: "#0A0E0D", usage: "Paneles." },
    { level: 2, label: "Glass", token: "white/6", hex: "#FFFFFF0F", usage: "Tiles." },
    { level: 3, label: "Glow", token: "meadow/32", hex: "#34D39952", usage: "Halos blur." },
  ],
  library: [
    { level: 0, label: "Rail", token: "ceniza-700", hex: "#1A2027", usage: "Sidebar nav." },
    { level: 1, label: "Content", token: "bruma-100", hex: "#EEF1F5", usage: "Área lectura." },
    { level: 2, label: "Card", token: "white", hex: "#FFFFFF", usage: "Docs, tablas." },
    { level: 3, label: "Header", token: "ceniza-gradient", hex: "#070A09", usage: "Top bar." },
  ],
}

export const ROOTSY_INTERACTION_STATES = [
  {
    id: "ws-rest",
    label: "Reposo",
    border: "#DFE4EA",
    background: "#FFFFFF",
    ring: "none",
    context: "workspace",
  },
  {
    id: "ws-hover",
    label: "Hover",
    border: "#CBD5E1",
    background: "#F4F6F9",
    ring: "none",
    context: "workspace",
  },
  {
    id: "ws-focus",
    label: "Foco",
    border: "#34D399",
    background: "#FFFFFF",
    ring: "0 0 0 3px #34D39940",
    context: "workspace",
  },
  {
    id: "pos-rest",
    label: "Reposo POS",
    border: "#334155",
    background: "#252B34",
    ring: "none",
    context: "pos",
  },
  {
    id: "pos-active",
    label: "Activo POS",
    border: "#34D399",
    background: "#20262E",
    ring: "0 0 0 2px #34D39966",
    context: "pos",
  },
  {
    id: "pos-cta",
    label: "CTA",
    border: "transparent",
    background: "#059669",
    ring: "none",
    context: "pos",
  },
] as const

/** Secuencia categórica — solo familias de producto. */
export const ROOTSY_CHART_SEQUENCE = [
  { id: "ch1", label: "Savia", hex: "#059669", usage: "Serie principal." },
  { id: "ch2", label: "Teal", hex: "#14B8A6", usage: "Serie 2 — landing." },
  { id: "ch3", label: "Ceniza", hex: "#64748B", usage: "Referencia neutra." },
  { id: "ch4", label: "Bruma", hex: "#475569", usage: "Serie secundaria." },
  { id: "ch5", label: "Meadow", hex: "#34D399", usage: "Highlight POS." },
] as const

/** Estados en gráficos — savia + funcionales. */
export const ROOTSY_CHART_STATUS = [
  { id: "ok", label: "OK / en curso", hex: "#10B981", boldHex: "#059669" },
  { id: "warn", label: "Atención", hex: "#D97706", boldHex: "#B45309" },
  { id: "crit", label: "Crítico", hex: "#DC2626", boldHex: "#B91C1C" },
  { id: "info", label: "Información", hex: "#14B8A6", boldHex: "#0D9488" },
  { id: "idle", label: "Pendiente", hex: "#94A3B8", boldHex: "#64748B" },
] as const
