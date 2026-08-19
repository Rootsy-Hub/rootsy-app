"use client"

import {
  layoutsOperarSummaryCartListSurfaceClass,
  layoutsOperarSummaryCartTitleClass,
  layoutsOperarSummaryTotalsPlacementClass,
  layoutsOperarTicketScrollColumnClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  layoutsOperarTicketProposalActionsClass,
  layoutsOperarTicketProposalCartListClass,
  layoutsOperarTicketProposalHeaderClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import {
  PurchaseCartLineCard,
  type PurchaseCartLine,
  type PurchaseCartLineOverrides,
  type PurchaseLineEditInput,
} from "@/components/purchase-operation/PurchaseCartLineCard"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"
import { CartListScrollHighlightProvider } from "@/hooks/useCartListScrollHighlight"
import { cn } from "@/lib/utils"
import { Receipt } from "lucide-react"

type ActionsProps = React.ComponentProps<typeof SaleOperationActionsBar>
type TotalProps = React.ComponentProps<typeof SaleOperationTotalBar>

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

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
  cartScrollHighlight,
}: Props) {
  const cartScrollContainerRef = cartScrollHighlight?.scrollRef
  const ticketLineCount = lines.length
  const hasTicketItems = ticketLineCount > 0

  const panel = (
    <>
      <div
        ref={cartScrollContainerRef}
        className={layoutsOperarTicketScrollColumnClass}
        role="region"
        aria-label="Pedido"
      >
        <div className={layoutsOperarTicketProposalHeaderClass(TICKET_PROPOSAL)}>
          <div className="min-w-0">
            <h2 className={layoutsOperarSummaryCartTitleClass}>{listTitle}</h2>
          </div>
        </div>

        {ticketLineCount === 0 ? (
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
        )}

        {hasTicketItems ? (
          <div className={layoutsOperarSummaryTotalsPlacementClass} data-ticket-totals>
            <SaleOperationTotalBar {...totalBar} tone="operar" className="w-full" />
          </div>
        ) : null}
      </div>

      {hasTicketItems ? (
        <div className={layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL)}>
          <SaleOperationActionsBar {...actions} variant="operar" />
        </div>
      ) : null}
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
