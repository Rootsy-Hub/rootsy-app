import { shortUnitOfMeasure } from "@/lib/articleItemKind"
import type { InventoryAttention } from "@/lib/inventory/inventoryStockLevels"

export const INVENTORY_MOVEMENT_LABELS: Record<string, string> = {
  sale: "Venta",
  purchase_receipt: "Compra / ingreso",
  adjustment: "Ajuste",
  manufacturing_consume: "Fabricar · insumos",
  manufacturing_output: "Fabricar · producto",
  return_customer: "Devolución cliente",
  return_supplier: "Devolución proveedor",
  transfer_in: "Transferencia entrada",
  transfer_out: "Transferencia salida",
  initial: "Saldo inicial",
}

export function formatInventoryQty(n: number) {
  const t = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(t)) return t.toLocaleString("es-AR")
  return t.toLocaleString("es-AR", { maximumFractionDigits: 6 })
}

export function formatInventoryQtyWithUnit(
  n: number,
  unitOfMeasure?: string | null,
) {
  const qty = formatInventoryQty(n)
  const unit = shortUnitOfMeasure(unitOfMeasure)
  return unit ? `${qty} ${unit}` : qty
}

export function formatInventoryMoney(n: number) {
  const t = Math.round(n * 1e4) / 1e4
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(t)
}

export function formatInventoryMoneyShort(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) {
    return `$${(n / 1_000_000).toLocaleString("es-AR", {
      maximumFractionDigits: 1,
    })} M`
  }
  if (abs >= 10_000) {
    return `$${Math.round(n).toLocaleString("es-AR")}`
  }
  return formatInventoryMoney(n)
}

export function shortInventoryUserId(id: string | null) {
  if (!id) return "—"
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}

export function shortInventoryUuid(id: string) {
  if (!id) return "—"
  return id.length > 12 ? `${id.slice(0, 8)}…` : id
}

export function inventoryAttentionLabel(attention: InventoryAttention) {
  if (attention === "negative") return "En negativo"
  if (attention === "empty") return "Sin stock"
  if (attention === "below_min") return "Bajo el mínimo"
  if (attention === "overstock") return "Sobre stock"
  return "En orden"
}
