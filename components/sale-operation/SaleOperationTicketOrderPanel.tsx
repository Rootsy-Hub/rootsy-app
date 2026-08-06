"use client"

import { MostradorCartLineCard } from "@/components/sale-operation/MostradorCartLineCard"
import { MostradorCartTicketGroup } from "@/components/sale-operation/MostradorCartTicketGroup"
import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import {
  layoutsOperarSummaryActionsRowClass,
  layoutsOperarSummaryCartCellClass,
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryCartListSurfaceClass,
  layoutsOperarSummaryCartMetaClass,
  layoutsOperarSummaryEmptyStateClass,
  layoutsOperarSummaryEmptyStateContentClass,
  layoutsOperarSummaryEmptyIconWrapClass,
  layoutsOperarSummaryEmptyTitleClass,
  layoutsOperarSummaryHeaderCellClass,
  layoutsOperarSummaryTotalsPlacementClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import {
  layoutsOperarTicketProposalCartListClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsOperarSystem"
import {
  groupMostradorCartDisplayRows,
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import type { MostradorCartLineEditInput } from "@/lib/menuCartLineMerge"
import { getRowPaymentStatus } from "@/lib/partialCheckoutSelection"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"
import { CartListScrollHighlightProvider } from "@/hooks/useCartListScrollHighlight"
import { useCartListScrollContainerRef } from "@/hooks/useCartListScrollHighlight"
import { cn } from "@/lib/utils"
import { Receipt } from "lucide-react"
import { useMemo } from "react"

type ActionsProps = React.ComponentProps<typeof SaleOperationActionsBar>
type TotalProps = React.ComponentProps<typeof SaleOperationTotalBar>

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

type Props = {
  cartDisplayRows: MostradorCartDisplayRow[]
  cartLineOverrides: OperationCartLineOverrideState
  paidPartialUnits?: Record<string, number>
  aplicarEdicionLineaTicket: (input: MostradorCartLineEditInput) => void
  cambiarCantidadPorLinea: (lineId: string, delta: number) => void
  quitarQuantityDealApplication: (applicationId: string) => void
  actions: ActionsProps
  totalBar: TotalProps
  listTitle?: string
  listSubtitle?: string
  emptyTitle?: string
  flush?: boolean
  cartScrollHighlight?: CartListScrollHighlightValue
}

export function SaleOperationTicketOrderPanel({
  cartDisplayRows,
  cartLineOverrides,
  paidPartialUnits = {},
  aplicarEdicionLineaTicket,
  cambiarCantidadPorLinea,
  quitarQuantityDealApplication,
  actions,
  totalBar,
  listTitle = "Pedido",
  listSubtitle,
  emptyTitle = "Pedido vacío",
  cartScrollHighlight,
}: Props) {
  const scrollContainerRef = useCartListScrollContainerRef()

  const cartDisplayGroups = useMemo(
    () => groupMostradorCartDisplayRows(cartDisplayRows, cartLineOverrides),
    [cartDisplayRows, cartLineOverrides],
  )

  const ticketLineCount = useMemo(
    () => cartDisplayGroups.reduce((sum, group) => sum + group.rows.length, 0),
    [cartDisplayGroups],
  )

  const panel = (
    <>
      {/* 1.2.1 — cantidad de líneas */}
      <div className={layoutsOperarSummaryHeaderCellClass}>
        <div className="min-w-0">
          <h2 className={layoutsOperarSummaryCartHeadingClass}>{listTitle}</h2>
          {listSubtitle ? (
            <p className="mt-0.5 truncate text-xs font-medium text-[var(--layouts-operar-light-cart-line-meta)]">
              {listSubtitle}
            </p>
          ) : null}
        </div>
        <span className={layoutsOperarSummaryCartMetaClass}>
          {ticketLineCount} {ticketLineCount === 1 ? "línea" : "líneas"}
        </span>
      </div>

      {/* 1.2.2 — listado ticket */}
      <div
        ref={scrollContainerRef ?? undefined}
        className={cn(
          layoutsOperarSummaryCartCellClass,
          "layouts-operar-scroll-minimal overflow-y-auto",
        )}
        role="region"
        aria-label="Ítems agregados"
      >
        {ticketLineCount === 0 ? (
          <div className={layoutsOperarSummaryEmptyStateClass}>
            <div className={layoutsOperarSummaryEmptyStateContentClass}>
              <div className={layoutsOperarSummaryEmptyIconWrapClass} aria-hidden>
                <Receipt className="size-7 stroke-[1.75]" />
              </div>
              <p className={layoutsOperarSummaryEmptyTitleClass}>{emptyTitle}</p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              layoutsOperarSummaryCartListSurfaceClass,
              layoutsOperarTicketProposalCartListClass(TICKET_PROPOSAL),
            )}
          >
            {cartDisplayGroups.map((group) => (
              <MostradorCartTicketGroup
                key={group.key}
                group={group}
                variant="operar"
                renderRow={(row) => (
                  <MostradorCartLineCard
                    key={row.rowKey}
                    row={row}
                    variant="operar"
                    overrides={cartLineOverrides}
                    paidPartialUnits={paidPartialUnits}
                    onApplyEdits={aplicarEdicionLineaTicket}
                    onRemove={() => {
                      const paymentStatus = getRowPaymentStatus(row, paidPartialUnits)
                      if (
                        row.paidLocked ||
                        paymentStatus.isFullyPaid ||
                        paymentStatus.isPartiallyPaid
                      ) {
                        return
                      }
                      if (row.variant === "combo_component") {
                        cambiarCantidadPorLinea(row.cartLineId, -1)
                        return
                      }
                      if (row.quantityDealApplicationId) {
                        quitarQuantityDealApplication(row.quantityDealApplicationId)
                        return
                      }
                      cambiarCantidadPorLinea(row.cartLineId, -row.cantidad)
                    }}
                  />
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* 1.2.3 — acciones: col Descartar | col Vender */}
      <div className={layoutsOperarSummaryActionsRowClass}>
        <SaleOperationActionsBar {...actions} variant="operar" />
      </div>

      {/* 1.2.4 — totales */}
      <div className={layoutsOperarSummaryTotalsPlacementClass}>
        <SaleOperationTotalBar {...totalBar} tone="operar" className="h-full min-h-0" />
      </div>
    </>
  )

  if (cartScrollHighlight) {
    return (
      <CartListScrollHighlightProvider value={cartScrollHighlight}>
        {panel}
      </CartListScrollHighlightProvider>
    )
  }

  return panel
}
