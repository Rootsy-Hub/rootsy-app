/**
 * Sistema de layouts Rootsy — patrones de pantalla operativa en el POP.
 * Alineado al concepto de diseño: pocos datos, bien presentados.
 */

export type LayoutsHeroVariant = "hub" | "tables" | "blocks" | "operations"

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
  "Patrones de pantalla operativa: header nocturno compartido, cuerpo con bruma o tierra según densidad, footer cuando hay paginación. Tablas, bloques y operaciones — misma raíz, distinta anatomía."

export const ROOTSY_LAYOUTS_PRINCIPLES = [
  {
    title: "Shell compartido",
    detail:
      "Header h-17, gradiente sombra y perfil POP — el usuario reconoce el workspace antes de leer el título.",
  },
  {
    title: "Densidad con propósito",
    detail:
      "Tablas para listados largos; bloques para entidades con saldo; operaciones para flujos en tiempo real.",
  },
  {
    title: "Split POS",
    detail:
      "Columna fluida para acción + columna fija ~380px para resumen — ticket, totales y confirmación siempre visibles.",
  },
  {
    title: "Piezas reutilizables",
    detail:
      "Toolbar, paginación, cards y chrome — documentados una vez, ensamblados en cada patrón.",
  },
] as const

export const ROOTSY_LAYOUTS_VARIANT_CONCEPT: Record<LayoutsHeroVariant, LayoutsConceptBlock & { eyebrow: string }> = {
  hub: {
    eyebrow: "Rootsy · Layouts",
    ...ROOTSY_LAYOUTS_CONCEPT,
  },
  tables: {
    eyebrow: "Rootsy · Layouts · Tablas",
    title: "Listados que respiran",
    lead:
      "Header nocturno, toolbar de filtros, tabla Nature y footer de paginación — la anatomía del listado workspace para datos densos con acciones por fila.",
    why: [
      "Naturalidad: filas alternadas en bruma, selección con savia — el ojo sigue la columna sin perderse.",
      "Simplicidad: tres zonas fijas — chrome, cuerpo scrollable, pie de paginación.",
      "Intuitivo: filtros arriba, datos en el centro, totales y páginas abajo — como un libro de cuentas abierto.",
    ],
    closing: "Muchos registros, una sola lectura — densidad sin ruido.",
  },
  blocks: {
    eyebrow: "Rootsy · Layouts · Bloques",
    title: "Tarjetas con jerarquía",
    lead:
      "Mismo shell workspace sin toolbar ni paginación: grid responsivo de cards con elevación interactiva, radio copa y superficie blanca uniforme.",
    why: [
      "Naturalidad: cada tarjeta es una entidad — saldo, meta y acción primaria en tres zonas claras.",
      "Simplicidad: grid auto-fill en lugar de columnas rígidas — se adapta al ancho sin romper el ritmo.",
      "Intuitivo: cards elevadas al hover — la interacción se anticipa antes del click.",
    ],
    closing: "Entidades con cara propia — no filas genéricas.",
  },
  operations: {
    eyebrow: "Rootsy · Layouts · Operaciones",
    title: "Flujo en vivo, resumen fijo",
    lead:
      "Header reutilizable y dos columnas — canvas nocturno fluido a la izquierda, panel de resumen ~380px a la derecha. Mesas, mostrador y compras comparten la misma estructura.",
    why: [
      "Naturalidad: la columna noche concentra la acción; la columna tierra sostiene el ticket — como mostrador y caja registradora.",
      "Simplicidad: un split, dos lecturas — no tres paneles compitiendo.",
      "Intuitivo: el resumen nunca se pierde al scrollear el canvas — totales siempre a la vista.",
    ],
    closing: "Operar a la izquierda, confirmar a la derecha — el split POS en acción.",
  },
}
