"use client"

import { MostradorCartLineCard } from "@/components/sale-operation/MostradorCartLineCard"
import { MostradorCartTicketGroup } from "@/components/sale-operation/MostradorCartTicketGroup"
import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import {
  layoutsOperarSummaryCartCellClass,
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryCartListSurfaceClass,
  layoutsOperarSummaryCartMetaClass,
  layoutsOperarSummaryTotalsPlacementClass,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsOperarStyles"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  layoutsOperarTicketProposalActionsClass,
  layoutsOperarTicketProposalCartListClass,
  layoutsOperarTicketProposalHeaderClass,
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
  const cartScrollContainerRef = cartScrollHighlight?.scrollRef

  const cartDisplayGroups = useMemo(
    () => groupMostradorCartDisplayRows(cartDisplayRows, cartLineOverrides),
    [cartDisplayRows, cartLineOverrides],
  )

  const ticketLineCount = useMemo(
    () => cartDisplayGroups.reduce((sum, group) => sum + group.rows.length, 0),
    [cartDisplayGroups],
  )
  const hasTicketItems = ticketLineCount > 0

  const panel = (
    <>
      {/* 1.2.1 — cantidad de líneas */}
      <div
        className={cn(
          layoutsOperarTicketProposalHeaderClass(TICKET_PROPOSAL),
          "row-start-1 min-h-0 shrink-0",
        )}
      >
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
        ref={cartScrollContainerRef}
        className={cn(
          layoutsOperarSummaryCartCellClass,
          "layouts-operar-scroll-minimal overflow-y-auto",
        )}
        role="region"
        aria-label="Ítems agregados"
      >
        {ticketLineCount === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col" data-ticket-empty="true">
            <DataWorkspaceDetailEmptyState icon={Receipt} title={emptyTitle} />
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

      {hasTicketItems ? (
        <div className={layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL)}>
          <SaleOperationActionsBar {...actions} variant="operar" />
        </div>
      ) : null}

      {/* 1.2.4 — totales */}
      <div className={layoutsOperarSummaryTotalsPlacementClass} data-ticket-totals>
        <SaleOperationTotalBar {...totalBar} tone="operar" className="h-full w-full" />
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
