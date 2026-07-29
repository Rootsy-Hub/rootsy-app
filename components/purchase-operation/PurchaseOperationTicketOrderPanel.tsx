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

type ActionsProps = React.ComponentProps<typeof SaleOperationActionsBar>
type TotalProps = React.ComponentProps<typeof SaleOperationTotalBar>

type Props = {
  lines: PurchaseCartLine[]
  overrides: PurchaseCartLineOverrides
  canUpdateArticles: boolean
  onApplyLineEdits: (input: PurchaseLineEditInput) => void
  onRemoveLine: (productoId: string) => void
  actions: ActionsProps
  totalBar: TotalProps
  listTitle?: string
  emptyTitle?: string
  flush?: boolean
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
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SaleOperationCartList
        title={listTitle}
        lineCount={lines.length}
        emptyTitle={emptyTitle}
        flush={flush}
      >
        <div className="border-b border-slate-200/90 bg-white">
          {lines.map((line) => (
            <PurchaseCartLineCard
              key={line.productoId}
              line={line}
              overrides={overrides}
              canUpdateArticles={canUpdateArticles}
              onApplyEdits={onApplyLineEdits}
              onRemove={() => onRemoveLine(line.productoId)}
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
}
