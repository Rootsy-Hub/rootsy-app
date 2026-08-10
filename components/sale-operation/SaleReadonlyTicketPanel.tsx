"use client"

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
import { layoutsOperarSummaryPanelMaxWidthClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/** Ancho del panel de pedido en ventas / mesas / mostrador */
export const SALE_TICKET_PANEL_WIDTH_CLASS = cn("w-full", layoutsOperarSummaryPanelMaxWidthClass)

type Props = {
  groups: MostradorCartDisplayGroup[]
  renderRow: (row: MostradorCartDisplayGroup["rows"][number]) => ReactNode
  lineCount: number
  totalBar: SaleOperationTotalBarProps
  listTitle?: string
  emptyTitle?: string
  totalBarTone?: "pos" | "modal"
  importeClassName?: string
  discountBadgeClassName?: string
  className?: string
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
}: Props) {
  const isModal = totalBarTone === "modal"

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
