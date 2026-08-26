export type LogoColorVariant = "brand" | "inverse" | "neutral"

export type LogoPreviewBg = "light" | "sombra" | "savia" | "dark" | "neutral"

export type LogoLockup = {
  id: string
  label: string
  variant: LogoColorVariant
  src: string
  alt: string
  /** Fondo recomendado para previsualizar legibilidad */
  previewBg: LogoPreviewBg
  usage: string
}

export type LogoLogomark = {
  id: string
  label: string
  variant: LogoColorVariant
  src: string
  alt: string
  previewBg: Exclude<LogoPreviewBg, "neutral">
  usage: string
}

export const ROOTSY_LOGO_CONCEPT = {
  title: "Raíz visible de la marca",
  lead:
    "Rootsy se reconoce por logomark + wordmark; cada POP se reconoce por su foto y su nombre comercial. Dos identidades en el mismo producto — plataforma y negocio — sin competir por atención.",
  why: [
    "Naturalidad: el avatar del POP es la cara del negocio; Rootsy aparece cuando el contexto de plataforma no es obvio.",
    "Simplicidad: lockup fijo para Rootsy; tipografía nativa para el nombre del tenant — nada de wordmarks duplicados.",
    "Intuitivo: círculo en home, cuadrado en header, logo B/N aparte en tickets — la forma anticipa el uso.",
  ],
  closing:
    "Como un letrero en el sendero: la marca orienta, el negocio habla por sí mismo.",
} as const

export const ROOTSY_LOGO_MANIFESTO =
  "Un logotipo representa la marca en producto y marketing. Rootsy usa logomark + wordmark en lockup sobre sombra o savia; la identidad del POP es avatar (pop.imageUrl) + nombre comercial, con variantes que suman dirección u otros metadatos según la pantalla."

export const ROOTSY_LOGO_PRINCIPLES = [
  {
    title: "Logomark + wordmark",
    detail:
      "El tile con la R es el logomark. Rootsy como texto es el wordmark. En producto pueden usarse juntos (lockup) o separados cuando el contexto es claro.",
  },
  {
    title: "POP = avatar + nombre",
    detail:
      "Cada negocio sube su foto (pop.imageUrl). El nombre comercial se renderiza con tipografía nativa — no hay wordmark fijo del tenant.",
  },
  {
    title: "Variantes de color",
    detail:
      "Brand / inverse / neutral para Rootsy. El POP reutiliza la misma foto en círculo (home) o cuadrado (header) según densidad.",
  },
  {
    title: "Alt-text descriptivo",
    detail:
      'Rootsy: alt="Rootsy". POP: alt="" en avatar decorativo; el nombre va en texto visible o aria-label del control.',
  },
] as const

export const ROOTSY_LOGO_LOCKUPS: LogoLockup[] = [
  {
    id: "rootsy-inverse",
    label: "Inverse · lockup",
    variant: "inverse",
    src: "/rootsy-logo.svg",
    alt: "Rootsy",
    previewBg: "savia",
    usage: "Landing, login y hero savia — asset de producción actual.",
  },
  {
    id: "rootsy-brand",
    label: "Brand · lockup",
    variant: "brand",
    src: "/logos/rootsy/rootsy-logo-brand.svg",
    alt: "Rootsy",
    previewBg: "light",
    usage: "Documentos, emails y superficies claras del producto.",
  },
  {
    id: "rootsy-neutral",
    label: "Neutral · lockup",
    variant: "neutral",
    src: "/logos/rootsy/rootsy-logo-neutral.svg",
    alt: "Rootsy",
    previewBg: "neutral",
    usage: "Pie de página, watermarks y contextos de bajo contraste.",
  },
]

export const ROOTSY_LOGOMARKS: LogoLogomark[] = [
  {
    id: "rootsy-mark-brand",
    label: "Brand · logomark",
    variant: "brand",
    src: "/logos/rootsy/rootsy-logomark-brand.svg",
    alt: "Rootsy",
    previewBg: "light",
    usage: "Cuando el nombre Rootsy se renderiza con tipografía nativa.",
  },
  {
    id: "rootsy-mark-inverse",
    label: "Inverse · logomark",
    variant: "inverse",
    src: "/logos/rootsy/rootsy-logomark-inverse.svg",
    alt: "Rootsy",
    previewBg: "sombra",
    usage: "Nav superior en contextos oscuros — emparejar con label.",
  },
]

/** Espécimen real — POP Narciso (Winebar). Assets en public/logos/pop/narciso/. */
export const POP_IDENTITY_SPECIMEN = {
  name: "Narciso",
  address: "Palermo, CABA",
  initials: "NA",
  imageUrl: "/logos/pop/narciso/narciso-avatar.jpg",
  ticketLogoUrl: "/logos/pop/narciso/narciso-ticket.png",
} as const

export type PopIdentityVariantId =
  | "home-picker"
  | "home-picker-address"
  | "home-picker-initials"
  | "header-compact"
  | "horizontal-address"
  | "ticket-logo"

export type PopIdentityVariant = {
  id: PopIdentityVariantId
  label: string
  usage: string
  source: string
  fields: readonly string[]
}

export const POP_IDENTITY_VARIANTS: PopIdentityVariant[] = [
  {
    id: "home-picker",
    label: "Home · avatar + nombre",
    usage: "Selector de POP en /home — círculo grande y nombre comercial debajo.",
    source: "app/home/page.tsx",
    fields: ["pop.imageUrl", "pop.name"],
  },
  {
    id: "home-picker-address",
    label: "Home · con dirección",
    usage:
      "Misma composición vertical; la dirección reemplaza o complementa metadatos secundarios en listados extendidos.",
    source: "pop.streetAddress · pop.city",
    fields: ["pop.imageUrl", "pop.name", "pop.streetAddress"],
  },
  {
    id: "home-picker-initials",
    label: "Sin foto · iniciales",
    usage:
      "Fallback cuando no hay imagen — gradiente determinístico + siglas del nombre comercial.",
    source: "app/home/page.tsx · initialsFromName",
    fields: ["pop.name"],
  },
  {
    id: "header-compact",
    label: "Header workspace",
    usage: "Barra superior del workspace — avatar 32 px cuadrado + nombre truncado.",
    source: "components/layouts/DataWorkspaceLayout.tsx",
    fields: ["pop.imageUrl", "pop.name"],
  },
  {
    id: "horizontal-address",
    label: "Ficha horizontal · dirección",
    usage:
      "Filas densas, comprobantes o ajustes — avatar mediano alineado a nombre y domicilio.",
    source: "Ajustes del POP · preview de ticket",
    fields: ["pop.imageUrl", "pop.name", "pop.streetAddress", "pop.city"],
  },
  {
    id: "ticket-logo",
    label: "Logo para tickets",
    usage:
      "Asset aparte en B/N (pop.invoiceLogoUrl) — no es el avatar; se sube en Ajustes → Logo para tickets.",
    source: "PopSettingsImageUploadField · kind=ticket-logo",
    fields: ["pop.invoiceLogoUrl"],
  },
]

export const POP_HOME_ACCENTS = {
  accent: "from-amber-400 via-yellow-500 to-orange-600",
  glow: "shadow-amber-500/35",
} as const

export const POP_TICKET_LOGO_SPECIMEN = POP_IDENTITY_SPECIMEN.ticketLogoUrl

export const LOGO_CLEARANCE = {
  rootsy: {
    ideal: "Altura del wordmark alrededor del lockup completo.",
    minimum: "Altura de la letra R del logomark como margen mínimo.",
  },
  pop: {
    ideal: "Separación vertical de al menos mt-4 entre avatar y nombre en home.",
    minimum: "Ring de 2 px en avatar — no recortar la foto con badges superpuestos.",
  },
} as const

export const LOGO_GUIDELINES = {
  do: [
    "Usar assets oficiales Rootsy sin modificar proporciones.",
    "Mostrar la foto del POP en object-cover dentro del círculo o cuadrado.",
    "Truncar nombre largo en header; centrar en el picker de home.",
    "Subir logo B/N aparte para tickets (invoiceLogoUrl).",
  ],
  dont: [
    "No estirar la foto del avatar — mantener aspect ratio con object-cover.",
    "No usar el logo Rootsy para representar un POP individual.",
    "No confundir avatar (imageUrl) con logo de ticket (invoiceLogoUrl).",
    "No agregar bordes o máscaras distintas al patrón aprobado.",
  ],
} as const

export const LOGO_ANATOMY = [
  { term: "Logomark", definition: "Símbolo sin nombre — la R en tile para Rootsy." },
  { term: "Wordmark", definition: "Nombre tipográfico — Rootsy en lockup fijo." },
  { term: "Avatar POP", definition: "Foto subida por el tenant (pop.imageUrl) — identidad visual del negocio." },
  { term: "Lockup POP", definition: "Avatar + nombre comercial; opcionalmente dirección u otros metadatos." },
  { term: "Avatar persona", definition: "Foto de quien opera (profile.imageUrl) — círculo, radius.full." },
  { term: "Lockup persona", definition: "Foto + nombre + rol; un control. No es el lockup del POP." },
] as const

/**
 * Tercera identidad del producto — quien opera.
 * Derivada de concepto + fundamentos (tipo, color, radio, espacio).
 * No documenta el código actual del header.
 */
export const USER_PROFILE_CONCEPT = {
  title: "Quien opera",
  lead:
    "Rootsy es la plataforma, el POP es el negocio, la persona es quien está en el turno. Tres identidades — cada una con su cara, sin prestársela.",
  why: [
    "Naturalidad: un bloque, un menú. Nombre, rol y foto se leen como una sola persona — como presentarse en el mostrador.",
    "Simplicidad: círculo (avatar) + tipografía nativa. Dos densidades de la escala de espacio; nada de tamaños sueltos.",
    "Autenticidad: la foto del perfil. Nunca el avatar del POP ni el logomark Rootsy.",
  ],
  closing:
    "La forma anticipa el uso: el negocio en header es cuadrado; la persona es círculo — radius.full, como todo avatar.",
} as const

export const USER_PROFILE_SPECIMEN = {
  name: "María González",
  roleLabel: "Administradora",
  initials: "MG",
  isOnline: true,
} as const

export type UserProfileVariantId = "header-menu" | "header-workspace"

export type UserProfileVariant = {
  id: UserProfileVariantId
  label: string
  usage: string
  context: string
  tokens: string
  fields: readonly string[]
}

export const USER_PROFILE_VARIANTS: UserProfileVariant[] = [
  {
    id: "header-menu",
    label: "Header menú",
    usage:
      "Cierre derecho del hub. Más aire: el menú no tiene título de módulo compitiendo. Avatar un paso de la escala por encima del workspace.",
    context: "Chrome sombra · header del menú",
    tokens: "space.500 · radius.full · font.body + font.body.small",
    fields: ["profile.fullName", "profile.imageUrl", "roleLabel", "isOnline"],
  },
  {
    id: "header-workspace",
    label: "Header workspace",
    usage:
      "Misma anatomía, un paso más denso. El avatar empatado a space.400 — el mismo 32 px del lockup POP en header — para que persona y negocio se lean como un par.",
    context: "Chrome sombra · header de módulo",
    tokens: "space.400 · radius.full · font.body + font.body.small",
    fields: ["profile.fullName", "profile.imageUrl", "roleLabel", "isOnline"],
  },
]

export const USER_PROFILE_ANATOMY = [
  {
    term: "Lockup persona",
    definition:
      "Foto + nombre + rol. Un solo control: todo el bloque abre el menú de cuenta. No es el lockup del POP.",
  },
  {
    term: "Nombre",
    definition:
      "profile.fullName · font.body (14 px, regular, Inter). En sombra: text-on-dark. Truncar. A la izquierda de la foto, alineado a la derecha.",
  },
  {
    term: "Rol",
    definition:
      "roleLabel · font.body.small (12 px, regular). Metadato, no heading. Sentence case — la tipografía reserva versales para IDs (ART-001), no para palabras.",
  },
  {
    term: "Avatar de persona",
    definition:
      "profile.imageUrl · object-cover · radius.full. El radio de avatares es círculo; el cuadrado del header es del POP como marca comercial.",
  },
  {
    term: "Presencia",
    definition:
      "Punto space.100 anclado al recorte. En línea: --color-status-success (savia 500). Sin conexión: --color-status-danger. Anillo sombra-900. Sin label ni badge.",
  },
] as const

export const USER_PROFILE_MEASURES = [
  { token: "space.500", value: "40 px", note: "Avatar en header menú" },
  { token: "space.400", value: "32 px", note: "Avatar en header workspace — par del POP compacto" },
  { token: "radius.full", value: "círculo", note: "Avatares — manifiesto de radio" },
  { token: "space.150", value: "12 px", note: "Gap avatar ↔ contenido" },
  { token: "space.100", value: "8 px", note: "Punto de presencia — un tamaño, ambas densidades" },
  { token: "font.body", value: "14 / 400", note: "Nombre · Inter" },
  { token: "font.body.small", value: "12 / 400", note: "Rol · metadato, no versales" },
  { token: "color.text-on-dark", value: "blanco", note: "Nombre sobre chrome sombra" },
  { token: "bruma.400", value: "meta", note: "Rol — savia solo en acción o foco, no en identidad" },
  { token: "status.success / danger", value: "punto", note: "Presencia — no emerald suelto" },
] as const

export const USER_PROFILE_PRINCIPLES = [
  {
    title: "Naturalidad · un gesto",
    detail:
      "Nombre, rol y foto son una sola persona. El menú se abre desde cualquier parte del bloque — no hay que cazar la foto.",
  },
  {
    title: "Simplicidad · dos pasos de escala",
    detail:
      "Menú en space.500, workspace en space.400. El punto es siempre space.100. Si dudás, no inventes un tercer tamaño.",
  },
  {
    title: "Autenticidad · cara propia",
    detail:
      "La foto es profile.imageUrl. Sin foto: iniciales + gradiente savia, el mismo patrón que el POP sin imagen. Nunca Dicebear de sistema ni la cara del negocio.",
  },
  {
    title: "Color con función",
    detail:
      "Savia en el punto (vida / en línea) y en el fallback. El rol es bruma — es dato, no CTA. El nombre es luz sobre sombra.",
  },
] as const

export const USER_PROFILE_GUIDELINES = {
  do: [
    "Un hit target para todo el lockup.",
    "radius.full en la persona; radius.large (cuadrado) en el POP de header.",
    "font.body + font.body.small — sentence case en el rol.",
    "Presencia con tokens de status; anillo del chrome (sombra-900).",
    "alt=\"\" en la foto; el nombre visible o aria-label del control cargan la identidad.",
    "En densidad estrecha, la foto basta — el nombre no pelea con el título del módulo.",
    "Hover = brisa (motion.interaction.hover): el rol aclara a bruma-300 y el círculo toma hairline blanco. Sin losa.",
  ],
  dont: [
    "No pintar un fill (white/6, rounded-lg) detrás del lockup — se lee como chip, no como persona.",
    "No documentar ni copiar radios de icon-button (rounded-xl) como si fueran el avatar.",
    "No poner el rol en versales ni en 10 px — no está en la escala.",
    "No pintar el rol con savia: savia es acción o estado, no cargo.",
    "No usar emerald, zinc ni Dicebear — no son tokens de Rootsy.",
    "No prestar pop.imageUrl ni el logomark a la persona.",
    "No reemplazar el punto por un badge «En línea».",
  ],
} as const
