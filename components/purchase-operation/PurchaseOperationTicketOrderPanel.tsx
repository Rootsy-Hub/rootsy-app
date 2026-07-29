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
  emptyDescription?: string
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
  emptyDescription = "Agregá artículos desde el catálogo.",
  flush = true,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SaleOperationCartList
        title={listTitle}
        lineCount={lines.length}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
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

      <SaleOperationActionsBar {...actions} flush={flush} />
      <SaleOperationTotalBar {...totalBar} flush={flush} />
    </div>
  )
}
