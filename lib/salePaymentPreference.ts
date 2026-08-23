import type { SaleCatalogPaymentOption } from "@/app/[siteId]/[popId]/sale/actions"
import {
  isValidOperationPaymentKind,
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"

const STORAGE_PREFIX = "rootsy:sale-payment-default:"

export type SavedSalePayment =
  | { mode: "client_account" }
  | {
      mode: "method"
      kind: OperationPaymentKind
      treasuryAccountId: string
      label: string
    }

function isSavedSalePayment(value: unknown): value is SavedSalePayment {
  if (value == null || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  if (row.mode === "client_account") return true
  return (
    row.mode === "method" &&
    typeof row.kind === "string" &&
    isValidOperationPaymentKind(row.kind) &&
    typeof row.treasuryAccountId === "string" &&
    row.treasuryAccountId.length > 0 &&
    typeof row.label === "string"
  )
}

export function readSavedSalePayment(
  popId: string,
): SavedSalePayment | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return isSavedSalePayment(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

export function writeSavedSalePayment(
  popId: string,
  value: SavedSalePayment,
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${popId}`, JSON.stringify(value))
  } catch {
    /* quota / private mode */
  }
}

export function savedSalePaymentToOption(
  saved: SavedSalePayment | undefined,
): SaleCatalogPaymentOption | null {
  if (!saved || saved.mode !== "method") return null
  return {
    kind: saved.kind,
    treasuryAccountId: saved.treasuryAccountId,
    label: saved.label || operationPaymentKindLabel(saved.kind),
  }
}

export function salePaymentToSaved(
  option: SaleCatalogPaymentOption,
): SavedSalePayment {
  return {
    mode: "method",
    kind: option.kind,
    treasuryAccountId: option.treasuryAccountId,
    label: option.label,
  }
}
