import { ROOTSY_COLOR_SEMANTIC, rootsyColorHex } from "@/lib/design-system"

export const ROOTSY_PRODUCT_ESSENCE =
  "Rootsy es un sistema de gestión online para cualquier tipo de negocio — panadería, ferretería, restaurante, servicios o lo que sea. Vender, stock, operaciones y el día a día del negocio en un solo lugar, sin importar el rubro."

export const ROOTSY_BRAND_MANIFESTO =
  "Detrás del producto hay una marca con alma: Rootsy nace de una mascota que habita su propio mundo, un parque digital donde se mueve con libertad. Ese espacio es tecnológico, pero se percibe como naturaleza — no como una interfaz fría. La mascota observa, interpreta y actúa con la agudeza de una inteligencia artificial, pero su entorno le recuerda valores orgánicos: crecer sin forzar, adaptarse, fluir."

export const ROOTSY_BRAND_CLOSING =
  "La marca traduce eso en una experiencia tan obvia como un paseo al aire libre: intuitiva como un sendero conocido, variada como un ecosistema vivo, y tan concreta que parece inevitable — no diseñada."

export const ROOTSY_BRAND_VALUES = [
  {
    title: "Naturalidad",
    detail:
      "Todo debe entenderse al primer contacto. Sin manual, sin fricción — como caminar por un lugar que ya conocés.",
  },
  {
    title: "Simplicidad",
    detail:
      "Formas reconocibles, jerarquías claras. Distintas profundidades y tamaños sí; ornamentos, rarezas y ruido visual, no.",
  },
  {
    title: "Autenticidad",
    detail:
      "Datos y acciones reales. Lo que ves es lo que hay — tan creíble que la experiencia se siente natural, no fabricada.",
  },
] as const

export const ROOTSY_DESIGN_MANIFESTO =
  "El diseño aplica la misma lógica del mundo Rootsy: formas legibles, proporciones que respiran como en la naturaleza, animaciones con inercia orgánica. Sin detalles raros ni elementos superfluos. Pocos datos, bien presentados — cada pantalla se entiende al primer vistazo."

export const ROOTSY_DESIGN_PRINCIPLES = [
  {
    title: "Formas claras",
    detail: "Bloques, cards y controles con contorno definido. Nada ambiguo ni decorativo.",
  },
  {
    title: "Proporciones naturales",
    detail: "Espaciado y escala que siguen un ritmo humano — no una rejilla arbitraria.",
  },
  {
    title: "Movimiento orgánico",
    detail: "Transiciones suaves, con aceleración y frenado creíbles. Nada mecánico ni brusco.",
  },
  {
    title: "Datos mínimos",
    detail: "Solo lo necesario, en lenguaje directo. Menos columnas, más claridad.",
  },
] as const

/** Muestra de paleta bruma + resaltado savia para demos de concepto. */
export const CONCEPT_PALETTE_DEMO = [
  { label: "Bruma 100", hex: "#EEF1F5", role: "Fondo" },
  { label: "Bruma 50", hex: "#F4F6F9", role: "Superficie" },
  { label: "Blanco", hex: "#FFFFFF", role: "Card" },
  { label: "Bruma 500", hex: "#64748B", role: "Metadatos" },
  { label: "Bruma 900", hex: "#121417", role: "Texto" },
  { label: "Savia 600", hex: "#059669", role: "Acción · vida" },
] as const

export const CONCEPT_LIST_ITEMS = [
  { name: "Medialuna clásica", meta: "Panadería · x2", price: "$ 1.200", active: true },
  { name: "Café con leche", meta: "Bebidas · x1", price: "$ 2.800", active: false },
  { name: "Tostado completo", meta: "Sandwich · x1", price: "$ 4.500", active: false },
] as const

export const CONCEPT_TOKENS = {
  bruma100: rootsyColorHex("bruma", "100"),
  bruma50: rootsyColorHex("bruma", "50"),
  bruma200: rootsyColorHex("bruma", "200"),
  bruma500: rootsyColorHex("bruma", "500"),
  bruma600: rootsyColorHex("bruma", "600"),
  bruma900: rootsyColorHex("bruma", "900"),
  savia600: rootsyColorHex("savia", "600"),
  savia500: rootsyColorHex("savia", "500"),
  savia50: rootsyColorHex("savia", "50"),
  savia800: rootsyColorHex("savia", "800"),
  ceniza900: rootsyColorHex("ceniza", "900"),
  ceniza700: rootsyColorHex("ceniza", "700"),
  white: ROOTSY_COLOR_SEMANTIC.white,
} as const
