"use client"

import "@/app/[siteId]/[popId]/library/layouts/layoutsOperarTheme.css"
import "@/app/[siteId]/[popId]/library/radius/rootsyRadiusSystem.css"
import {
  getLayoutsOperarGridCssVariables,
  layoutsOperarCatalogRailProposalItemClass,
  layoutsOperarCatalogRailProposalItemDiscountSelectedClass,
  layoutsOperarCatalogRailProposalItemPromoSelectedClass,
  layoutsOperarCatalogRailProposalItemSelectedClass,
  layoutsOperarCatalogRailProposalItemWithIconClass,
  layoutsOperarCatalogRailProposalListClass,
  layoutsOperarCatalogRailProposalListItemClass,
  layoutsOperarCatalogRailProposalNavClass,
  layoutsOperarCatalogRailProposalSectionLabelClass,
  type LayoutsOperarCatalogRailProposalId,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperarBodyScopeClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarOpenClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { LAYOUTS_OPERAR_DEFAULT_CATALOG_RAIL_PROPOSAL } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
import { cn } from "@/lib/utils"
import { Percent, Tag } from "lucide-react"
import { useState } from "react"

export const LAYOUTS_OPERAR_DEMO_CATALOG_CATEGORIES = [
  "Bebidas",
  "Panadería",
  "Lácteos",
  "Fiambres",
  "Verdulería",
  "Almacén",
] as const

type DemoCatalogView =
  | { modo: "categoria"; categoria: string }
  | { modo: "promociones" }
  | { modo: "con_descuento" }

const DEMO_CATALOG_VIEW_DEFAULT: DemoCatalogView = {
  modo: "categoria",
  categoria: "Todos",
}

export function LayoutsOperarCatalogRailDemoShell({
  children,
  heightClass = "h-[28rem]",
  className,
}: {
  children: React.ReactNode
  heightClass?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70",
        heightClass,
        className,
      )}
    >
      <div
        className={cn(
          "rootsy-theme-pos rootsy-radius-system h-full bg-[var(--rootsy-sombra-950)]",
          layoutsOperarBodyScopeClass,
        )}
        style={getLayoutsOperarGridCssVariables()}
      >
        <aside
          className={cn(
            layoutsOperarCatalogSidebarClass,
            layoutsOperarCatalogSidebarOpenClass,
            "h-full border-r-0",
          )}
        >
          {children}
        </aside>
      </div>
    </div>
  )
}

export function LayoutsOperarCatalogRailProposal({
  proposalId = LAYOUTS_OPERAR_DEFAULT_CATALOG_RAIL_PROPOSAL,
}: {
  proposalId?: LayoutsOperarCatalogRailProposalId
}) {
  const [vistaCatalogo, setVistaCatalogo] = useState<DemoCatalogView>(DEMO_CATALOG_VIEW_DEFAULT)

  return (
    <nav
      className={layoutsOperarCatalogRailProposalNavClass(proposalId)}
      aria-label="Filtros del catálogo"
    >
      <div>
        <p className={layoutsOperarCatalogRailProposalSectionLabelClass(proposalId)}>Categorías</p>
        <ul className={layoutsOperarCatalogRailProposalListClass(proposalId)} role="list">
          <li className={layoutsOperarCatalogRailProposalListItemClass(proposalId)}>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              aria-pressed={
                vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === "Todos"
              }
              onClick={() => setVistaCatalogo({ modo: "categoria", categoria: "Todos" })}
              className={cn(
                layoutsOperarCatalogRailProposalItemClass(proposalId),
                vistaCatalogo.modo === "categoria" &&
                  vistaCatalogo.categoria === "Todos" &&
                  layoutsOperarCatalogRailProposalItemSelectedClass(proposalId),
              )}
            >
              Todos
            </button>
          </li>
          {LAYOUTS_OPERAR_DEMO_CATALOG_CATEGORIES.map((name) => {
            const seleccionado =
              vistaCatalogo.modo === "categoria" && vistaCatalogo.categoria === name
            return (
              <li key={name} className={layoutsOperarCatalogRailProposalListItemClass(proposalId)}>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  aria-pressed={seleccionado}
                  onClick={() => setVistaCatalogo({ modo: "categoria", categoria: name })}
                  className={cn(
                    layoutsOperarCatalogRailProposalItemClass(proposalId),
                    seleccionado && layoutsOperarCatalogRailProposalItemSelectedClass(proposalId),
                  )}
                >
                  {name}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <p className={layoutsOperarCatalogRailProposalSectionLabelClass(proposalId)}>
          Listados rápidos
        </p>
        <ul className={layoutsOperarCatalogRailProposalListClass(proposalId)} role="list">
          <li className={layoutsOperarCatalogRailProposalListItemClass(proposalId)}>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              aria-pressed={vistaCatalogo.modo === "promociones"}
              onClick={() => setVistaCatalogo({ modo: "promociones" })}
              className={cn(
                layoutsOperarCatalogRailProposalItemClass(proposalId),
                layoutsOperarCatalogRailProposalItemWithIconClass(proposalId),
                vistaCatalogo.modo === "promociones" &&
                  layoutsOperarCatalogRailProposalItemPromoSelectedClass(proposalId),
              )}
            >
              <Tag className="size-4 shrink-0 opacity-80" aria-hidden />
              Promociones
            </button>
          </li>
          <li className={layoutsOperarCatalogRailProposalListItemClass(proposalId)}>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              aria-pressed={vistaCatalogo.modo === "con_descuento"}
              onClick={() => setVistaCatalogo({ modo: "con_descuento" })}
              className={cn(
                layoutsOperarCatalogRailProposalItemClass(proposalId),
                layoutsOperarCatalogRailProposalItemWithIconClass(proposalId),
                vistaCatalogo.modo === "con_descuento" &&
                  layoutsOperarCatalogRailProposalItemDiscountSelectedClass(proposalId),
              )}
            >
              <Percent className="size-4 shrink-0 opacity-80" aria-hidden />
              Con descuento
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
