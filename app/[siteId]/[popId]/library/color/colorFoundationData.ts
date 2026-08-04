export type ColorSwatchSpec = {
  id: string
  label: string
  usage: string
  className?: string
  captionClassName?: string
  ring?: boolean
}

export type ColorRoleSpec = {
  roleLabel: string
  description: string
  exampleClassName: string
  exampleLabel: string
}

export const COLOR_FOUNDATION_INTRO =
  "El color distingue la marca Rootsy y mantiene experiencias coherentes entre workspace, ventas y formularios. Cada tono tiene un rol — usalo con intención, no por estética sola."

export const COLOR_ANATOMY = [
  {
    id: "saturated",
    title: "Colores saturados",
    description:
      "Verdes de marca, ámbar cálido y acentos nature. Transmiten significado: acción principal, éxito, atención o identidad Rootsy.",
  },
  {
    id: "neutral",
    title: "Colores neutros",
    description:
      "Fondos, texto y bordes del workspace claro. Organizan jerarquía visual sin cargar emocionalmente la interfaz.",
  },
  {
    id: "alpha",
    title: "Transparencias",
    description:
      "Capas semitransparentes para banners, overlays y hovers. Se adaptan al fondo sin fijar un gris rígido.",
  },
] as const

export const BRAND_RAMP: ColorSwatchSpec[] = [
  {
    id: "meadow",
    label: "Prado",
    usage: "Highlights suaves, partículas y estados positivos ligeros.",
    className: "bg-meadow",
  },
  {
    id: "primary",
    label: "Verde principal",
    usage: "Acciones principales, links y selección activa en navegación.",
    className: "bg-primary",
  },
  {
    id: "forest",
    label: "Bosque",
    usage: "Acentos de marca en gráficos y elementos destacados.",
    className: "bg-forest",
  },
  {
    id: "emerald-action",
    label: "Verde acción",
    usage: "Botón principal en modales y confirmaciones.",
    className: "bg-emerald-600",
  },
  {
    id: "emerald-focus",
    label: "Verde foco",
    usage: "Borde y halo cuando un campo está activo.",
    className: "bg-emerald-700",
  },
]

export const NEUTRAL_RAMP: ColorSwatchSpec[] = [
  {
    id: "background",
    label: "Fondo",
    usage: "Superficie base de página.",
    className: "bg-background",
    ring: true,
  },
  {
    id: "muted",
    label: "Sutil",
    usage: "Sidebar, hovers y fondos secundarios.",
    className: "bg-muted",
  },
  {
    id: "border",
    label: "Borde",
    usage: "Separadores y contornos de panel.",
    className: "bg-border",
  },
  {
    id: "muted-fg",
    label: "Texto secundario",
    usage: "Hints, descripciones y navegación secundaria.",
    className: "bg-muted-foreground",
  },
  {
    id: "foreground",
    label: "Texto principal",
    usage: "Títulos y contenido de lectura.",
    className: "bg-foreground",
  },
]

export const NATURE_ACCENT_SWATCHES: ColorSwatchSpec[] = [
  {
    id: "accent",
    label: "Acento cálido",
    usage: "Highlights decorativos y segunda serie en gráficos.",
    className: "bg-accent",
  },
  {
    id: "amber",
    label: "Ámbar",
    usage: "Avisos y badges de atención.",
    className: "bg-amber",
  },
  {
    id: "bark",
    label: "Corteza",
    usage: "Tonos tierra en visualizaciones.",
    className: "bg-bark",
  },
  {
    id: "cream",
    label: "Crema",
    usage: "Superficies cálidas alternativas.",
    className: "bg-cream",
    ring: true,
  },
]

export const CARD_SWATCH: ColorSwatchSpec = {
  id: "card",
  label: "Tarjeta",
  usage: "Modales, paneles elevados y tarjetas de contenido.",
  className: "bg-card",
  ring: true,
}

export const FORM_CONTROL_SWATCHES: ColorSwatchSpec[] = [
  {
    id: "affix",
    label: "Fondo de prefijo",
    usage: "Símbolos $, unidades y selectores en campos.",
    className: "bg-zinc-50 ring-1 ring-inset ring-zinc-200",
  },
  {
    id: "control-border",
    label: "Borde de control",
    usage: "Contorno de inputs, selects y áreas editables.",
    className: "bg-zinc-200",
  },
  {
    id: "hint",
    label: "Texto de ayuda",
    usage: "Mensajes debajo de campos.",
    className: "bg-zinc-500",
  },
  {
    id: "input-text",
    label: "Texto ingresado",
    usage: "Contenido que escribe la persona usuaria.",
    className: "bg-zinc-900",
  },
]

export const ALPHA_SWATCHES: ColorSwatchSpec[] = [
  {
    id: "brand-tint",
    label: "Tinte de marca",
    usage: "Sección activa en navegación y badges suaves.",
    className: "bg-primary/10",
  },
  {
    id: "danger-tint",
    label: "Tinte de error",
    usage: "Banners y alertas de error.",
    className: "bg-destructive/10 ring-1 ring-inset ring-destructive/25",
  },
  {
    id: "warning-tint",
    label: "Tinte de aviso",
    usage: "Advertencias no bloqueantes.",
    className: "bg-amber-500/10 ring-1 ring-inset ring-amber-500/25",
  },
  {
    id: "success-tint",
    label: "Tinte de éxito",
    usage: "Confirmaciones y feedback positivo.",
    className: "bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20",
  },
  {
    id: "overlay",
    label: "Velo ligero",
    usage: "Superposiciones y etiquetas sobre color.",
    className: "bg-black/10",
  },
]

export const COLOR_ROLES: ColorRoleSpec[] = [
  {
    roleLabel: "Marca",
    description: "Acciones principales y elementos que comunican la identidad Rootsy.",
    exampleClassName: "bg-primary text-primary-foreground",
    exampleLabel: "Guardar",
  },
  {
    roleLabel: "Neutro",
    description: "Texto, fondos y UI secundaria sin carga semántica.",
    exampleClassName: "border border-border bg-card text-foreground",
    exampleLabel: "Panel",
  },
  {
    roleLabel: "Éxito",
    description: "Resultados favorables y validación correcta.",
    exampleClassName: "border border-emerald-500/20 bg-emerald-500/5 text-emerald-800",
    exampleLabel: "Formato válido",
  },
  {
    roleLabel: "Aviso",
    description: "Precaución antes de un error o pérdida de datos.",
    exampleClassName: "border border-amber-500/25 bg-amber-500/10 text-amber-800",
    exampleLabel: "Stock negativo",
  },
  {
    roleLabel: "Peligro",
    description: "Eliminar, errores graves o acciones irreversibles.",
    exampleClassName: "bg-destructive text-white",
    exampleLabel: "Eliminar",
  },
  {
    roleLabel: "Decorativo",
    description: "Color sin significado fijo — intercambiable en gráficos y detalle.",
    exampleClassName: "bg-meadow text-foreground",
    exampleLabel: "Serie de chart",
  },
  {
    roleLabel: "Formulario",
    description: "Controles editables; el verde de foco indica el campo activo.",
    exampleClassName: "border border-zinc-200 bg-white ring-2 ring-emerald-700/45",
    exampleLabel: "Campo activo",
  },
]

export const ACCESSIBILITY_NOTES = [
  {
    ratio: "4.5:1",
    rule: "Texto pequeño y cuerpo de lectura",
    applies: "Título y párrafos sobre fondo claro; textos de ayuda en campos.",
  },
  {
    ratio: "3:1",
    rule: "Controles esenciales y titulares grandes",
    applies: "Bordes de foco, iconos en botones primarios y elementos táctiles.",
  },
]

export const COLOR_USAGE_STEPS = [
  {
    label: "Rol",
    detail: "¿Marca, neutro, aviso o error?",
  },
  {
    label: "Énfasis",
    detail: "¿Necesita gritar o acompañar?",
  },
  {
    label: "Superficie",
    detail: "¿Sobre fondo, tarjeta o overlay?",
  },
] as const
