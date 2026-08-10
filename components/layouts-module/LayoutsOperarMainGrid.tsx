"use client"

import {
  layoutsOperarBodyMainGridClass,
  layoutsOperarCatalogRowClass,
  layoutsOperarOperationColumnClass,
  layoutsOperarToolboxRowClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  /** 1.1.1 — sidebar categorías + canvas productos */
  catalog: ReactNode
  /** 1.1.2 — banda toolbox (4 slots) */
  toolbox: ReactNode
  /** 1.2 — panel ticket (4 filas) */
  ticket: ReactNode
  className?: string
}

/**
 * Grid operar nivel 1 — producción (Vender · Mostrador · Mesas · Compras).
 *
 * 1.1 col izquierda: catálogo + toolbox
 * 1.2 col derecha: ticket
 */
export function LayoutsOperarMainGrid({ catalog, toolbox, ticket, className }: Props) {
  return (
    <main
      className={cn("relative z-10 min-h-0 flex-1", layoutsOperarBodyMainGridClass, className)}
    >
      <div className={layoutsOperarOperationColumnClass}>
        <div className={layoutsOperarCatalogRowClass}>{catalog}</div>
        <div className={layoutsOperarToolboxRowClass}>{toolbox}</div>
      </div>
      {ticket}
    </main>
  )
}
