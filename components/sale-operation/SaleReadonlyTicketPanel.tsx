"use client"

import {
  layoutsOperarSummaryCartListSurfaceClass,
  layoutsOperarSummaryPanelMaxWidthClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { layoutsOperarTicketProposalCartListClass } from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { MostradorCartTicketGroup } from "@/components/sale-operation/MostradorCartTicketGroup"
import { SaleOperationCartList } from "@/components/sale-operation/SaleOperationCartList"
import {
  SaleOperationTotalBar,
  type SaleOperationTotalBarProps,
} from "@/components/sale-operation/SaleOperationTotalBar"
import {
  saleOpCartLineDivideYClass,
  saleOpCartLineDividerTopClass,
  saleOpCartListSurfaceClass,
} from "@/components/sale-operation/saleOperationStyles"
import type { MostradorCartDisplayGroup } from "@/lib/mostradorCartDisplay"
import { cn } from "@/lib/utils"
import { Receipt } from "lucide-react"
import type { ReactNode } from "react"

/** Ancho del panel de pedido en ventas / mesas / mostrador */
export const SALE_TICKET_PANEL_WIDTH_CLASS = cn("w-full", layoutsOperarSummaryPanelMaxWidthClass)

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

type Props = {
  groups: MostradorCartDisplayGroup[]
  renderRow: (row: MostradorCartDisplayGroup["rows"][number]) => ReactNode
  lineCount: number
  totalBar: SaleOperationTotalBarProps
  listTitle?: string
  emptyTitle?: string
  totalBarTone?: "pos" | "modal" | "operar"
  importeClassName?: string
  discountBadgeClassName?: string
  className?: string
  /** Reemplaza el scroll de Operar (p. ej. `rootsy-scroll-minimal` en un modal). */
  ticketScrollClassName?: string
}

export function SaleReadonlyTicketPanel({
  groups,
  renderRow,
  lineCount,
  totalBar,
  listTitle = "Pedido",
  emptyTitle = "Pedido vacío",
  totalBarTone = "pos",
  importeClassName,
  discountBadgeClassName,
  className,
  ticketScrollClassName,
}: Props) {
  const isModal = totalBarTone === "modal"
  const isOperar = totalBarTone === "operar"

  if (isOperar) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-900)]",
          className,
        )}
      >
        <div
          className={cn(
            "row-start-1 flex min-h-0 flex-col",
            ticketScrollClassName ??
              "layouts-operar-scroll-minimal h-full overflow-y-auto",
          )}
          role="region"
          aria-label="Pedido"
        >
          {lineCount === 0 ? (
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
              {groups.map((group) => (
                <MostradorCartTicketGroup
                  key={group.key}
                  group={group}
                  variant="operar"
                  renderRow={renderRow}
                  importeClassName={importeClassName}
                  discountBadgeClassName={discountBadgeClassName}
                />
              ))}
              <SaleOperationTotalBar
                {...totalBar}
                flush
                tone="operar"
                hideSectionTitle
                embedded
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        isModal
          ? "overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm"
          : "bg-white",
        !isModal && "min-h-0 flex-1",
        SALE_TICKET_PANEL_WIDTH_CLASS,
        className,
      )}
    >
      <SaleOperationCartList
        title={listTitle}
        lineCount={lineCount}
        emptyTitle={emptyTitle}
        flush
        fillHeight={!isModal}
      >
        <div className={cn(saleOpCartListSurfaceClass, saleOpCartLineDivideYClass)}>
          {groups.map((group) => (
            <MostradorCartTicketGroup
              key={group.key}
              group={group}
              renderRow={renderRow}
              importeClassName={importeClassName}
              discountBadgeClassName={discountBadgeClassName}
            />
          ))}
        </div>
      </SaleOperationCartList>

      <div
        className={cn(
          "shrink-0",
          !isModal && "mt-auto",
          isModal
            ? saleOpCartLineDividerTopClass
            : "shadow-[0_-10px_28px_rgba(15,23,42,0.07)]",
        )}
      >
        <SaleOperationTotalBar
          {...totalBar}
          flush
          tone={totalBarTone}
        />
      </div>
    </div>
  )
}
