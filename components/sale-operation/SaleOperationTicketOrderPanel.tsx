"use client"

import { MostradorCartLineCard } from "@/components/sale-operation/MostradorCartLineCard"
import { MostradorCartTicketGroup } from "@/components/sale-operation/MostradorCartTicketGroup"
import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import {
  layoutsOperarSummaryCartListSurfaceClass,
  layoutsOperarSummaryCartTitleClass,
  layoutsOperarSummaryTotalsPlacementClass,
  layoutsOperarTicketScrollColumnClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { OperarMobileToolboxIcons } from "@/components/layouts-module/OperarMobileToolbox"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { dataWorkspaceBlocksSkeletonTone } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  layoutsOperarTicketProposalActionsClass,
  layoutsOperarTicketProposalCartListClass,
  layoutsOperarTicketProposalHeaderClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
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
  anularLineaComanda?: (input: {
    lineId: string
    quantity: number
    comment: string
  }) => void | Promise<void>
  actions: ActionsProps
  totalBar: TotalProps
  listTitle?: string
  contextLabel?: {
    caption: string
    value: string
    valueSize?: "prominent" | "compact"
  }
  emptyTitle?: string
  flush?: boolean
  loading?: boolean
  cartScrollHighlight?: CartListScrollHighlightValue
}

const ticketSkeleton = dataWorkspaceBlocksSkeletonTone

function SaleOperationTicketOrderPanelSkeleton() {
  return (
    <div
      className={cn(
        layoutsOperarSummaryCartListSurfaceClass,
        layoutsOperarTicketProposalCartListClass(TICKET_PROPOSAL),
        "gap-3 p-3",
      )}
      aria-hidden
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2 rounded-xl border border-[var(--rootsy-bruma-200)] p-3">
          <div className="flex items-start justify-between gap-3">
            <div className={cn(ticketSkeleton.bar, "h-4 w-[58%]")} />
            <div className={cn(ticketSkeleton.barSm, "h-4 w-16")} />
          </div>
          {index === 0 ? (
            <div className={cn(ticketSkeleton.barSm, "h-3 w-[42%]")} />
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function SaleOperationTicketOrderPanel({
  cartDisplayRows,
  cartLineOverrides,
  paidPartialUnits = {},
  aplicarEdicionLineaTicket,
  cambiarCantidadPorLinea,
  quitarQuantityDealApplication,
  anularLineaComanda,
  actions,
  totalBar,
  listTitle = "Pedido",
  contextLabel,
  emptyTitle = "Pedido vacío",
  loading = false,
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
    <div className="flex h-full min-h-0 flex-1 flex-col md:contents">
      <div
        ref={cartScrollContainerRef}
        className={cn(
          layoutsOperarTicketScrollColumnClass,
          "max-md:h-auto max-md:flex-1",
        )}
        role="region"
        aria-label="Pedido"
        aria-busy={loading || undefined}
      >
        <div className={layoutsOperarTicketProposalHeaderClass(TICKET_PROPOSAL)}>
          <div className="min-w-0">
            <h2 className={layoutsOperarSummaryCartTitleClass}>{listTitle}</h2>
          </div>
        </div>

        {loading ? (
          <SaleOperationTicketOrderPanelSkeleton />
        ) : ticketLineCount === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col" data-ticket-empty="true">
            <DataWorkspaceDetailEmptyState icon={Receipt} title={emptyTitle} />
          </div>
        ) : (
          <div
            className={cn(
              layoutsOperarSummaryCartListSurfaceClass,
              layoutsOperarTicketProposalCartListClass(TICKET_PROPOSAL),
              "shrink-0",
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
                    onVoidLine={
                      anularLineaComanda
                        ? ({ quantity, comment }) =>
                            anularLineaComanda({
                              lineId: row.cartLineId,
                              quantity,
                              comment,
                            })
                        : undefined
                    }
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

        {!loading && hasTicketItems ? (
          <div className={layoutsOperarSummaryTotalsPlacementClass} data-ticket-totals>
            <SaleOperationTotalBar {...totalBar} tone="operar" className="w-full" />
          </div>
        ) : null}
      </div>

      {!loading ? <OperarMobileToolboxIcons /> : null}

      {!loading && hasTicketItems ? (
        <div className={cn(layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL), "max-md:hidden")}>
          <SaleOperationActionsBar
            {...actions}
            variant="operar"
            contextLabel={contextLabel}
          />
        </div>
      ) : null}

      {!loading ? (
        <div className="shrink-0 md:hidden">
          <SaleOperationActionsBar
            {...actions}
            variant="mobile"
            discardDisabled={actions.discardDisabled || !hasTicketItems}
            confirmDisabled={actions.confirmDisabled || !hasTicketItems}
          />
        </div>
      ) : null}
    </div>
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
