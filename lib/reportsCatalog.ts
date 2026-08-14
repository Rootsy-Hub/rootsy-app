import { popScopedHref } from "@/lib/popRoutes"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  BookOpen,
  Calculator,
  FileBarChart,
  Landmark,
  PieChart,
  Receipt,
  Scale,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Waves,
} from "lucide-react"

export type ReportCatalogCategoryId =
  | "fiscal"
  | "gestion"
  | "control"
  | "config"

export type ReportCatalogItem = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  /** Ruta relativa al POP (sin leading slash). */
  path: string
  /** Query extra (p. ej. foco en contabilidad u operaciones). */
  query?: Record<string, string>
}

export type ReportCatalogCategory = {
  id: ReportCatalogCategoryId
  title: string
  summary: string
  items: ReportCatalogItem[]
}

export const REPORT_CATALOG: ReportCatalogCategory[] = [
  {
    id: "fiscal",
    title: "Fiscal",
    summary: "Base para impuestos, IVA y declaraciones con tu contador.",
    items: [
      {
        id: "vat-position",
        title: "Posición IVA",
        description: "Saldo de IVA débito y crédito del período.",
        icon: Receipt,
        path: "accounting",
        query: { focus: "vat" },
      },
      {
        id: "sales-detail",
        title: "Detalle de ventas",
        description: "Facturación y cobros por canal y comprobante.",
        icon: FileBarChart,
        path: "operations",
        query: { view: "sales" },
      },
      {
        id: "purchases-expenses",
        title: "Compras y gastos",
        description: "Egresos con impacto fiscal y crédito de IVA.",
        icon: Wallet,
        path: "operations",
        query: { view: "purchases" },
      },
      {
        id: "invoices",
        title: "Facturas emitidas",
        description: "Comprobantes fiscales registrados en el POP.",
        icon: FileBarChart,
        path: "invoices",
      },
    ],
  },
  {
    id: "gestion",
    title: "Gestión",
    summary: "Para saber si ganás, cuánto vendiste y cómo está el negocio.",
    items: [
      {
        id: "income-statement",
        title: "Estado de resultados",
        description: "Ingresos, costos, gastos y resultado del período.",
        icon: TrendingUp,
        path: "accounting",
        query: { focus: "income_statement" },
      },
      {
        id: "balance-sheet",
        title: "Balance general",
        description: "Activos, pasivos y patrimonio neto.",
        icon: Scale,
        path: "accounting",
        query: { focus: "balance_sheet" },
      },
      {
        id: "cash-flow",
        title: "Flujo de caja",
        description: "Movimiento de efectivo y cuentas equivalentes.",
        icon: Waves,
        path: "accounting",
        query: { focus: "cash_flow" },
      },
      {
        id: "summaries",
        title: "Resúmenes por rubro",
        description: "Totales agrupados por tipo de cuenta.",
        icon: PieChart,
        path: "accounting",
        query: { focus: "summaries" },
      },
    ],
  },
  {
    id: "control",
    title: "Control",
    summary: "Revisá que todo cuadre antes de cerrar el mes.",
    items: [
      {
        id: "trial-balance",
        title: "Sumas y saldos",
        description: "Debe, haber y saldo por cuenta contable.",
        icon: Calculator,
        path: "accounting",
        query: { focus: "trial_balance" },
      },
      {
        id: "journal",
        title: "Libro diario",
        description: "Asientos cronológicos con origen de cada movimiento.",
        icon: ScrollText,
        path: "accounting",
        query: { focus: "journal" },
      },
      {
        id: "ledger",
        title: "Mayor general",
        description: "Movimientos detallados de una cuenta.",
        icon: BookOpen,
        path: "accounting",
        query: { focus: "ledger" },
      },
      {
        id: "cash-registers",
        title: "Arqueo de caja",
        description: "Conciliación de caja y cierres del período.",
        icon: Landmark,
        path: "cash-registers",
      },
      {
        id: "treasury",
        title: "Cuentas y tesorería",
        description: "Saldos operativos de caja, banco y medios de cobro.",
        icon: ArrowLeftRight,
        path: "accounts",
      },
    ],
  },
  {
    id: "config",
    title: "Configuración",
    summary: "Estructura contable base del punto de venta.",
    items: [
      {
        id: "chart-of-accounts",
        title: "Plan de cuentas",
        description: "Rubros y cuentas imputables del negocio.",
        icon: ShieldCheck,
        path: "accounting",
        query: { focus: "chart" },
      },
    ],
  },
]

export function buildReportHref(
  siteId: string,
  popId: string,
  item: ReportCatalogItem,
  bounds: { from: string | null; to: string | null },
): string {
  const params = new URLSearchParams()
  if (bounds.from) params.set("from", bounds.from)
  if (bounds.to) params.set("to", bounds.to)
  if (item.query) {
    for (const [key, value] of Object.entries(item.query)) {
      params.set(key, value)
    }
  }
  const base = popScopedHref(siteId, popId, item.path)
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

/** Reportes que abren detalle inline en /reports (sin navegar a otra ruta). */
export const REPORT_INLINE_DETAIL_IDS = new Set<string>([
  "vat-position",
  "sales-detail",
])

export function supportsInlineReportDetail(reportId: string): boolean {
  return REPORT_INLINE_DETAIL_IDS.has(reportId)
}

export function findReportCatalogItem(reportId: string): ReportCatalogItem | undefined {
  for (const category of REPORT_CATALOG) {
    const match = category.items.find((item) => item.id === reportId)
    if (match) return match
  }
  return undefined
}
