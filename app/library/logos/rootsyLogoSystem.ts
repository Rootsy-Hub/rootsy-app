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
] as const

/** Espécimen — persona en chrome de header. No reutilizar el avatar del POP. */
export const USER_PROFILE_SPECIMEN = {
  name: "María González",
  roleLabel: "Administradora",
  initials: "MG",
  imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria-gonzalez",
  isOnline: true,
} as const

export type UserProfileVariantId = "header-menu" | "header-workspace"

export type UserProfileVariant = {
  id: UserProfileVariantId
  label: string
  usage: string
  source: string
  density: string
  fields: readonly string[]
}

export const USER_PROFILE_VARIANTS: UserProfileVariant[] = [
  {
    id: "header-menu",
    label: "Header menú · bloque de perfil",
    usage:
      "Cierre derecho del menú del POP. Avatar 40 px — mismo peso visual que el logo del negocio (48 px) sin competir con la búsqueda.",
    source: "app/[siteId]/[popId]/menu/page.tsx",
    density: "size-10 · rounded-xl · punto 10 px / ring-2",
    fields: ["profile.fullName", "profile.imageUrl", "roleLabel", "isOnline"],
  },
  {
    id: "header-workspace",
    label: "Header workspace · bloque de perfil",
    usage:
      "Misma anatomía, densidad compacta. Avatar 32 px — empatado con el avatar cuadrado del POP para que persona y negocio se lean como un par.",
    source: "components/layouts-module/ModuleWorkspaceHeader.tsx",
    density: "size-8 · rounded-xl · punto 8 px / ring-1",
    fields: ["profile.fullName", "profile.imageUrl", "roleLabel", "isOnline"],
  },
]

export const USER_PROFILE_ANATOMY = [
  {
    term: "Bloque de perfil",
    definition:
      "Un solo control: nombre + rol + foto. Todo el bloque abre el dropdown — no cazar el avatar.",
  },
  {
    term: "Nombre",
    definition:
      "profile.fullName · text-sm regular · luz del realm. A la izquierda de la foto, alineado a la derecha. Truncar.",
  },
  {
    term: "Rol",
    definition:
      "roleLabel · 10 px semibold uppercase tracking-wider. Savia cuando hay rol resuelto; no es un badge.",
  },
  {
    term: "Avatar de persona",
    definition:
      "profile.imageUrl · object-cover · rounded-xl. No círculo (home POP) ni rounded-lg (ficha POP).",
  },
  {
    term: "Presencia",
    definition:
      "Punto anclado al recorte de la foto. Escala con el bloque. Esmeralda en línea, rojo sin conexión. Sin label.",
  },
] as const

export const USER_PROFILE_MEASURES = [
  { token: "Avatar menú", value: "40 px", note: "size-10 · RootsIconButton default" },
  { token: "Avatar workspace", value: "32 px", note: "size-8 · empatado al POP compacto" },
  { token: "Radio avatar", value: "rounded-xl", note: "Más suave que el POP (rounded-lg)" },
  { token: "Gap texto ↔ foto", value: "12 px", note: "gap-3" },
  { token: "Punto menú", value: "10 px / ring-2", note: "bottom-1 right-1" },
  { token: "Punto workspace", value: "8 px / ring-1", note: "bottom-0.5 right-0.5" },
  { token: "Nombre", value: "14 px / regular", note: "menuRealmBodyClass" },
  { token: "Rol", value: "10 px / semibold", note: "uppercase · tracking-wider" },
] as const

export const USER_PROFILE_PRINCIPLES = [
  {
    title: "Un hit target",
    detail:
      "Nombre, rol y foto disparan el mismo menú. El área grande reduce error y comunica que es una persona, no un ícono suelto.",
  },
  {
    title: "Persona ≠ negocio",
    detail:
      "El POP es cuadrado rounded-lg; la persona es rounded-xl. Nunca usar pop.imageUrl como cara del usuario.",
  },
  {
    title: "Densidad según chrome",
    detail:
      "El menú puede darse 40 px. El workspace cede espacio al título del módulo: 32 px, mismo peso que el lockup del POP.",
  },
  {
    title: "Presencia proporcional",
    detail:
      "El punto vive adentro del recorte (overflow hidden). Si el avatar achica, el punto achica — si no, tapa la cara.",
  },
] as const

export const USER_PROFILE_GUIDELINES = {
  do: [
    "Abrir el dropdown desde cualquier parte del bloque.",
    "Escalar el punto de conexión con el tamaño del avatar.",
    "alt=\"\" en la foto; aria-label en el control («Menú de {nombre}»).",
    "Ocultar nombre y rol bajo sm — en mobile basta la foto.",
    "Fallback: iniciales o Dicebear. Nunca el logo Rootsy ni el avatar del POP.",
  ],
  dont: [
    "No separar el click del nombre del click de la foto.",
    "No usar círculo para la persona en header — el círculo es del picker de home.",
    "No dejar el punto a 10 px sobre un avatar de 32 px.",
    "No reemplazar el punto por un badge «En línea».",
    "No pintar el nombre con bruma-900 sobre chrome oscuro.",
  ],
} as const
