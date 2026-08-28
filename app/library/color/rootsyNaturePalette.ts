/**
 * Paleta de producto Rootsy — rampas para la librería Color.
 * Atmósferas: éter · bruma (luz filtrada) · sombra.
 * Funcionales: savia · cielo · sol · lava.
 */

import {
  ROOTSY_CIELO,
  ROOTSY_ETER,
  ROOTSY_ETER_CLIMA,
  ROOTSY_LAVA,
  ROOTSY_SOL,
  ROOTSY_SUELO,
  rootsyColorHex,
} from "@/lib/design-system/tokens/colors"

const hx = rootsyColorHex

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

/** Sotobosque · Sombra — el dosel para operar. */
export const SOMBRA_FAMILY: NatureFamily = {
  id: "sombra",
  title: "Sotobosque · Sombra",
  subtitle: "El dosel para operar",
  description:
    "Sombra profunda del mismo bosque. El tope es negro, fuera de rampa. El 950 es aire. La hoja es 800: rail, toolbar, cards y slots. Savia solo en oficio.",
  steps: [
    { id: "z950", label: "950", hex: hx("sombra", "950"), usage: "★ Fondo — shell, rail, canvas y toolbox. Siempre el más oscuro." },
    { id: "z900", label: "900", hex: hx("sombra", "900"), usage: "Velos e item activo." },
    { id: "z800", label: "800", hex: hx("sombra", "800"), usage: "Hover del item activo." },
    { id: "z700", label: "700", hex: hx("sombra", "700"), usage: "★ Card de catálogo." },
    { id: "z600", label: "600", hex: hx("sombra", "600"), usage: "Superficie — panel sobre el fondo." },
    { id: "z500", label: "500", hex: hx("sombra", "500"), usage: "Elevada — slot sobre el lienzo." },
    { id: "z400", label: "400", hex: hx("sombra", "400"), usage: "Labels de sección — sage muted." },
    { id: "z300", label: "300", hex: hx("sombra", "300"), usage: "Texto inactivo — ítems del rail." },
  ],
}

/** @deprecated Alias — usar SOMBRA_FAMILY */
export const CENIZA_FAMILY = SOMBRA_FAMILY

/** Sotobosque · Luz filtrada — el claro para leer. */
export const BRUMA_FAMILY: NatureFamily = {
  id: "bruma",
  title: "Sotobosque · Luz filtrada",
  subtitle: "El claro para leer",
  description:
    "Luz que entra entre las hojas. Workspaces, tablas, tickets y formularios. Un solo lugar, condición de lectura. No es gris slate ni Sotobosque · Sombra.",
  steps: [
    { id: "b50", label: "50", hex: hx("bruma", "50"), usage: "★ Superficie listado — ítems del ticket." },
    { id: "b100", label: "100", hex: hx("bruma", "100"), usage: "★ Panel resumen — aside TU PEDIDO." },
    { id: "b200", label: "200", hex: hx("bruma", "200"), usage: "Divisores hairline — filas del ticket." },
    { id: "b300", label: "300", hex: hx("bruma", "300"), usage: "Bordes suaves — inputs y tabs." },
    { id: "b400", label: "400", hex: hx("bruma", "400"), usage: "Metadatos — contador de líneas." },
    { id: "b500", label: "500", hex: hx("bruma", "500"), usage: "Encabezados secundarios — TU PEDIDO." },
    { id: "b600", label: "600", hex: hx("bruma", "600"), usage: "Descripciones — hints en panel claro." },
    { id: "b700", label: "700", hex: hx("bruma", "700"), usage: "Texto empty state — títulos muted. Elevada en bruma oscura." },
    { id: "b800", label: "800", hex: hx("bruma", "800"), usage: "★ Superficie loseta — bruma oscura." },
    { id: "b900", label: "900", hex: hx("bruma", "900"), usage: "★ Texto principal — cuerpo en panel claro." },
    { id: "b950", label: "950", hex: hx("bruma", "950"), usage: "★ Lienzo bruma oscura — no es sombra-950." },
  ],
}

/** Savia — acción, foco y progreso. */
export const SAVIA_FAMILY: NatureFamily = {
  id: "savia",
  title: "Savia",
  subtitle: "Acción, foco y progreso",
  description:
    "Acción principal, foco, selección, check y progreso. Rayo 500. No pinta superficies enteras. Sobre el vivo, el texto es savia 950.",
  steps: [
    { id: "s990", label: "990", hex: hx("savia", "990"), usage: "Totales POS — cierre del gradiente." },
    { id: "s975", label: "975", hex: hx("savia", "975"), usage: "★ Totales POS — inicio del gradiente." },
    { id: "s960", label: "960", hex: hx("savia", "960"), usage: "Totales POS — centro del gradiente." },
    { id: "s950", label: "950", hex: hx("savia", "950"), usage: "Texto sobre botón + — emerald-950." },
    { id: "s900", label: "900", hex: hx("savia", "900"), usage: "Overlays oscuros — badges sobre cards." },
    { id: "s800", label: "800", hex: hx("savia", "800"), usage: "Badges pagado — texto en ticket claro." },
    { id: "s700", label: "700", hex: hx("savia", "700"), usage: "Estado active/pressed." },
    { id: "s600", label: "600", hex: hx("savia", "600"), usage: "★ CTA Vender / Confirmar venta." },
    { id: "s500", label: "500", hex: hx("savia", "500"), usage: "★ Agregar producto · CTA marketing." },
    { id: "s400", label: "400", hex: hx("savia", "400"), usage: "★ Acento rail · focus · links hero." },
    { id: "s300", label: "300", hex: hx("savia", "300"), usage: "Glow cards · descuentos en totales." },
    { id: "s200", label: "200", hex: hx("savia", "200"), usage: "Iconos toolbox · labels barra totales." },
    { id: "s100", label: "100", hex: hx("savia", "100"), usage: "Promociones rail · badges suaves ticket." },
    { id: "s50", label: "50", hex: hx("savia", "50"), usage: "Filas pagadas / highlight ticket claro." },
  ],
}

/** Composición del hero — no es una familia. Usa sombra + savia + atmósfera. */
export const ATMOSPHERE_SPEC: NatureFamily = {
  id: "atmosphere",
  title: "Atmósfera · efectos de marketing",
  subtitle: "Composición, no paleta",
  description:
    "El hero no tiene colores propios: fondo sombra 900, acentos savia 500/400, gradiente CTA savia→teal, auroras neón solo en blur. Composición de marketing — no es una cuarta familia.",
  steps: [
    { id: "a-bg", label: "Fondo", hex: hx("sombra", "900"), usage: "★ Sombra 900 — noche del parque." },
    { id: "a-s500", label: "Savia 500", hex: hx("savia", "500"), usage: "★ Acento principal — CTA y títulos." },
    { id: "a-s400", label: "Savia 400", hex: hx("savia", "400"), usage: "★ Glow y links del hero." },
    { id: "a-teal", label: "Teal", hex: hx("savia", "teal"), usage: "★ Savia teal — fin del gradiente CTA." },
    { id: "a-n1", label: "Aurora", hex: hx("atmosphere", "neon"), usage: "Atmósfera blur — nunca UI sólida." },
    { id: "a-n2", label: "Aurora 2", hex: hx("atmosphere", "neon-2"), usage: "Base del glow atmosférico." },
  ],
}

/** @deprecated Usar ATMOSPHERE_SPEC — landing no es familia de marca. */
export const LANDING_FAMILY = ATMOSPHERE_SPEC

/**
 * Tierra mojada — chrome de piso, no familia de marca.
 * Humus oliva que dialoga con sombra y savia. Footer de tablas + toolbox de operar.
 */
export const SUELO_FAMILY: NatureFamily = {
  id: "suelo",
  title: "Suelo · tierra mojada",
  subtitle: "Chrome de piso",
  description:
    "Humus oliva bajo el dosel — no el stone Tailwind ni sombra sola. El piso después de la lluvia: barro verde-oscuro, corteza húmeda y un velo de savia. Solo footer de listados y toolbox de Operar.",
  steps: [
    { id: "u950", label: "950", hex: ROOTSY_SUELO["950"], usage: "Umbral más hondo — mix con sombra-950." },
    { id: "u900", label: "900", hex: ROOTSY_SUELO["900"], usage: "★ Banda de piso — tierra empapada." },
    { id: "u800", label: "800", hex: ROOTSY_SUELO["800"], usage: "★ Piedra idle — corteza mojada." },
    { id: "u700", label: "700", hex: ROOTSY_SUELO["700"], usage: "Cara de la piedra — relieve." },
    { id: "u600", label: "600", hex: ROOTSY_SUELO["600"], usage: "Hover de slot idle." },
    { id: "u400", label: "400", hex: ROOTSY_SUELO["400"], usage: "★ Label y highlight de liquen." },
    { id: "u300", label: "300", hex: ROOTSY_SUELO["300"], usage: "Texto muted sobre el piso." },
    { id: "u50", label: "50", hex: ROOTSY_SUELO["50"], usage: "Conteo / números del footer." },
  ],
}

/** Cielo — información y contexto. */
export const CIELO_FAMILY: NatureFamily = {
  id: "cielo",
  title: "Cielo",
  subtitle: "Información y contexto",
  description:
    "Información, orientación y contexto. Es el cielo abierto del negocio, no el espacio. No es éter ni un azul de plantilla.",
  steps: [
    { id: "k800", label: "800", hex: ROOTSY_CIELO["800"], usage: "★ Texto sobre cielo 50/100." },
    { id: "k700", label: "700", hex: ROOTSY_CIELO["700"], usage: "Hover / pressed de mundo." },
    { id: "k600", label: "600", hex: ROOTSY_CIELO["600"], usage: "Acento medio." },
    { id: "k500", label: "500", hex: ROOTSY_CIELO["500"], usage: "★ Azul vivo — par complementario." },
    { id: "k400", label: "400", hex: ROOTSY_CIELO["400"], usage: "Glow e íconos." },
    { id: "k200", label: "200", hex: ROOTSY_CIELO["200"], usage: "Veladura del header." },
    { id: "k100", label: "100", hex: ROOTSY_CIELO["100"], usage: "★ Superficie de mundo enviada." },
    { id: "k50", label: "50", hex: ROOTSY_CIELO["50"], usage: "Lavado más claro." },
  ],
}

/** Sol — atención y aviso. */
export const SOL_FAMILY: NatureFamily = {
  id: "sol",
  title: "Sol",
  subtitle: "Atención y aviso",
  description:
    "Atención, aviso y algo que requiere mirada. Calor vivo, no otoño ni plantilla de warning. No es lava.",
  steps: [
    { id: "o800", label: "800", hex: ROOTSY_SOL["800"], usage: "★ Texto sobre sol 50/100." },
    { id: "o700", label: "700", hex: ROOTSY_SOL["700"], usage: "Hover de mundo." },
    { id: "o600", label: "600", hex: ROOTSY_SOL["600"], usage: "Acento medio." },
    { id: "o500", label: "500", hex: ROOTSY_SOL["500"], usage: "★ Sol — par complementario." },
    { id: "o400", label: "400", hex: ROOTSY_SOL["400"], usage: "Glow e íconos." },
    { id: "o200", label: "200", hex: ROOTSY_SOL["200"], usage: "Veladura del header." },
    { id: "o100", label: "100", hex: ROOTSY_SOL["100"], usage: "★ Superficie de mundo preparando." },
    { id: "o50", label: "50", hex: ROOTSY_SOL["50"], usage: "Lavado más claro." },
  ],
}

/** Éter — el afuera del planeta. */
export const ETER_FAMILY: NatureFamily = {
  id: "eter",
  title: "Éter",
  subtitle: "El afuera del planeta",
  description:
    "Rampa neutra para lo que se toca: texto, borde, botón, dropdown. El aire del fondo — home y headers — usa el clima (glow / void), no esta rampa. El clima no es cielo.",
  steps: [
    { id: "t950", label: "950", hex: ROOTSY_ETER["950"], usage: "★ Fondo de chrome. El cierre del mundo es void-950." },
    { id: "t900", label: "900", hex: ROOTSY_ETER["900"], usage: "★ Elevada / menú." },
    { id: "t800", label: "800", hex: ROOTSY_ETER["800"], usage: "★ Superficie de control." },
    { id: "t700", label: "700", hex: ROOTSY_ETER["700"], usage: "Borde y popover." },
    { id: "t200", label: "200", hex: ROOTSY_ETER["200"], usage: "Muted de chrome." },
    { id: "t100", label: "100", hex: ROOTSY_ETER["100"], usage: "★ Hairline de controles — gris, no cian." },
  ],
}

/** Lava — riesgo y lo que no se deshace. */
export const LAVA_FAMILY: NatureFamily = {
  id: "lava",
  title: "Lava",
  subtitle: "Riesgo y lo que no se deshace",
  description:
    "Riesgo, error, bloqueo y acción destructiva. Tiene calor de volcán, no el rojo de un dashboard. No es sol.",
  steps: [
    { id: "l950", label: "950", hex: ROOTSY_LAVA["950"], usage: "Texto sobre Lava vivo." },
    { id: "l800", label: "800", hex: ROOTSY_LAVA["800"], usage: "Texto profundo sobre tint si el 700 no alcanza." },
    { id: "l700", label: "700", hex: ROOTSY_LAVA["700"], usage: "Profundo — texto y links sobre Luz filtrada." },
    { id: "l600", label: "600", hex: ROOTSY_LAVA["600"], usage: "Hover del vivo." },
    { id: "l500", label: "500", hex: ROOTSY_LAVA["500"], usage: "★ Vivo — relleno de riesgo y crítico." },
    { id: "l200", label: "200", hex: ROOTSY_LAVA["200"], usage: "Borde suave de alerta." },
    { id: "l100", label: "100", hex: ROOTSY_LAVA["100"], usage: "Banner y fila de riesgo." },
    { id: "l50", label: "50", hex: ROOTSY_LAVA["50"], usage: "Fondo de error suave." },
  ],
}

export const COLOR_NEW_ATMOSPHERES: NatureFamily[] = [
  ETER_FAMILY,
  BRUMA_FAMILY,
  SOMBRA_FAMILY,
]

export const COLOR_NEW_FUNCTIONALS: NatureFamily[] = [
  SAVIA_FAMILY,
  CIELO_FAMILY,
  SOL_FAMILY,
  LAVA_FAMILY,
]

/** Paletas del grupo Color — atmósferas y funcionales. */
export const COLOR_NEW_FAMILIES: NatureFamily[] = [
  ...COLOR_NEW_ATMOSPHERES,
  ...COLOR_NEW_FUNCTIONALS,
]

export const COLOR_NEW_GRADIENTS: NatureGradient[] = [
  {
    id: "marketing-aurora",
    title: "Aurora del hero",
    description: "Neón verde desde la base — atmósfera blur de marketing.",
    from: hx("atmosphere", "neon"),
    via: hx("atmosphere", "neon-2"),
    to: hx("savia", "400"),
  },
  {
    id: "marketing-cta",
    title: "CTA marketing",
    description: "Savia 500 a teal — botón principal del hero.",
    from: hx("savia", "500"),
    to: hx("savia", "teal"),
  },
  {
    id: "pos-totals",
    title: "Totales del mostrador",
    description: "Savia profunda bajo la barra de cobro — glow emerald bajo el dosel.",
    from: hx("savia", "975"),
    via: hx("savia", "960"),
    to: hx("savia", "990"),
  },
  {
    id: "pos-floor",
    title: "Mostrador operativo",
    description: "Sombra del catálogo abriendo a bruma del ticket — contraste natural del POS.",
    from: hx("sombra", "950"),
    via: hx("sombra", "600"),
    to: hx("bruma", "100"),
  },
  {
    id: "suelo-mojado",
    title: "Tierra mojada",
    description: "Humus oliva bajo el dosel — humedad savia en el umbral. Chrome de footer y toolbox.",
    from: ROOTSY_SUELO["900"],
    via: ROOTSY_SUELO["800"],
    to: hx("savia", "990"),
  },
  {
    id: "clima-comandas",
    title: "Mundos de comanda",
    description: "Cielo vivo a sol a savia — enviada, preparando, lista.",
    from: ROOTSY_CIELO["500"],
    via: ROOTSY_SOL["500"],
    to: hx("savia", "500"),
  },
  {
    id: "eter-header",
    title: "Éter del header",
    description: "Paint del vacío — éter-void 800 a 950. No pinta botones.",
    from: ROOTSY_ETER_CLIMA.void["800"],
    via: ROOTSY_ETER_CLIMA.void["900"],
    to: ROOTSY_ETER_CLIMA.void["950"],
  },
]

