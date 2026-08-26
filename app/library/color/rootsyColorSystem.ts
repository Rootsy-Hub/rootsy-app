/**
 * Sistema de color Rootsy — paleta del handbook.
 * Atmósferas: éter, bruma, sombra. Funcionales: savia, cielo, sol, lava.
 */

import {
  ROOTSY_CIELO,
  ROOTSY_COLOR_SEMANTIC,
  ROOTSY_ETER,
  ROOTSY_SOL,
  ROOTSY_SUELO,
  rootsyColorHex,
} from "@/lib/design-system"

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
  sombra600: hx("sombra", "600"),
  sombra700: hx("sombra", "700"),
  sombra500: hx("sombra", "500"),
  sombra300: hx("sombra", "300"),
  sombraBorder: hx("sombra", "border"),
  landing950: hx("sombra", "900"),
  white: W,
} as const

export type ColorThemeId = "pos" | "workspace" | "bruma-oscura" | "marketing" | "library"

/** @deprecated Usar "marketing". Alias de migración desde landing. */
export type LegacyColorThemeId = ColorThemeId | "landing"

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

export const ROOTSY_COLOR_CONCEPT = {
  title: "Un ecosistema de luz y sombra",
  lead:
    "Rootsy no pinta interfaces: traduce un parque digital. Hay zonas bajo el dosel, neblina que aclara el camino y savia que marca dónde actuar.",
  why: [
    "Cada color nombra una sensación del mundo de la mascota — no un hex suelto ni un gris de dashboard.",
    "Claro y oscuro comparten el mismo matiz bosque: la bruma del ticket y la sombra del catálogo son el mismo ecosistema.",
    "Savia es el único verde con intención — vida, acción, foco. Todo lo demás es neutro con alma natural.",
  ],
  closing:
    "Si el usuario ya recorrió el parque una vez, los colores le resultan familiares antes de leer una etiqueta.",
} as const

export const ROOTSY_COLOR_MANIFESTO =
  "Tres familias, un ecosistema. Sombra es el dosel — oscuro con alma de bosque; bruma es la neblina que aclara; savia es la vida que acciona. El hero de marketing no es una cuarta paleta: es la misma noche (sombra) con savia encendida y auroras de atmósfera."

export const ROOTSY_COLOR_PRINCIPLES = [
  {
    title: "Tres familias, roles fijos",
    detail:
      "Sombra, bruma y savia no se intercambian. Cada una responde a una superficie o acción del producto.",
  },
  {
    title: "Un verde operativo",
    detail:
      "Savia es el verde de acción en POS y workspace. En marketing el CTA puede ir a savia 500→teal — misma familia, más luminosa.",
  },
  {
    title: "Un eje verde-bosque",
    detail:
      "Sombra lleva carbón verdoso; bruma es neblina fría. Sin slate azulado de dashboard genérico.",
  },
  {
    title: "Contraste como requisito",
    detail:
      "Texto bruma 900 sobre bruma 100; inverso sobre sombra 500+. Savia 600 lleva blanco en CTAs.",
  },
  {
    title: "Estados fuera de la marca",
    detail:
      "Aviso, peligro e info usan ámbar, rojo y teal funcionales — no son familias del sistema, solo semántica UX.",
  },
  {
    title: "Atmósfera aislada",
    detail:
      "Aurora neón (#25FE02) vive solo en blur del hero. Nunca texto, borde ni botón sólido.",
  },
] as const

export const ROOTSY_THEMES: ColorTheme[] = [
  {
    id: "pos",
    label: "Mostrador POS",
    subtitle: "Vender",
    description:
      "Split sombra + bruma con savia en acciones. Rail, canvas y cards bajo el dosel; ticket en bruma; totales en gradiente savia profundo.",
    shell: hx("sombra", "950"),
    surface: hx("sombra", "600"),
    elevated: hx("sombra", "500"),
    border: hx("sombra", "400"),
    textPrimary: hx("sombra", "50"),
    textSecondary: hx("sombra", "300"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
  {
    id: "workspace",
    label: "Workspace",
    subtitle: "Backoffice",
    description:
      "Superficies bruma y blanco; texto bruma 900; acciones savia 600. Header y rail opcionales en sombra — misma familia que POS.",
    shell: hx("bruma", "100"),
    surface: hx("bruma", "50"),
    elevated: hx("bruma", "50"),
    border: hx("bruma", "200"),
    textPrimary: hx("bruma", "900"),
    textSecondary: hx("bruma", "700"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
  {
    id: "bruma-oscura",
    label: "Bruma oscura",
    subtitle: "Workspace night",
    description:
      "Variante dark de bruma — la misma neblina invertida. Lienzo 950, losetas 800, texto 50. No es sombra ni éter.",
    shell: hx("bruma", "950"),
    surface: hx("bruma", "800"),
    elevated: hx("bruma", "700"),
    border: hx("bruma", "700"),
    textPrimary: hx("bruma", "50"),
    textSecondary: hx("bruma", "400"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
  {
    id: "marketing",
    label: "Marketing · hero",
    subtitle: "Primera impresión",
    description:
      "Atmósfera éter: vacío 950, boca 800, texto 50. La savia de acción no cambia.",
    shell: hx("eter", "950"),
    surface: hx("eter", "800"),
    elevated: hx("eter", "700"),
    border: hx("eter", "700"),
    textPrimary: hx("eter", "50"),
    textSecondary: hx("eter", "300"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
  {
    id: "library",
    label: "Librería",
    subtitle: "Documentación",
    description:
      "Demostración del split: rail sombra 700, contenido bruma 100 — la propia página de color como spec.",
    shell: hx("bruma", "100"),
    surface: hx("bruma", "50"),
    elevated: hx("bruma", "50"),
    border: hx("bruma", "200"),
    textPrimary: hx("bruma", "900"),
    textSecondary: hx("bruma", "700"),
    action: hx("savia", "600"),
    actionText: W,
    accent: hx("savia", "400"),
  },
]

export const ROOTSY_SEMANTIC_TOKENS: SemanticToken[] = [
  {
    id: "background-shell",
    token: "--color-fondo",
    label: "Fondo",
    hex: hx("sombra", "950"),
    usage: "Viewport raíz — POS oscuro y marketing (.rootsy-theme-landing).",
    themes: ["pos", "marketing"],
  },
  {
    id: "background-surface",
    token: "--color-superficie",
    label: "Superficie",
    hex: hx("sombra", "600"),
    usage: "Canvas catálogo POS; cards en workspace.",
    themes: ["pos", "workspace", "marketing", "library"],
  },
  {
    id: "background-elevated",
    token: "--color-elevada",
    label: "Elevada",
    hex: hx("sombra", "500"),
    usage: "Cards sobre canvas; filas zebra en workspace.",
    themes: ["pos", "workspace", "marketing", "library"],
  },
  {
    id: "background-ticket",
    token: "--rootsy-bruma-100",
    label: "Ticket",
    hex: hx("bruma", "100"),
    textHex: hx("bruma", "900"),
    borderHex: hx("bruma", "200"),
    usage: "Composición POS — columna TU PEDIDO (no token de tema).",
    themes: ["pos", "library"],
  },
  {
    id: "background-workspace",
    token: "--color-elevada",
    label: "Workspace sutil",
    hex: hx("bruma", "50"),
    textHex: hx("bruma", "900"),
    borderHex: hx("bruma", "200"),
    usage: "Filas alternadas — mapea a --color-elevated en .rootsy-theme-workspace.",
    themes: ["workspace", "library"],
  },
  {
    id: "foreground-primary",
    token: "--color-texto",
    label: "Texto primario",
    hex: hx("bruma", "900"),
    usage: "Cuerpo en temas claros; blanco en marketing.",
    themes: ["workspace", "pos", "library", "marketing"],
  },
  {
    id: "foreground-inverse",
    token: "--color-texto",
    label: "Texto inverso",
    hex: ON_DARK,
    usage: "Títulos sobre sombra — valor fijo #f4f8f6 en tema POS.",
    themes: ["pos", "marketing", "library"],
  },
  {
    id: "foreground-muted",
    token: "--color-texto-muted",
    label: "Texto muted",
    hex: hx("bruma", "700"),
    usage: "Metadatos — bruma 700 en claro; sombra 300 / bruma 400 en oscuro.",
    themes: ["pos", "workspace", "marketing", "library"],
  },
  {
    id: "border-subtle",
    token: "--color-border",
    label: "Borde",
    hex: hx("bruma", "200"),
    usage: "Hairlines en ticket y tablas claras.",
    themes: ["workspace", "pos", "library"],
  },
  {
    id: "border-strong",
    token: "--rootsy-sombra-border",
    label: "Borde sombra",
    hex: hx("sombra", "border"),
    usage: "Separadores en UI oscura — rail, toolbox.",
    themes: ["pos", "marketing"],
  },
  {
    id: "action-primary",
    token: "--color-accion",
    label: "Acción",
    hex: hx("savia", "600"),
    textHex: hx("savia", "50"),
    usage: "Vender, guardar, confirmar — savia 600 en cualquier atmósfera.",
    themes: ["pos", "workspace", "library"],
  },
  {
    id: "action-promo",
    token: "--color-accion",
    label: "CTA marketing",
    hex: hx("savia", "600"),
    textHex: hx("savia", "50"),
    usage: "Misma acción que el resto del producto. Cambia el aire, no el verbo.",
    themes: ["marketing"],
  },
  {
    id: "accent-focus",
    token: "--color-foco",
    label: "Foco",
    hex: hx("savia", "400"),
    usage: "Selección rail, ring de foco — savia 400.",
    themes: ["pos", "marketing", "library"],
  },
  {
    id: "status-success",
    token: "--color-exito",
    label: "Éxito",
    hex: hx("savia", "500"),
    textHex: hx("savia", "800"),
    usage: "Pagado, activo — savia 500/800.",
    themes: ["pos", "workspace"],
  },
  {
    id: "status-warning",
    token: "--color-atencion",
    label: "Atención",
    hex: hx("sol", "500"),
    textHex: hx("sol", "900"),
    usage: "Preparando, pendiente con calor. Tint: sol 50 + texto 900.",
    themes: ["workspace"],
  },
  {
    id: "status-danger",
    token: "--color-peligro",
    label: "Peligro",
    hex: hx("lava", "600"),
    textHex: hx("lava", "50"),
    usage: "Eliminar, error — lava 600. Tint: lava 50 + texto 800.",
    themes: ["workspace"],
  },
  {
    id: "status-info",
    token: "--color-informacion",
    label: "Información",
    hex: hx("cielo", "500"),
    textHex: hx("cielo", "800"),
    usage: "En curso, enviado — cielo 500. Tint: cielo 50 + texto 800.",
    themes: ["workspace", "marketing"],
  },
  {
    id: "decorative-aurora",
    token: "--color-decorative-aurora",
    label: "Aurora",
    hex: hx("atmosphere", "neon"),
    usage: "Glow de marketing — savia 400, no una familia extra.",
    themes: ["marketing"],
  },
]

export const ROOTSY_COLOR_ROLES: ProductColorRole[] = [
  {
    roleLabel: "Sombra · catálogo",
    description: "Rail, canvas, cards, toolbox — columna oscura POS.",
    bg: hx("sombra", "600"),
    text: ON_DARK,
    border: hx("sombra", "border"),
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
    bg: hx("sombra", "600"),
    text: hx("savia", "400"),
    border: hx("savia", "400"),
    exampleLabel: "Bebidas",
  },
  {
    roleLabel: "Sombra · noche",
    description: "Fondo del hero — sombra 900, misma noche que el parque digital.",
    bg: hx("sombra", "900"),
    text: W,
    exampleLabel: "Rootsy",
  },
  {
    roleLabel: "Savia · CTA promo",
    description: "Emerald a teal — botón primario del hero (savia 500→teal).",
    bg: hx("savia", "500"),
    text: W,
    exampleLabel: "Empezar",
  },
]

export const ROOTSY_PRODUCT_EMPHASIS: ProductEmphasisFamily[] = [
  {
    id: "sombra",
    label: "Sombra",
    levels: [
      { id: "z950", label: "950 · shell", hex: hx("sombra", "950") },
      { id: "z700", label: "700 · rail", hex: hx("sombra", "700") },
      { id: "z600", label: "600 · canvas", hex: hx("sombra", "600") },
      { id: "z500", label: "500 · card", hex: hx("sombra", "500") },
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
]

export const ROOTSY_COMPLEMENTARY_PAIRINGS: ComplementaryPairing[] = [
  {
    id: "pos-core",
    title: "Sombra + Savia",
    description: "Par rector del mostrador — dosel verde sostiene, savia acciona.",
    primary: { label: "Sombra 600", hex: hx("sombra", "600") },
    secondary: { label: "Savia 600", hex: hx("savia", "600") },
    harmony: "neutral-action",
    usage: "Catálogo + Vender + cards seleccionadas.",
  },
  {
    id: "pos-split",
    title: "Sombra + Bruma",
    description: "Split de columnas — dosel y neblina, máxima legibilidad natural.",
    primary: { label: "Sombra 700", hex: hx("sombra", "700") },
    secondary: { label: "Bruma 100", hex: hx("bruma", "100") },
    harmony: "complementary",
    usage: "Layout Vender completo.",
  },
  {
    id: "pos-focus",
    title: "Sombra + Savia 400",
    description: "Foco sin competir con CTA — anillo y rail activo.",
    primary: { label: "Sombra 500", hex: hx("sombra", "500") },
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
    id: "workspace-bruma-oscura",
    title: "Bruma oscura + Savia",
    description: "La misma lectura de noche — bruma 50 sobre 950, confirmación savia 600.",
    primary: { label: "Bruma 950", hex: hx("bruma", "950") },
    secondary: { label: "Savia 600", hex: hx("savia", "600") },
    accent: { label: "Bruma 50", hex: hx("bruma", "50") },
    harmony: "neutral-action",
    usage: "Workspaces y cuentas en variante dark. .rootsy-theme-bruma-oscura.",
  },
  {
    id: "workspace-header",
    title: "Sombra header + Bruma body",
    description: "Continuidad POS→workspace — header bajo el dosel, contenido en bruma.",
    primary: { label: "Sombra 700", hex: hx("sombra", "700") },
    secondary: { label: "Bruma 100", hex: hx("bruma", "100") },
    harmony: "complementary",
    usage: "DataWorkspace, librería, listados.",
  },
  {
    id: "marketing-cta",
    title: "Savia + Teal",
    description: "CTA promocional — confianza emerald, cierre teal (misma familia savia).",
    primary: { label: "Savia 500", hex: hx("savia", "500") },
    secondary: { label: "Savia teal", hex: hx("savia", "teal") },
    harmony: "analogous",
    usage: "Botón hero marketing.",
  },
  {
    id: "marketing-glow",
    title: "Sombra + Savia + Aurora",
    description: "Hero nocturno — noche del parque, savia luminosa, aurora en blur.",
    primary: { label: "Sombra 900", hex: hx("sombra", "900") },
    secondary: { label: "Savia 400", hex: hx("savia", "400") },
    accent: { label: "Aurora", hex: hx("atmosphere", "neon") },
    harmony: "split",
    usage: "Títulos, links, glow — aurora solo en atmósfera.",
  },
  {
    id: "status-functional",
    title: "Éxito · Atención · Peligro",
    description: "Semántica UX — savia, sol y lava.",
    primary: { label: "Savia 500", hex: hx("savia", "500") },
    secondary: { label: "Sol 500", hex: hx("sol", "500") },
    accent: { label: "Lava 600", hex: hx("lava", "600") },
    harmony: "split",
    usage: "Pills y banners — no reutilizar en decoración.",
  },
  {
    id: "clima-cielo-savia",
    title: "Cielo + Savia",
    description: "Bosque y cielo abierto — savia acciona, cielo informa sin caer en teal.",
    primary: { label: "Savia 600", hex: hx("savia", "600") },
    secondary: { label: "Cielo 500", hex: ROOTSY_CIELO["500"] },
    harmony: "complementary",
    usage: "Comandas lista vs enviada. Teal se queda en marketing.",
  },
  {
    id: "clima-sol-sombra",
    title: "Sol + Sombra",
    description: "Sol a través del dosel — calor vivo, no ámbar de aviso.",
    primary: { label: "Sombra 700", hex: hx("sombra", "700") },
    secondary: { label: "Sol 500", hex: ROOTSY_SOL["500"] },
    harmony: "complementary",
    usage: "Preparando, calor de cocina. Warning ámbar se queda para alerta UX.",
  },
  {
    id: "clima-comandas",
    title: "Cielo + Sol + Savia",
    description: "Mundos de comanda — enviada, preparando, lista.",
    primary: { label: "Cielo 500", hex: ROOTSY_CIELO["500"] },
    secondary: { label: "Sol 500", hex: ROOTSY_SOL["500"] },
    accent: { label: "Savia 500", hex: hx("savia", "500") },
    harmony: "split",
    usage: "Headers de mundo en Comandas.",
  },
  {
    id: "clima-eter-suelo",
    title: "Éter + Suelo",
    description: "Umbral del módulo — espacio arriba, tierra mojada abajo.",
    primary: { label: "Éter 900", hex: ROOTSY_ETER["900"] },
    secondary: { label: "Suelo 900", hex: ROOTSY_SUELO["900"] },
    harmony: "complementary",
    usage: "MenuHeaderEntity header / footer. Listados y menú.",
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
    id: "bruma-oscura-body",
    foreground: hx("bruma", "50"),
    background: hx("bruma", "950"),
    ratio: "16.1:1",
    level: "AAA",
    context: "Texto principal en bruma oscura — lienzo 950.",
  },
  {
    id: "bruma-oscura-card",
    foreground: hx("bruma", "50"),
    background: hx("bruma", "800"),
    ratio: "13.4:1",
    level: "AAA",
    context: "Título de loseta sobre bruma 800.",
  },
  {
    id: "bruma-oscura-muted",
    foreground: hx("bruma", "400"),
    background: hx("bruma", "950"),
    ratio: "8.2:1",
    level: "AAA",
    context: "Metadato sobre lienzo bruma oscura.",
  },
  {
    id: "pos-muted",
    foreground: hx("sombra", "300"),
    background: hx("sombra", "600"),
    ratio: "5.8:1",
    level: "AA",
    context: "Labels inactivos rail sobre sombra 600.",
  },
  {
    id: "pos-primary-text",
    foreground: ON_DARK,
    background: hx("sombra", "500"),
    ratio: "11.2:1",
    level: "AAA",
    context: "Título producto en card sombra 500.",
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
    id: "marketing-hero",
    foreground: W,
    background: hx("sombra", "900"),
    ratio: "15.8:1",
    level: "AAA",
    context: "Headline hero marketing.",
  },
  {
    id: "marketing-savia-link",
    foreground: hx("savia", "400"),
    background: hx("sombra", "900"),
    ratio: "8.9:1",
    level: "AAA",
    context: "Links savia 400 en hero marketing.",
  },
  {
    id: "library-nav",
    foreground: "#F8FAFC",
    background: hx("sombra", "700"),
    ratio: "11.5:1",
    level: "AAA",
    context: "Nav activo en librería — blanco sobre sombra 700.",
  },
  {
    id: "library-nav-focus",
    foreground: hx("savia", "400"),
    background: hx("sombra", "700"),
    ratio: "6.2:1",
    level: "AA",
    context: "Acento savia 400 — ring y estados de foco en nav.",
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
    { level: 0, label: "Shell", token: "sombra-950", hex: hx("sombra", "950"), usage: "Viewport." },
    { level: 1, label: "Rail", token: "sombra-700", hex: hx("sombra", "700"), usage: "Categorías." },
    { level: 2, label: "Canvas", token: "sombra-600", hex: hx("sombra", "600"), usage: "Grilla." },
    { level: 3, label: "Card", token: "sombra-500", hex: hx("sombra", "500"), usage: "Producto." },
    { level: 4, label: "Toolbox", token: "sombra-900", hex: hx("sombra", "900"), usage: "Barra inferior." },
    { level: 5, label: "Totales", token: "savia-975→990", hex: hx("savia", "975"), usage: "Gradiente cobro." },
  ],
  workspace: [
    { level: 0, label: "Shell", token: "bruma-100", hex: hx("bruma", "100"), usage: "Fondo página." },
    { level: 1, label: "Surface", token: "white", hex: W, usage: "Cards, inputs." },
    { level: 2, label: "Subtle", token: "bruma-50", hex: hx("bruma", "50"), usage: "Filas zebra." },
    { level: 3, label: "Header", token: "sombra-700", hex: hx("sombra", "700"), usage: "Cabecera oscura." },
    { level: 4, label: "Overlay", token: "sombra-950/40", hex: "#05080766", usage: "Scrim modal." },
  ],
  "bruma-oscura": [
    { level: 0, label: "Shell", token: "bruma-950", hex: hx("bruma", "950"), usage: "Lienzo night." },
    { level: 1, label: "Surface", token: "bruma-800", hex: hx("bruma", "800"), usage: "Losetas, cards." },
    { level: 2, label: "Subtle", token: "bruma-700", hex: hx("bruma", "700"), usage: "Isotipo, zebra." },
    { level: 3, label: "Border", token: "bruma-600/52", hex: "#2C3544", usage: "Hairline de loseta." },
    { level: 4, label: "Text", token: "bruma-50", hex: hx("bruma", "50"), usage: "Lectura sobre neblina." },
  ],
  marketing: [
    { level: 0, label: "Atmosphere", token: "sombra-900", hex: hx("sombra", "900"), usage: "Hero fijo." },
    { level: 1, label: "Content", token: "sombra-800", hex: hx("sombra", "800"), usage: "Paneles." },
    { level: 2, label: "Glass", token: "white/6", hex: "#FFFFFF0F", usage: "Tiles." },
    { level: 3, label: "Glow", token: "savia-400/32", hex: "#34D39952", usage: "Halos blur savia." },
  ],
  library: [
    { level: 0, label: "Rail", token: "sombra-700", hex: hx("sombra", "700"), usage: "Sidebar nav." },
    { level: 1, label: "Content", token: "bruma-100", hex: hx("bruma", "100"), usage: "Área lectura." },
    { level: 2, label: "Card", token: "white", hex: W, usage: "Docs, tablas." },
    { level: 3, label: "Header", token: "sombra-gradient", hex: hx("sombra", "950"), usage: "Top bar." },
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
    border: hx("sombra", "border"),
    background: hx("sombra", "500"),
    ring: "none",
    context: "pos",
  },
  {
    id: "pos-active",
    label: "Activo POS",
    border: hx("savia", "400"),
    background: hx("sombra", "600"),
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
  { id: "ch2", label: "Teal", hex: hx("savia", "teal"), usage: "Serie 2 — extensión savia." },
  { id: "ch3", label: "Sombra", hex: hx("sombra", "400"), usage: "Referencia neutra." },
  { id: "ch4", label: "Bruma", hex: hx("bruma", "600"), usage: "Serie secundaria." },
  { id: "ch5", label: "Savia 400", hex: hx("savia", "400"), usage: "Highlight POS." },
] as const

/** Estados en gráficos — savia + funcionales. */
export const ROOTSY_CHART_STATUS = [
  { id: "ok", label: "OK / en curso", hex: hx("savia", "500"), boldHex: hx("savia", "600") },
  { id: "warn", label: "Atención", hex: hx("sol", "500"), boldHex: hx("sol", "700") },
  { id: "crit", label: "Crítico", hex: hx("lava", "600"), boldHex: hx("lava", "700") },
  { id: "info", label: "Información", hex: hx("cielo", "500"), boldHex: hx("cielo", "600") },
  { id: "idle", label: "Pendiente", hex: hx("sombra", "300"), boldHex: hx("sombra", "400") },
] as const
