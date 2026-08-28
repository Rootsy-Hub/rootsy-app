"use client"

import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import type { MenuCatalogCategorySection } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { OperarSectionRail } from "@/components/layouts-module/OperarSectionRail"
import type { SaleCatalogViewPersisted } from "@/lib/saleCatalogPreference"

type Props = {
  categories: SaleCatalogCategory[]
  categorySections?: MenuCatalogCategorySection[]
  vistaCatalogo: SaleCatalogViewPersisted
  onVistaChange: (view: SaleCatalogViewPersisted) => void
  /** Ítems más grandes para el desplegable mobile. */
  density?: "default" | "comfortable"
}

export function SaleCatalogSidebarNav({
  categories,
  categorySections,
  vistaCatalogo,
  onVistaChange,
  density = "default",
}: Props) {
  const groups = categorySections?.length
    ? categorySections.map((section) => ({
        id: section.id,
        label: section.label,
        items: section.categories.map((cat) => ({
          id: `${section.id}:${cat.id}`,
          label: cat.name,
        })),
      }))
    : undefined

  const items = groups
    ? undefined
    : categories.map((cat) => ({
        id: cat.name,
        label: cat.name,
      }))

  const activeId =
    vistaCatalogo.modo === "categoria" ? vistaCatalogo.categoria : ""

  return (
    <OperarSectionRail
      ariaLabel="Filtros del catálogo"
      activeId={activeId}
      density={density}
      groups={groups}
      items={items}
      onSelect={(id) => onVistaChange({ modo: "categoria", categoria: id })}
    />
  )
}
