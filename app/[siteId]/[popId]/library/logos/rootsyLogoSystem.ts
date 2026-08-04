export type LogoColorVariant = "brand" | "inverse" | "neutral"

export type LogoLockup = {
  id: string
  label: string
  variant: LogoColorVariant
  src: string
  alt: string
  /** Fondo recomendado para previsualizar legibilidad */
  previewBg: "light" | "canopy" | "dark" | "neutral"
  usage: string
}

export type LogoLogomark = {
  id: string
  label: string
  variant: LogoColorVariant
  src: string
  alt: string
  previewBg: "light" | "canopy" | "dark"
  usage: string
}

export const ROOTSY_LOGO_MANIFESTO =
  "Un logotipo representa la marca en producto y marketing. Rootsy usa logomark + wordmark en lockup; la identidad del POP es avatar (foto subida) + nombre comercial, con variantes que pueden sumar dirección u otros metadatos según la pantalla."

export const ROOTSY_LOGO_PRINCIPLES = [
  {
    title: "Logomark + wordmark",
    body: "El tile con la R es el logomark. Rootsy como texto es el wordmark. En producto pueden usarse juntos (lockup) o separados cuando el contexto es claro.",
  },
  {
    title: "POP = avatar + nombre",
    body: "Cada negocio sube su foto (pop.imageUrl). El nombre comercial se renderiza con tipografía nativa — no hay wordmark fijo del tenant.",
  },
  {
    title: "Variantes de color",
    body: "Brand / inverse / neutral para Rootsy. El POP reutiliza la misma foto en círculo (home) o cuadrado (header) según densidad.",
  },
  {
    title: "Alt-text descriptivo",
    body: 'Rootsy: alt="Rootsy". POP: alt="" en avatar decorativo; el nombre va en texto visible o aria-label del control.',
  },
] as const

export const ROOTSY_LOGO_LOCKUPS: LogoLockup[] = [
  {
    id: "rootsy-inverse",
    label: "Inverse · lockup",
    variant: "inverse",
    src: "/rootsy-logo.svg",
    alt: "Rootsy",
    previewBg: "canopy",
    usage: "Landing, login y hero oscuro — asset de producción actual.",
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
    previewBg: "canopy",
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
