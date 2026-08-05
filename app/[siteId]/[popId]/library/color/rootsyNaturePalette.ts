/**
 * Paleta Nature Rootsy — definición completa para la librería de color.
 * Rootsy grita naturaleza: verde en esplendor como eje, con cielo, mar,
 * otoño, fuego, tierra y noche como familias complementarias.
 */

export type NatureRampStep = {
  id: string
  label: string
  hex: string
  usage?: string
}

export type NatureFamily = {
  id: string
  title: string
  subtitle: string
  description: string
  steps: NatureRampStep[]
}

export type NatureGradient = {
  id: string
  title: string
  description: string
  from: string
  via?: string
  to: string
  angle?: number
}

export type NatureSwatch = {
  id: string
  label: string
  hex: string
  usage: string
  textHex?: string
}

export type NatureAccent = {
  id: string
  label: string
  hex: string
  tagBg: string
  tagText: string
  subtlest: string
  subtler: string
  subtle: string
  bold: string
  textDefault: string
  textBold: string
}

export const ROOTSY_NATURE_MANIFESTO =
  "Rootsy grita naturaleza. El verde de las plantas en su mejor esplendor es el protagonista — no un accent más. Alrededor orbitan el dorado del otoño, el azul del cielo y del mar, el violeta del crepúsculo, el rojo-naranja del fuego y la lava, la tierra bajo los pies y la noche profunda del bosque."

export const ROOTSY_NATURE_PRINCIPLES = [
  {
    title: "Verde primero",
    detail: "Toda decisión de color parte del canopy — hoja viva, savia, luz filtrada.",
  },
  {
    title: "Vivos, no apagados",
    detail: "Saturación con intención: como un bosque después de la lluvia, no un dashboard gris.",
  },
  {
    title: "Estaciones y elementos",
    detail: "Otoño, cielo, mar, fuego, tierra y noche — cada familia tiene su clima.",
  },
  {
    title: "Gradientes naturales",
    detail: "Amanecer, horizonte, atardecer — transiciones que existen afuera, no en una paleta genérica.",
  },
] as const

/** Neutros oscuros azul-ceniza — columna catálogo y mostrador POS (pantalla Vender). */
export const CENIZA_FAMILY: NatureFamily = {
  id: "ceniza",
  title: "Ceniza · grises azulados oscuros",
  subtitle: "Mostrador y catálogo",
  description:
    "Azul-ceniza profundo — no negro plano ni tierra cálida. Shell, rail, canvas, cards y toolbox de operaciones. Combina con canopy y noche viva.",
  steps: [
    { id: "z950", label: "950", hex: "#070A09", usage: "★ Shell POS — fondo general." },
    { id: "z900", label: "900", hex: "#0B100E", usage: "Toolbox inferior — cliente, pago." },
    { id: "z800", label: "800", hex: "#0F1416", usage: "Media de card — void detrás de foto." },
    { id: "z700", label: "700", hex: "#1A2027", usage: "★ Rail categorías — sidebar 280px." },
    { id: "z600", label: "600", hex: "#20262E", usage: "Canvas catálogo — grilla de productos." },
    { id: "z500", label: "500", hex: "#252B34", usage: "★ Superficie card — cuerpo del producto." },
    { id: "z400", label: "400", hex: "#64748B", usage: "Labels de sección — slate muted." },
    { id: "z300", label: "300", hex: "#94A3B8", usage: "Texto inactivo — ítems del rail." },
  ],
}

/** Neutros claros azul-ceniza — ticket, listados y paneles light del POS. */
export const BRUMA_FAMILY: NatureFamily = {
  id: "bruma",
  title: "Bruma · claros ceniza azulados",
  subtitle: "Ticket y listados",
  description:
    "Off-white frío para columnas de resumen, tickets y tablas workspace. Contraste limpio con ceniza oscura y acentos savia.",
  steps: [
    { id: "b50", label: "50", hex: "#F4F6F9", usage: "★ Superficie listado — ítems del ticket." },
    { id: "b100", label: "100", hex: "#EEF1F5", usage: "★ Panel resumen — aside TU PEDIDO." },
    { id: "b200", label: "200", hex: "#DFE4EA", usage: "Divisores hairline — filas del ticket." },
    { id: "b300", label: "300", hex: "#CBD5E1", usage: "Bordes suaves — inputs y tabs." },
    { id: "b400", label: "400", hex: "#94A3B8", usage: "Metadatos — contador de líneas." },
    { id: "b500", label: "500", hex: "#64748B", usage: "Encabezados secundarios — TU PEDIDO." },
    { id: "b600", label: "600", hex: "#475569", usage: "Descripciones — hints en panel claro." },
    { id: "b700", label: "700", hex: "#334155", usage: "Texto empty state — títulos muted." },
    { id: "b900", label: "900", hex: "#121417", usage: "★ Texto principal — cuerpo en panel claro." },
  ],
}

/** Verde operativo POS — savia emerald de la pantalla Vender (distinto del canopy de marca). */
export const SAVIA_FAMILY: NatureFamily = {
  id: "savia",
  title: "Savia · verde operativo POS",
  subtitle: "Acciones, foco y éxito en mostrador",
  description:
    "Emerald vivo sobre ceniza — CTA Vender, botón agregar, rail activo, toolbox configurado y barra de totales. Más eléctrico que Canopy; pensado para contraste en UI oscura.",
  steps: [
    { id: "s990", label: "990", hex: "#061009", usage: "Totales POS — cierre del gradiente." },
    { id: "s975", label: "975", hex: "#07120E", usage: "★ Totales POS — inicio del gradiente." },
    { id: "s960", label: "960", hex: "#0C1F17", usage: "Totales POS — centro del gradiente." },
    { id: "s950", label: "950", hex: "#022C22", usage: "Texto sobre botón + — emerald-950." },
    { id: "s900", label: "900", hex: "#064E3B", usage: "Overlays oscuros — badges sobre cards." },
    { id: "s800", label: "800", hex: "#065F46", usage: "Badges pagado — texto en ticket claro." },
    { id: "s700", label: "700", hex: "#047857", usage: "Estado active/pressed." },
    { id: "s600", label: "600", hex: "#059669", usage: "★ CTA Vender / Confirmar venta." },
    { id: "s500", label: "500", hex: "#10B981", usage: "★ Agregar producto · toolbox configurado." },
    { id: "s400", label: "400", hex: "#34D399", usage: "★ Acento rail · focus · barra selección." },
    { id: "s300", label: "300", hex: "#6EE7B7", usage: "Glow cards · descuentos en totales." },
    { id: "s200", label: "200", hex: "#A7F3D0", usage: "Iconos toolbox · labels barra totales." },
    { id: "s100", label: "100", hex: "#D1FAE5", usage: "Promociones rail · badges suaves ticket." },
    { id: "s50", label: "50", hex: "#ECFDF5", usage: "Filas pagadas / highlight ticket claro." },
  ],
}

/** Hero promocional — fondo carbón, emerald/meadow y auroras de la landing. */
export const LANDING_FAMILY: NatureFamily = {
  id: "landing",
  title: "Landing · hero promocional",
  subtitle: "Marketing y primera impresión",
  description:
    "Fondo carbón verdoso, forest/meadow como acentos, auroras neón decorativas y CTA emerald→teal. Extraído de HeroLanding, LandingAtmosphere y CTAs.",
  steps: [
    { id: "l950", label: "950", hex: "#080C0B", usage: "★ Fondo hero — LANDING_BG." },
    { id: "l900", label: "900", hex: "#070A09", usage: "Shell login / chrome oscuro." },
    { id: "l800", label: "800", hex: "#0A0E0D", usage: "Overlay gradiente hero." },
    { id: "l500", label: "500", hex: "#10B981", usage: "★ Forest / emerald-500 — acento principal." },
    { id: "l400", label: "400", hex: "#34D399", usage: "★ Meadow / emerald-400 — glow y focus." },
    { id: "l300", label: "300", hex: "#6EE7B7", usage: "Halo aurora suave — emerald-300." },
    { id: "l200", label: "200", hex: "#A7F3D0", usage: "Partículas y halos secundarios." },
    { id: "t500", label: "Teal", hex: "#14B8A6", usage: "★ CTA gradient end — teal-500." },
    { id: "n400", label: "Neón", hex: "#25FE02", usage: "Aurora decorativa (no UI sólida)." },
    { id: "n300", label: "Neón 2", hex: "#02FE85", usage: "Aurora secundaria — base del glow." },
    { id: "c600", label: "Canopy", hex: "#1E8F5A", usage: "Primary light mode — puente con marca." },
  ],
}

/** Paletas del grupo Color (nuevo) — POS + landing. */
export const COLOR_NEW_FAMILIES: NatureFamily[] = [
  CENIZA_FAMILY,
  BRUMA_FAMILY,
  SAVIA_FAMILY,
  LANDING_FAMILY,
]

export const COLOR_NEW_GRADIENTS: NatureGradient[] = [
  {
    id: "landing-aurora",
    title: "Aurora del hero",
    description: "Neón verde desde la base — LandingAtmosphere.",
    from: "#25FE02",
    via: "#02FE85",
    to: "#34D399",
  },
  {
    id: "landing-cta",
    title: "CTA primario",
    description: "Emerald a teal — botón principal de la landing.",
    from: "#10B981",
    to: "#14B8A6",
  },
  {
    id: "pos-totals",
    title: "Totales del mostrador",
    description: "Savia profunda bajo la barra de cobro — glow emerald en ceniza.",
    from: "#07120E",
    via: "#0C1F17",
    to: "#061009",
  },
  {
    id: "pos-floor",
    title: "Mostrador operativo",
    description: "Ceniza del catálogo abriendo a bruma del ticket — contraste POS.",
    from: "#070A09",
    via: "#20262E",
    to: "#EEF1F5",
  },
]

export const CANOPY_FAMILY: NatureFamily = {
  id: "canopy",
  title: "Canopy · verde en esplendor",
  subtitle: "El corazón de Rootsy",
  description:
    "Del musgo húmedo al brote iluminado — la gama que define la marca. Usala para acciones primarias, éxito, foco y cualquier momento donde la naturaleza está viva.",
  steps: [
    { id: "c950", label: "950", hex: "#052E1F", usage: "Sombra de copa — texto sobre verde claro." },
    { id: "c900", label: "900", hex: "#0A4030", usage: "Bosque denso — headers oscuros." },
    { id: "c800", label: "800", hex: "#0F5739", usage: "Follaje profundo." },
    { id: "c700", label: "700", hex: "#16704A", usage: "Hoja madura — botones pressed." },
    { id: "c600", label: "600", hex: "#1E8F5A", usage: "★ Marca principal — CTA, links activos." },
    { id: "c500", label: "500", hex: "#24AD6A", usage: "Planta en pleno sol — hover brand." },
    { id: "c400", label: "400", hex: "#3FC87E", usage: "Brotes y pradera — highlights." },
    { id: "c300", label: "300", hex: "#6DD99E", usage: "Luz entre hojas." },
    { id: "c200", label: "200", hex: "#A8EBC4", usage: "Rocío matinal — fondos suaves." },
    { id: "c100", label: "100", hex: "#DDF5E8", usage: "Neblina sobre pasto." },
    { id: "c50", label: "50", hex: "#F0FBF4", usage: "Aire limpio — superficie tintada." },
  ],
}

export const AUTUMN_FAMILY: NatureFamily = {
  id: "autumn",
  title: "Otoño · hojas doradas",
  subtitle: "Calor estacional",
  description:
    "Ámbar y oro de hojas que cambian — avisos cálidos, badges de atención y acentos que evocan cosecha sin confundirse con error.",
  steps: [
    { id: "a800", label: "800", hex: "#92400E" },
    { id: "a700", label: "700", hex: "#B45309" },
    { id: "a600", label: "600", hex: "#D97706", usage: "Aviso principal." },
    { id: "a500", label: "500", hex: "#F59E0B", usage: "Sol de otoño." },
    { id: "a400", label: "400", hex: "#FBBF24" },
    { id: "a300", label: "300", hex: "#FCD34D" },
    { id: "a200", label: "200", hex: "#FDE68A" },
    { id: "a100", label: "100", hex: "#FEF3C7" },
  ],
}

export const FIRE_FAMILY: NatureFamily = {
  id: "fire",
  title: "Fuego · lava y brasa",
  subtitle: "Energía ardiente",
  description:
    "Naranja volcánico y rojo brasa — peligro, eliminar y momentos de urgencia. Nunca para decoración.",
  steps: [
    { id: "f800", label: "800", hex: "#9A3412" },
    { id: "f700", label: "700", hex: "#C2410C", usage: "Lava oscura." },
    { id: "f600", label: "600", hex: "#EA580C" },
    { id: "f500", label: "500", hex: "#F97316", usage: "Llama viva." },
    { id: "f400", label: "400", hex: "#FB923C" },
    { id: "e700", label: "Brasa 700", hex: "#B91C1C" },
    { id: "e600", label: "Brasa 600", hex: "#DC2626", usage: "★ Peligro / eliminar." },
    { id: "e500", label: "Brasa 500", hex: "#EF4444" },
  ],
}

export const SKY_FAMILY: NatureFamily = {
  id: "sky",
  title: "Cielo · azul abierto",
  subtitle: "Claridad y aire",
  description:
    "El azul del cielo despejado — información, amplitud y respiro visual. Contraste natural con el verde canopy.",
  steps: [
    { id: "s700", label: "700", hex: "#0369A1" },
    { id: "s600", label: "600", hex: "#0284C7" },
    { id: "s500", label: "500", hex: "#0EA5E9", usage: "Cielo mediodía." },
    { id: "s400", label: "400", hex: "#38BDF8" },
    { id: "s300", label: "300", hex: "#7DD3FC" },
    { id: "s200", label: "200", hex: "#BAE6FD" },
    { id: "s100", label: "100", hex: "#E0F2FE" },
  ],
}

export const SEA_FAMILY: NatureFamily = {
  id: "sea",
  title: "Mar · profundidad acuática",
  subtitle: "Teal oceánico",
  description:
    "Donde el cielo se encuentra con el agua — series secundarias en gráficos, categorías frescas y acentos acuáticos.",
  steps: [
    { id: "m900", label: "900", hex: "#164E63" },
    { id: "m800", label: "800", hex: "#155E75" },
    { id: "m700", label: "700", hex: "#0E7490" },
    { id: "m600", label: "600", hex: "#0891B2" },
    { id: "m500", label: "500", hex: "#06B6D4", usage: "Agua clara." },
    { id: "m400", label: "400", hex: "#22D3EE" },
    { id: "m300", label: "300", hex: "#67E8F9" },
  ],
}

export const DUSK_FAMILY: NatureFamily = {
  id: "dusk",
  title: "Crepúsculo · violeta del atardecer",
  subtitle: "Magia del ocaso",
  description:
    "Cuando el sol baja y el cielo se tiñe de púrpura — novedad, descubrimiento y categorías especiales.",
  steps: [
    { id: "d700", label: "700", hex: "#6D28D9" },
    { id: "d600", label: "600", hex: "#7C3AED" },
    { id: "d500", label: "500", hex: "#8B5CF6", usage: "Hora dorada-violeta." },
    { id: "d400", label: "400", hex: "#A78BFA" },
    { id: "d300", label: "300", hex: "#C4B5FD" },
    { id: "d200", label: "200", hex: "#DDD6FE" },
  ],
}

export const EARTH_FAMILY: NatureFamily = {
  id: "earth",
  title: "Tierra · suelo y corteza",
  subtitle: "Anclaje orgánico",
  description:
    "Arena, arcilla, corteza y piedra — neutros cálidos que nunca compiten con el verde. Bordes, texto secundario y superficies.",
  steps: [
    { id: "e900", label: "900", hex: "#292524" },
    { id: "e800", label: "800", hex: "#44403C", usage: "Suelo húmedo." },
    { id: "e700", label: "700", hex: "#57534E" },
    { id: "e600", label: "600", hex: "#78716C", usage: "Corteza — hints." },
    { id: "e500", label: "500", hex: "#A8A29E" },
    { id: "e400", label: "400", hex: "#D6D3D1", usage: "Bordes." },
    { id: "e200", label: "200", hex: "#E7E5E4" },
    { id: "e100", label: "100", hex: "#F5F5F0", usage: "Arena clara." },
    { id: "e50", label: "50", hex: "#FAFAF7", usage: "★ Fondo workspace." },
  ],
}

export const NIGHT_FAMILY: NatureFamily = {
  id: "night",
  title: "Noche · carbón y bosque oscuro",
  subtitle: "Oscuridad viva",
  description:
    "No negro muerto — noche con vida: carbón vegetal, musgo seco bajo luna. Mostrador POS y texto principal en claro.",
  steps: [
    { id: "n950", label: "950", hex: "#060908", usage: "Noche total." },
    { id: "n900", label: "900", hex: "#0C1210", usage: "★ Carbón bosque — POS." },
    { id: "n800", label: "800", hex: "#141C19", usage: "Panel oscuro." },
    { id: "n700", label: "700", hex: "#1C2824" },
    { id: "n600", label: "600", hex: "#263530" },
    { id: "n500", label: "500", hex: "#33443D" },
  ],
}

export const ALL_NATURE_FAMILIES: NatureFamily[] = [
  CANOPY_FAMILY,
  AUTUMN_FAMILY,
  FIRE_FAMILY,
  SKY_FAMILY,
  SEA_FAMILY,
  DUSK_FAMILY,
  EARTH_FAMILY,
  NIGHT_FAMILY,
]

export const NATURE_GRADIENTS: NatureGradient[] = [
  {
    id: "pos-totals",
    title: "Totales del mostrador",
    description: "Savia profunda bajo la barra de cobro — glow emerald en ceniza.",
    from: "#07120E",
    via: "#0C1F17",
    to: "#061009",
  },
  {
    id: "pos-floor",
    title: "Mostrador operativo",
    description: "Ceniza del catálogo abriendo a bruma del ticket — contraste POS.",
    from: "#070A09",
    via: "#20262E",
    to: "#EEF1F5",
  },
  {
    id: "dawn",
    title: "Amanecer en el prado",
    description: "Neblina verde que se abre al dorado del sol naciente.",
    from: "#F0FBF4",
    via: "#DDF5E8",
    to: "#FDE68A",
  },
  {
    id: "canopy",
    title: "Copa del bosque",
    description: "Del sotobosque sombrío al brote iluminado.",
    from: "#052E1F",
    via: "#16704A",
    to: "#3FC87E",
  },
  {
    id: "horizon",
    title: "Horizonte",
    description: "Cielo encontrándose con el mar en la línea lejana.",
    from: "#0EA5E9",
    via: "#06B6D4",
    to: "#0891B2",
  },
  {
    id: "sunset",
    title: "Atardecer",
    description: "Fuego en el horizonte disolviéndose en violeta crepuscular.",
    from: "#F97316",
    via: "#EF4444",
    to: "#8B5CF6",
  },
  {
    id: "autumn-path",
    title: "Sendero otoñal",
    description: "Hojas doradas sobre tierra húmeda.",
    from: "#F59E0B",
    via: "#78716C",
    to: "#44403C",
  },
  {
    id: "night-forest",
    title: "Bosque nocturno",
    description: "Carbón y musgo bajo una fina luz de canopy.",
    from: "#060908",
    via: "#0F5739",
    to: "#1E8F5A",
  },
]

export const NATURE_COLOR_ROLES = [
  {
    roleLabel: "Savia · acción POS",
    description: "Vender, agregar, foco y éxito — emerald sobre ceniza oscura.",
    bg: "#059669",
    text: "#FFFFFF",
    exampleLabel: "Vender",
  },
  {
    roleLabel: "Ceniza · mostrador",
    description: "Columna oscura — rail, canvas, cards y toolbox del POS.",
    bg: "#20262E",
    text: "#F8FAFC",
    border: "#334155",
    exampleLabel: "Catálogo",
  },
  {
    roleLabel: "Bruma · ticket",
    description: "Columna clara — resumen, listados y ticket de operación.",
    bg: "#EEF1F5",
    text: "#121417",
    border: "#DFE4EA",
    exampleLabel: "Tu pedido",
  },
  {
    roleLabel: "Canopy · marca",
    description: "Rootsy en su estado más vivo — acciones, éxito, identidad.",
    bg: "#1E8F5A",
    text: "#FFFFFF",
    exampleLabel: "Guardar",
  },
  {
    roleLabel: "Tierra · neutro",
    description: "Superficies, bordes y texto secundario anclados al suelo.",
    bg: "#FAFAF7",
    text: "#44403C",
    border: "#D6D3D1",
    exampleLabel: "Panel",
  },
  {
    roleLabel: "Cielo · información",
    description: "Amplitud, progreso y contexto sin urgencia.",
    bg: "#E0F2FE",
    text: "#0369A1",
    exampleLabel: "En curso",
  },
  {
    roleLabel: "Otoño · aviso",
    description: "Precaución cálida — como una hoja que aún no cayó.",
    bg: "#FEF3C7",
    text: "#B45309",
    exampleLabel: "Revisar stock",
  },
  {
    roleLabel: "Fuego · peligro",
    description: "Eliminar, error grave — lava, no decoración.",
    bg: "#DC2626",
    text: "#FFFFFF",
    exampleLabel: "Eliminar",
  },
  {
    roleLabel: "Mar · acento",
    description: "Categorías intercambiables — agua, frescura, serie 2.",
    bg: "#06B6D4",
    text: "#FFFFFF",
    exampleLabel: "Bebidas",
  },
  {
    roleLabel: "Crepúsculo · novedad",
    description: "Algo nuevo — onboarding, features recientes.",
    bg: "#DDD6FE",
    text: "#6D28D9",
    exampleLabel: "Nuevo",
  },
  {
    roleLabel: "Noche · profundo",
    description: "Mostrador oscuro, texto principal en workspace claro.",
    bg: "#0C1210",
    text: "#A8EBC4",
    exampleLabel: "POS",
  },
]

/** Pills de estado — soft (bruma) y solid (canopy) para badges en tablas y modales. */
export const NATURE_PILL_VARIANTS = [
  {
    id: "canopy",
    label: "Canopy · activo",
    emphasis: "soft" as const,
    description: "Estado positivo — artículo activo, OK, disponible.",
    example: "Activo",
  },
  {
    id: "earth",
    label: "Tierra · neutro",
    emphasis: "soft" as const,
    description: "Metadato o tipo — sin urgencia semántica.",
    example: "Mercadería vendible",
  },
  {
    id: "earthMuted",
    label: "Tierra · apagado",
    emphasis: "soft" as const,
    description: "Inactivo o secundario — mismo fondo, texto más suave.",
    example: "Inactivo",
  },
  {
    id: "autumn",
    label: "Otoño · aviso",
    emphasis: "soft" as const,
    description: "Pendiente o revisión — calor estacional.",
    example: "Pendiente",
  },
  {
    id: "ember",
    label: "Fuego · crítico",
    emphasis: "soft" as const,
    description: "Vencido o error — lava contenida, no botón danger.",
    example: "Vencido",
  },
  {
    id: "canopySolid",
    label: "Canopy · sólido",
    emphasis: "solid" as const,
    description: "Énfasis alto — descuentos, métricas que deben leerse al instante.",
    example: "-10 %",
  },
] as const

export const NATURE_ACCENTS: NatureAccent[] = [
  {
    id: "ceniza",
    label: "Ceniza",
    hex: "#252B34",
    tagBg: "#20262E",
    tagText: "#94A3B8",
    subtlest: "#1A2027",
    subtler: "#20262E",
    subtle: "#334155",
    bold: "#64748B",
    textDefault: "#94A3B8",
    textBold: "#F8FAFC",
  },
  {
    id: "bruma",
    label: "Bruma",
    hex: "#64748B",
    tagBg: "#EEF1F5",
    tagText: "#334155",
    subtlest: "#F4F6F9",
    subtler: "#EEF1F5",
    subtle: "#DFE4EA",
    bold: "#475569",
    textDefault: "#64748B",
    textBold: "#121417",
  },
  {
    id: "savia",
    label: "Savia",
    hex: "#10B981",
    tagBg: "#D1FAE5",
    tagText: "#047857",
    subtlest: "#ECFDF5",
    subtler: "#D1FAE5",
    subtle: "#6EE7B7",
    bold: "#059669",
    textDefault: "#047857",
    textBold: "#022C22",
  },
  {
    id: "canopy",
    label: "Canopy",
    hex: "#1E8F5A",
    tagBg: "#DDF5E8",
    tagText: "#0F5739",
    subtlest: "#F0FBF4",
    subtler: "#DDF5E8",
    subtle: "#A8EBC4",
    bold: "#1E8F5A",
    textDefault: "#16704A",
    textBold: "#052E1F",
  },
  {
    id: "sea",
    label: "Mar",
    hex: "#06B6D4",
    tagBg: "#CFFAFE",
    tagText: "#0E7490",
    subtlest: "#ECFEFF",
    subtler: "#CFFAFE",
    subtle: "#67E8F9",
    bold: "#0891B2",
    textDefault: "#0E7490",
    textBold: "#164E63",
  },
  {
    id: "sky",
    label: "Cielo",
    hex: "#0EA5E9",
    tagBg: "#E0F2FE",
    tagText: "#0369A1",
    subtlest: "#F0F9FF",
    subtler: "#E0F2FE",
    subtle: "#BAE6FD",
    bold: "#0284C7",
    textDefault: "#0284C7",
    textBold: "#0369A1",
  },
  {
    id: "autumn",
    label: "Otoño",
    hex: "#F59E0B",
    tagBg: "#FEF3C7",
    tagText: "#B45309",
    subtlest: "#FFFBEB",
    subtler: "#FEF3C7",
    subtle: "#FDE68A",
    bold: "#D97706",
    textDefault: "#D97706",
    textBold: "#92400E",
  },
  {
    id: "fire",
    label: "Fuego",
    hex: "#F97316",
    tagBg: "#FFEDD5",
    tagText: "#C2410C",
    subtlest: "#FFF7ED",
    subtler: "#FFEDD5",
    subtle: "#FDBA74",
    bold: "#EA580C",
    textDefault: "#EA580C",
    textBold: "#9A3412",
  },
  {
    id: "dusk",
    label: "Crepúsculo",
    hex: "#8B5CF6",
    tagBg: "#EDE9FE",
    tagText: "#6D28D9",
    subtlest: "#F5F3FF",
    subtler: "#EDE9FE",
    subtle: "#C4B5FD",
    bold: "#7C3AED",
    textDefault: "#7C3AED",
    textBold: "#6D28D9",
  },
  {
    id: "earth",
    label: "Tierra",
    hex: "#78716C",
    tagBg: "#F5F5F0",
    tagText: "#57534E",
    subtlest: "#FAFAF7",
    subtler: "#F5F5F0",
    subtle: "#E7E5E4",
    bold: "#78716C",
    textDefault: "#78716C",
    textBold: "#44403C",
  },
  {
    id: "night",
    label: "Noche",
    hex: "#263530",
    tagBg: "#E7E5E4",
    tagText: "#1C2824",
    subtlest: "#F5F5F0",
    subtler: "#E7E5E4",
    subtle: "#D6D3D1",
    bold: "#141C19",
    textDefault: "#57534E",
    textBold: "#0C1210",
  },
]

export const CHART_NATURE_SEQUENCE = [
  { id: "ch1", label: "Canopy", hex: "#1E8F5A", usage: "Serie principal — marca." },
  { id: "ch2", label: "Mar", hex: "#06B6D4", usage: "Serie 2 — frescura." },
  { id: "ch3", label: "Cielo", hex: "#0EA5E9", usage: "Serie 3 — amplitud." },
  { id: "ch4", label: "Otoño", hex: "#F59E0B", usage: "Serie 4 — calor." },
  { id: "ch5", label: "Tierra", hex: "#78716C", usage: "Referencia / neutro." },
  { id: "ch6", label: "Crepúsculo", hex: "#8B5CF6", usage: "Serie 6 — contraste." },
]

export const CHART_STATUS_NATURE = [
  { id: "ok", label: "En curso / OK", hex: "#1E8F5A", boldHex: "#16704A" },
  { id: "warn", label: "Atención", hex: "#F59E0B", boldHex: "#D97706" },
  { id: "crit", label: "Crítico", hex: "#DC2626", boldHex: "#B91C1C" },
  { id: "info", label: "Información", hex: "#0EA5E9", boldHex: "#0284C7" },
  { id: "new", label: "Nuevo", hex: "#8B5CF6", boldHex: "#7C3AED" },
  { id: "todo", label: "Pendiente", hex: "#A8A29E", boldHex: "#78716C" },
]

export const PRIMARY_BRAND = CANOPY_FAMILY.steps.find((s) => s.id === "c600")!
