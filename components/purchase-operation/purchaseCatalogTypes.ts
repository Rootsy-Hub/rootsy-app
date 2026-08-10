import type { PurchaseCatalogArticleCost } from "@/app/[siteId]/[popId]/purchases/actions"

export type PurchaseCatalogProduct = {
  id: string
  nombre: string
  descripcion: string
  iva: number
  categoria: string
  imagen: string
  unitOfMeasure: string
  costs: PurchaseCatalogArticleCost[]
}

export type PurchaseCatalogView = { modo: "categoria"; categoria: string }

export const PURCHASE_CATEGORIA_TODOS = "Todos"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export function purchaseCatalogCostHint(producto: PurchaseCatalogProduct): string {
  const active = producto.costs.filter((c) => c.unitPrice > 0)
  if (producto.costs.length === 0) return "Sin costos"
  if (active.length === 0) {
    return `${producto.costs.length} costo${producto.costs.length === 1 ? "" : "s"}`
  }
  const min = Math.min(...active.map((c) => c.unitPrice))
  if (producto.costs.length === 1) {
    const cost = producto.costs[0]
    return `${fmt.format(min)} / ${cost.costUnitLabel}`
  }
  return `Desde ${fmt.format(min)}`
}
