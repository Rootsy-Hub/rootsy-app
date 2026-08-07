"use client"

import {
  PurchaseCartLineCard,
  type PurchaseCartLine,
  type PurchaseCartLineOverrides,
  type PurchaseLineEditInput,
} from "@/components/purchase-operation/PurchaseCartLineCard"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import { saleOpCartListSurfaceClass } from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"
import { CartListScrollHighlightProvider } from "@/hooks/useCartListScrollHighlight"

type ActionsProps = React.ComponentProps<typeof SaleOperationActionsBar>
type TotalProps = React.ComponentProps<typeof SaleOperationTotalBar>

type Props = {
  lines: PurchaseCartLine[]
  overrides: PurchaseCartLineOverrides
  canUpdateArticles: boolean
  onApplyLineEdits: (input: PurchaseLineEditInput) => void
  onRemoveLine: (lineId: string) => void
  actions: ActionsProps
  totalBar: TotalProps
  listTitle?: string
  emptyTitle?: string
  flush?: boolean
  cartScrollHighlight?: CartListScrollHighlightValue
}

export function PurchaseOperationTicketOrderPanel({
  lines,
  overrides,
  canUpdateArticles,
  onApplyLineEdits,
  onRemoveLine,
  actions,
  totalBar,
  listTitle = "Tu compra",
  emptyTitle = "Compra vacía",
  flush = true,
  cartScrollHighlight,
}: Props) {
  const panel = (
    <div className="flex min-h-0 flex-1 flex-col">
      <SaleOperationCartList
        title={listTitle}
        lineCount={lines.length}
        emptyTitle={emptyTitle}
        flush={flush}
      >
        <div className={cn("border-b border-slate-200/90", saleOpCartListSurfaceClass)}>
          {lines.map((line) => (
            <PurchaseCartLineCard
              key={line.lineId}
              line={line}
              overrides={overrides}
              canUpdateArticles={canUpdateArticles}
              onApplyEdits={onApplyLineEdits}
              onRemove={() => onRemoveLine(line.lineId)}
            />
          ))}
        </div>
      </SaleOperationCartList>

      <div className="relative z-10 mt-auto shrink-0 bg-white">
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
