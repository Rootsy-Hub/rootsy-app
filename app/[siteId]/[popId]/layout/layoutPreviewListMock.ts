export type LayoutPreviewListStatus = "activo" | "pendiente" | "vencido"

export type LayoutPreviewListRow = {
  id: string
  title: string
  subtitle?: string
  imageSeed: string
  /** Tabla / entidad a la que apunta el vínculo (solo demo). */
  refTable: string
  /** Código legible tipo FK / número de documento. */
  refCode: string
  /** Ruta relativa de ejemplo hacia otra sección del POP. */
  refHref: string
  /** Fecha de emisión (demo, ISO yyyy-mm-dd). */
  issuedAt: string
  amountArs: number
  attachments: number
  status: LayoutPreviewListStatus
}

type LayoutPreviewRowTemplate = Omit<LayoutPreviewListRow, "issuedAt">

const LAYOUT_PREVIEW_ROW_TEMPLATE: LayoutPreviewRowTemplate[] = [
  {
    id: "r1",
    title: "Yerba mate 1 kg cónico",
    subtitle: "SKU: YER-001",
    imageSeed: "yerba-a",
    refTable: "Proveedores",
    refCode: "PRV-7781",
    refHref: "suppliers",
    amountArs: 18420,
    attachments: 2,
    status: "activo",
  },
  {
    id: "r2",
    title: "Leche entera sachet 1L",
    subtitle: "Lote interno 44-B",
    imageSeed: "leche",
    refTable: "Facturas",
    refCode: "FC-A-2400312",
    refHref: "invoices",
    amountArs: 8920,
    attachments: 0,
    status: "pendiente",
  },
  {
    id: "r3",
    title: "Servicio de mantenimiento freezer",
    subtitle: "Contrato trimestral",
    imageSeed: "svc",
    refTable: "Órdenes",
    refCode: "ORD-9921",
    refHref: "operations",
    amountArs: 45000,
    attachments: 5,
    status: "activo",
  },
  {
    id: "r4",
    title: "Pan integral x kg",
    imageSeed: "pan",
    refTable: "Clientes",
    refCode: "CLI-4402",
    refHref: "clients",
    amountArs: 3280,
    attachments: 1,
    status: "activo",
  },
  {
    id: "r5",
    title: "Aceite girasol 900 ml",
    imageSeed: "aceite",
    refTable: "Proveedores",
    refCode: "PRV-2201",
    refHref: "suppliers",
    amountArs: 15600,
    attachments: 0,
    status: "vencido",
  },
  {
    id: "r6",
    title: "Papas fritas bolsa 200 g",
    imageSeed: "papas",
    refTable: "Facturas",
    refCode: "FC-B-2400440",
    refHref: "invoices",
    amountArs: 7140,
    attachments: 3,
    status: "pendiente",
  },
  {
    id: "r7",
    title: "Coca Cola 2,25 L retornable",
    imageSeed: "cola",
    refTable: "Órdenes",
    refCode: "ORD-10044",
    refHref: "operations",
    amountArs: 22100,
    attachments: 1,
    status: "activo",
  },
  {
    id: "r8",
    title: "Descuento promoción verano",
    subtitle: "Ajuste manual",
    imageSeed: "promo",
    refTable: "Clientes",
    refCode: "CLI-9910",
    refHref: "clients",
    amountArs: -4200,
    attachments: 0,
    status: "activo",
  },
  {
    id: "r9",
    title: "Harina 000 5 kg",
    imageSeed: "harina",
    refTable: "Proveedores",
    refCode: "PRV-6602",
    refHref: "suppliers",
    amountArs: 28990,
    attachments: 4,
    status: "activo",
  },
  {
    id: "r10",
    title: "Servicio delivery zona norte",
    imageSeed: "delivery",
    refTable: "Facturas",
    refCode: "FC-A-2400518",
    refHref: "invoices",
    amountArs: 12500,
    attachments: 2,
    status: "pendiente",
  },
  {
    id: "r11",
    title: "Sal fina 500 g",
    imageSeed: "sal",
    refTable: "Órdenes",
    refCode: "ORD-10102",
    refHref: "operations",
    amountArs: 980,
    attachments: 0,
    status: "activo",
  },
  {
    id: "r12",
    title: "Papel higiénico pack x4",
    imageSeed: "papel",
    refTable: "Clientes",
    refCode: "CLI-2201",
    refHref: "clients",
    amountArs: 6540,
    attachments: 1,
    status: "vencido",
  },
  {
    id: "r13",
    title: "Café molido 250 g",
    imageSeed: "cafe",
    refTable: "Proveedores",
    refCode: "PRV-9011",
    refHref: "suppliers",
    amountArs: 11200,
    attachments: 2,
    status: "activo",
  },
  {
    id: "r14",
    title: "Agua mineral 2 L x6",
    imageSeed: "agua",
    refTable: "Facturas",
    refCode: "FC-B-2400601",
    refHref: "invoices",
    amountArs: 18900,
    attachments: 6,
    status: "pendiente",
  },
  {
    id: "r15",
    title: "Galletitas surtido 400 g",
    imageSeed: "galletas",
    refTable: "Órdenes",
    refCode: "ORD-10188",
    refHref: "operations",
    amountArs: 4320,
    attachments: 0,
    status: "activo",
  },
  {
    id: "r16",
    title: "Limpieza vereda (servicio)",
    imageSeed: "limp",
    refTable: "Clientes",
    refCode: "CLI-7780",
    refHref: "clients",
    amountArs: 28000,
    attachments: 3,
    status: "activo",
  },
  {
    id: "r17",
    title: "Yogur firme 190 g x6",
    imageSeed: "yogur",
    refTable: "Proveedores",
    refCode: "PRV-3340",
    refHref: "suppliers",
    amountArs: 7640,
    attachments: 1,
    status: "pendiente",
  },
  {
    id: "r18",
    title: "Cierre caja chica #12",
    subtitle: "Ajuste administrativo",
    imageSeed: "caja",
    refTable: "Facturas",
    refCode: "FC-A-2400722",
    refHref: "invoices",
    amountArs: 500,
    attachments: 8,
    status: "activo",
  },
]

export const LAYOUT_PREVIEW_PAGE_SIZE = 20

/** Valores permitidos para el selector “por página” en la vista previa de listado. */
export const LAYOUT_PREVIEW_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

/** Total “lógico” para la demo (p. ej. >1000); las filas se derivan con `layoutPreviewRowAt`. */
export const LAYOUT_PREVIEW_TOTAL_COUNT = 1248

export const LAYOUT_PREVIEW_REF_TABLE_OPTIONS = [
  "Proveedores",
  "Facturas",
  "Órdenes",
  "Clientes",
] as const

export function layoutPreviewRowAt(index0: number): LayoutPreviewListRow {
  const tpl = LAYOUT_PREVIEW_ROW_TEMPLATE
  const b = tpl[index0 % tpl.length]!
  const block = Math.floor(index0 / tpl.length) + 1
  const n = index0 + 1
  const issued = new Date(Date.UTC(2024, index0 % 12, 1 + (index0 % 27)))
  return {
    ...b,
    id: `row-${n}`,
    title: block === 1 ? b.title : `${b.title} (${block})`,
    refCode: `${b.refCode}·${n}`,
    issuedAt: issued.toISOString().slice(0, 10),
  }
}
