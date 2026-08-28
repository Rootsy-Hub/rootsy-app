"use client"

import type { PurchaseCatalogCategorySection } from "@/app/[siteId]/[popId]/purchases/actions"
import { OperarSectionRail } from "@/components/layouts-module/OperarSectionRail"
import type { PurchaseCatalogView } from "@/components/purchase-operation/purchaseCatalogTypes"

type Props = {
  categorySections: readonly PurchaseCatalogCategorySection[]
  vistaCatalogo: PurchaseCatalogView
  onVistaChange: (view: PurchaseCatalogView) => void
}

export function PurchaseCatalogSidebarNav({
  categorySections,
  vistaCatalogo,
  onVistaChange,
}: Props) {
  return (
    <OperarSectionRail
      ariaLabel="Filtros del catálogo"
      activeId={vistaCatalogo.categoria}
      onSelect={(id) => onVistaChange({ modo: "categoria", categoria: id })}
      groups={categorySections.map((section) => ({
        id: section.id,
        label: section.label,
        items: section.categories.map((cat) => ({
          id: `${section.id}:${cat.id}`,
          label: cat.name,
        })),
      }))}
    />
  )
}
