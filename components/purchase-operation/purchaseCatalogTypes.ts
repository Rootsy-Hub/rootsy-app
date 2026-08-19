import type { PurchaseCatalogArticleCost } from "@/app/[siteId]/[popId]/purchases/actions"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"

export type PurchaseCatalogProduct = {
  id: string
  nombre: string
  descripcion: string
  iva: number
  categoria: string
  /** Clave de filtro sidebar: `{itemKind}:{categoryId}` */
  categoriaFiltro: string
  imagen: string
  unitOfMeasure: string
  costs: PurchaseCatalogArticleCost[]
}

export type PurchaseCatalogView = { modo: "categoria"; categoria: string }

export function purchaseCatalogCostHint(producto: PurchaseCatalogProduct): string {
  const active = producto.costs.filter((c) => c.unitPrice > 0)
  if (producto.costs.length === 0) return "Sin costos"
  if (active.length === 0) {
    return `${producto.costs.length} costo${producto.costs.length === 1 ? "" : "s"}`
  }
  const min = Math.min(...active.map((c) => c.unitPrice))
  if (producto.costs.length === 1) {
    const cost = producto.costs[0]
    return `${saleOpFmt.format(min)} / ${cost.costUnitLabel}`
  }
  return `Desde ${saleOpFmt.format(min)}`
}
