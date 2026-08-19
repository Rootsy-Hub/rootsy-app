/**
 * Sistema de layouts Rootsy — patrones de pantalla operativa en el POP.
 * Alineado al concepto de diseño: pocos datos, bien presentados.
 */

export type LayoutsHeroVariant = "hub" | "module" | "tables" | "blocks" | "operar"

export type LayoutsConceptBlock = {
  title: string
  lead: string
  why: readonly string[]
  closing: string
}

export const ROOTSY_LAYOUTS_CONCEPT: LayoutsConceptBlock = {
  title: "Pocos datos, bien presentados",
  lead:
    "Cada pantalla operativa del POP comparte un shell reconocible — header nocturno, cuerpo con aire, jerarquía que se lee al primer vistazo. Tablas para densidad, bloques para tarjetas, operaciones para flujos en vivo.",
  why: [
    "Naturalidad: el header sombra orienta; el cuerpo bruma deja respirar filas y cards — como un mostrador ordenado, no un spreadsheet.",
    "Simplicidad: tres familias de layout antes que pantallas únicas — reutilizar chrome, toolbar y footer compartidos.",
    "Intuitivo: split POS en operaciones — acción fluida a la izquierda, resumen fijo a la derecha; el ojo sabe dónde mirar.",
  ],
  closing:
    "Formas claras, datos al frente — el layout desaparece cuando funciona.",
} as const

export const ROOTSY_LAYOUTS_MANIFESTO =
  "Layouts del POP — módulos con fondo compartido, header reutilizable y tres tipos de contenido."

export const ROOTSY_LAYOUTS_PRINCIPLES = [
  {
    title: "Fondo POP",
    detail: "Imagen cover + velo — o fallback sombra. Igual que el menú.",
  },
  {
    title: "Shell 2 filas",
    detail: "Header h-17 · contenido bruma scrollable.",
  },
  {
    title: "Tipos de contenido",
    detail: "Tablas · bloques · operaciones — dentro del row de contenido.",
  },
] as const

export const ROOTSY_LAYOUTS_VARIANT_CONCEPT: Record<LayoutsHeroVariant, LayoutsConceptBlock & { eyebrow: string }> = {
  hub: {
    eyebrow: "Rootsy · Layouts",
    title: "Profundidad de layout",
    lead: "Páginas custom aparte. Acá documentamos el shell de módulos POP y lo que va dentro del contenido.",
    why: [
      "Fondo → header → contenido.",
      "Tablas · bloques · operaciones.",
    ],
    closing: "Un shell, tres densidades.",
  },
  module: {
    eyebrow: "Rootsy · Layouts · Módulo",
    title: "Shell del módulo",
    lead: "Fondo POP a pantalla completa, grid header + contenido bruma.",
    why: [
      "Foto cover + scrim + viñeta.",
      "Header sombra reutilizable.",
      "Contenido: bruma-50 por defecto.",
    ],
    closing: "Base compartida de clientes, cuentas, ventas…",
  },
  tables: {
    eyebrow: "Rootsy · Layouts · Tablas",
    title: "Contenido · tablas",
    lead: "Dentro del row de contenido — filtros, tabla densa, footer paginador.",
    why: [
      "Toolbar 92px.",
      "Filas alternadas bruma/savia.",
      "Footer tierra húmeda · 3 columnas.",
    ],
    closing: "Listados densos.",
  },
  blocks: {
    eyebrow: "Rootsy · Layouts · Bloques",
    title: "Contenido · bloques",
    lead: "Grid de tarjetas en bruma-50 — cuentas, cajas. Columnas auto-fill entre 18rem y 22rem.",
    why: [
      "Fondo layout.module.content.",
      "Cards elevation.overlay · radius.xxlarge.",
      "Sin toolbar ni paginación.",
    ],
    closing: "Entidades con cara propia.",
  },
  operar: {
    eyebrow: "Rootsy · Layouts · Operar",
    title: "Contenido · operar",
    lead: "Split POS — catálogo oscuro + toolbox + ticket 400px.",
    why: [
      "Vender · Comprar · Mesas · Mostrador.",
      "Sidebar w-64 (256px) colapsable.",
      "Ticket claro con acciones.",
    ],
    closing: "Flujo en vivo bajo el módulo.",
  },
}
