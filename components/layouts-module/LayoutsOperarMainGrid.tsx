"use client"

import {
  layoutsOperarBodyMainGridClass,
  layoutsOperarCatalogRowClass,
  layoutsOperarOperationColumnClass,
  layoutsOperarToolboxRowClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { OperarTicketMobileLayer } from "@/components/layouts-module/OperarTicketMobileLayer"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  /** 1.1.1 — sidebar categorías + canvas productos */
  catalog: ReactNode
  /** 1.1.2 — banda toolbox (4 slots). `null` oculta la fila (Mesas/Mostrador fuera de Pedido). */
  toolbox?: ReactNode
  /** 1.2 — panel ticket (4 filas) */
  ticket: ReactNode
  /** Ubicación de la banda toolbox dentro de la columna operación. */
  toolboxPosition?: "top" | "bottom"
  /** Label de la barra mobile que abre el ticket. */
  ticketDockLabel?: string
  className?: string
}

/**
 * Grid operar nivel 1 — producción (Vender · Mostrador · Mesas · Compras).
 *
 * Desktop: 1.1 col izquierda (catálogo + toolbox) · 1.2 ticket
 * Mobile: canvas a full · ticket en dock + sheet
 */
export function LayoutsOperarMainGrid({
  catalog,
  toolbox,
  ticket,
  toolboxPosition = "bottom",
  ticketDockLabel,
  className,
}: Props) {
  const showToolbox = toolbox != null
  const toolboxOnTop = toolboxPosition === "top"

  return (
    <main
      className={cn("relative z-10 min-h-0 flex-1", layoutsOperarBodyMainGridClass, className)}
    >
      <div
        className={cn(
          layoutsOperarOperationColumnClass,
          !showToolbox && "[grid-template-rows:minmax(0,1fr)]",
          showToolbox &&
            toolboxOnTop &&
            "sm:[grid-template-rows:minmax(var(--layouts-operar-toolbox-min-h-sm),auto)_minmax(0,1fr)] [grid-template-rows:minmax(var(--layouts-operar-toolbox-min-h),auto)_minmax(0,1fr)]",
        )}
      >
        <div
          className={cn(
            layoutsOperarCatalogRowClass,
            showToolbox && toolboxOnTop && "row-start-2",
          )}
        >
          {catalog}
        </div>
        {showToolbox ? (
          <div
            className={cn(
              layoutsOperarToolboxRowClass,
              toolboxOnTop && "row-start-1",
              "max-md:hidden",
            )}
          >
            {toolbox}
          </div>
        ) : null}
      </div>
      <div className="hidden min-h-0 md:contents">{ticket}</div>
      <OperarTicketMobileLayer
        ticket={ticket}
        toolbox={showToolbox ? toolbox : null}
        dockLabel={ticketDockLabel}
      />
    </main>
  )
}
