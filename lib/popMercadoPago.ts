import { resolveTreasuryAccountBrand } from "@/lib/treasuryAccountBrands"
import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import type { RootsNaturePillVariant } from "@/components/rootsy-pill/rootsyNaturePillStyles"

export const POP_MERCADOPAGO_CONNECTION_STATUSES = [
  "disconnected",
  "connected",
  "expired",
] as const

export type PopMercadoPagoConnectionStatus =
  (typeof POP_MERCADOPAGO_CONNECTION_STATUSES)[number]

export const POP_MERCADOPAGO_CONNECTION_STATUS_LABELS: Record<
  PopMercadoPagoConnectionStatus,
  string
> = {
  disconnected: "No conectada",
  connected: "Conectada",
  expired: "Venció la autorización",
}

export type PopMercadoPagoConnectionPublic = {
  id: string
  treasuryAccountId: string
  status: PopMercadoPagoConnectionStatus
  mpUserId: string | null
  mpEmail: string | null
  connectedAt: string | null
  disconnectedAt: string | null
}

export function isPopMercadoPagoConnectionStatus(
  value: string,
): value is PopMercadoPagoConnectionStatus {
  return POP_MERCADOPAGO_CONNECTION_STATUSES.some((status) => status === value)
}

export function treasuryAccountOffersMercadoPagoConnection(account: {
  kind: TreasuryAccountKind
  brandKey?: string | null
  name?: string
}): boolean {
  if (account.kind !== "wallet") return false
  return (
    resolveTreasuryAccountBrand({
      kind: account.kind,
      brandKey: account.brandKey,
      name: account.name,
    })?.key === "mercadopago"
  )
}

export function popMercadoPagoConnectionStatusLabel(
  status: PopMercadoPagoConnectionStatus,
): string {
  return POP_MERCADOPAGO_CONNECTION_STATUS_LABELS[status]
}

export function popMercadoPagoConnectionPillVariant(
  status: PopMercadoPagoConnectionStatus,
): RootsNaturePillVariant {
  if (status === "connected") return "savia"
  if (status === "expired") return "danger"
  return "brumaMuted"
}

export function resolvePopMercadoPagoConnectionStatus(
  connection: PopMercadoPagoConnectionPublic | null,
): PopMercadoPagoConnectionStatus {
  return connection?.status ?? "disconnected"
}
