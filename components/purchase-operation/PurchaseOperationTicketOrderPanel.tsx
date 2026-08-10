"use client"

import {
  layoutsOperarSummaryCartCellClass,
  layoutsOperarSummaryCartHeadingClass,
  layoutsOperarSummaryCartListSurfaceClass,
  layoutsOperarSummaryCartMetaClass,
  layoutsOperarSummaryTotalsPlacementClass,
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
        className={cn(
          layoutsOperarTicketProposalHeaderClass(TICKET_PROPOSAL),
          "row-start-1 min-h-0 shrink-0",
        )}
      >
        <div className="min-w-0">
          <h2 className={layoutsOperarSummaryCartHeadingClass}>{listTitle}</h2>
        </div>
        <span className={layoutsOperarSummaryCartMetaClass}>
          {ticketLineCount} {ticketLineCount === 1 ? "línea" : "líneas"}
        </span>
      </div>

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
      </div>

      {hasTicketItems ? (
        <div className={layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL)}>
          <SaleOperationActionsBar {...actions} variant="operar" />
        </div>
      ) : null}

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
