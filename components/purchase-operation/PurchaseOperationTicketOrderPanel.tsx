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
import { OperarMobileToolboxIcons } from "@/components/layouts-module/OperarMobileToolbox"
import { OperarTicketEmptyState } from "@/components/layouts-module/OperarTicketEmptyState"
import { SaleOperationActionsBar } from "@/components/sale-operation/SaleOperationActionsBar"
import { SaleOperationTotalBar } from "@/components/sale-operation/SaleOperationTotalBar"
import type { CartListScrollHighlightValue } from "@/hooks/useCartListScrollHighlight"
import { CartListScrollHighlightProvider } from "@/hooks/useCartListScrollHighlight"
import { cn } from "@/lib/utils"

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
  emptyDescription?: string
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
  emptyTitle,
  emptyDescription,
  cartScrollHighlight,
}: Props) {
  const cartScrollContainerRef = cartScrollHighlight?.scrollRef
  const ticketLineCount = lines.length
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
      >
        {hasTicketItems ? (
          <div className={layoutsOperarTicketProposalHeaderClass(TICKET_PROPOSAL)}>
            <div className="min-w-0">
              <h2 className={layoutsOperarSummaryCartTitleClass}>{listTitle}</h2>
            </div>
          </div>
        ) : null}

        {ticketLineCount === 0 ? (
          <OperarTicketEmptyState
            kind="purchase"
            title={emptyTitle}
            description={emptyDescription}
          />
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

      <OperarMobileToolboxIcons />

      {hasTicketItems ? (
        <div className={cn(layoutsOperarTicketProposalActionsClass(TICKET_PROPOSAL), "max-md:hidden")}>
          <SaleOperationActionsBar {...actions} variant="operar" />
        </div>
      ) : null}

      <div className="shrink-0 md:hidden">
        <SaleOperationActionsBar
          {...actions}
          variant="mobile"
          discardDisabled={actions.discardDisabled || !hasTicketItems}
          confirmDisabled={actions.confirmDisabled || !hasTicketItems}
        />
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
