import type { RootsNaturePillVariant } from "@/components/rootsy-pill/rootsyNaturePillStyles"

export const INVOICE_TABLE_PAGE_SIZES = [10, 25, 50, 100] as const

export type InvoiceTablePageSize = (typeof INVOICE_TABLE_PAGE_SIZES)[number]

export const DEFAULT_INVOICE_TABLE_PAGE_SIZE: InvoiceTablePageSize = 25

export const INVOICE_STATUS_VALUES = [
  "draft",
  "pending_afip",
  "authorized",
  "rejected",
  "cancelled",
] as const

export type InvoiceStatusValue = (typeof INVOICE_STATUS_VALUES)[number]

export const INVOICE_REGIMEN_VALUES = ["fe_general", "fce_mipyme"] as const

export type InvoiceRegimenValue = (typeof INVOICE_REGIMEN_VALUES)[number]

export function isInvoiceStatusValue(v: string): v is InvoiceStatusValue {
  return (INVOICE_STATUS_VALUES as readonly string[]).includes(v)
}

export function isInvoiceRegimenValue(v: string): v is InvoiceRegimenValue {
  return (INVOICE_REGIMEN_VALUES as readonly string[]).includes(v)
}

export const invoiceMoneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function formatInvoiceCbteFch(s: string) {
  if (!s) return "—"
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4)
    const m = s.slice(4, 6)
    const d = s.slice(6, 8)
    return `${d}/${m}/${y}`
  }
  const date = new Date(s)
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(date)
  }
  return s
}

export const INVOICE_REGIMEN_LABEL: Record<string, string> = {
  fe_general: "FE general",
  fce_mipyme: "FCE MiPyME",
}

export function invoiceRegimenLabel(value: string) {
  return INVOICE_REGIMEN_LABEL[value] ?? value
}

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  pending_afip: "Pendiente AFIP",
  authorized: "Autorizada",
  rejected: "Rechazada",
  cancelled: "Anulada",
}

export function invoiceStatusLabel(status: string) {
  return INVOICE_STATUS_LABEL[status] ?? status
}

export function invoiceStatusPillVariant(
  status: string,
): RootsNaturePillVariant {
  if (status === "authorized") return "canopy"
  if (status === "rejected" || status === "cancelled") return "earthMuted"
  if (status === "pending_afip") return "earth"
  return "autumn"
}

export function invoiceJsonPretty(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return String(value)
  }
}

export function invoiceShortId(id: string | null) {
  if (!id) return "—"
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}
