import type { OperationSaleChannel } from "@/app/[siteId]/[popId]/operations/actions"
import { popDateTimeIntlOptions } from "@/lib/popTimezone"
export function operationSaleDetailTitle(channel: OperationSaleChannel): string {
  switch (channel) {
    case "table":
      return "Detalle de mesa"
    case "counter":
      return "Detalle de mostrador"
    default:
      return "Detalle de venta"
  }
}

export function resolveOperationSaleChannel(input: {
  saleChannel?: OperationSaleChannel | null
  tableSessionId?: string | null
  counterOrderId?: string | null
}): OperationSaleChannel {
  if (input.saleChannel === "table" || input.saleChannel === "counter") {
    return input.saleChannel
  }
  if (input.tableSessionId) return "table"
  if (input.counterOrderId) return "counter"
  return "pos"
}

export function formatOperationDetailTimestamp(
  iso: string | null | undefined,
  timeZone?: string,
): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  return new Intl.DateTimeFormat("es-AR", popDateTimeIntlOptions(timeZone)).format(
    date,
  )
}

export function formatOperationDetailMoment(
  iso: string | null | undefined,
  userName: string | null | undefined,
  timeZone?: string,
): string {
  const when = formatOperationDetailTimestamp(iso, timeZone)
  const who = userName?.trim()
  if (who && when !== "—") return `${when} · ${who}`
  if (who) return who
  return when
}

export function counterFulfillmentTypeLabel(
  value: "pickup" | "delivery" | null | undefined,
): string {
  if (value === "delivery") return "Delivery"
  if (value === "pickup") return "Mostrador"
  return "—"
}
