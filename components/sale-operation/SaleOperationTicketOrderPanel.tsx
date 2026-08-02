"use client"

import { MostradorCartLineCard } from "@/components/sale-operation/MostradorCartLineCard"
import { MostradorCartTicketGroup } from "@/components/sale-operation/MostradorCartTicketGroup"
import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import { groupMostradorCartDisplayRows } from "@/lib/mostradorCartDisplay"
import type { MostradorCartDisplayRow } from "@/lib/mostradorCartDisplay"
import type { MostradorCartLineEditInput } from "@/lib/menuCartLineMerge"
import { getRowPaymentStatus } from "@/lib/partialCheckoutSelection"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"
import { CartListScrollHighlightProvider } from "@/hooks/useCartListScrollHighlight"
import { useMemo } from "react"

type ActionsProps = React.ComponentProps<typeof SaleOperationActionsBar>
type TotalProps = React.ComponentProps<typeof SaleOperationTotalBar>

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
  flush = true,
  cartScrollHighlight,
}: Props) {
  const cartDisplayGroups = useMemo(
    () => groupMostradorCartDisplayRows(cartDisplayRows, cartLineOverrides),
    [cartDisplayRows, cartLineOverrides],
  )

  const ticketLineCount = useMemo(
    () => cartDisplayGroups.reduce((sum, group) => sum + group.rows.length, 0),
    [cartDisplayGroups],
  )

  const panel = (
    <div className="flex min-h-0 flex-1 flex-col">
      <SaleOperationCartList
        title={listTitle}
        subtitle={listSubtitle}
        lineCount={ticketLineCount}
        emptyTitle={emptyTitle}
        flush={flush}
      >
        <div className="border-b border-slate-200/90 bg-white">
          {cartDisplayGroups.map((group) => (
            <MostradorCartTicketGroup
              key={group.key}
              group={group}
              renderRow={(row) => (
                <MostradorCartLineCard
                  key={row.rowKey}
                  row={row}
                  overrides={cartLineOverrides}
                  paidPartialUnits={paidPartialUnits}
                  onApplyEdits={aplicarEdicionLineaTicket}
                  onRemove={() => {
                    const paymentStatus = getRowPaymentStatus(
                      row,
                      paidPartialUnits,
                    )
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
      </SaleOperationCartList>

      <div className="mt-auto shrink-0 shadow-[0_-10px_28px_rgba(15,23,42,0.07)]">
        <SaleOperationActionsBar {...actions} flush={flush} />
        <SaleOperationTotalBar {...totalBar} flush={flush} />
      </div>
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
