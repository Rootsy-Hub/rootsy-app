"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import { ExpenseDetailSummaryView } from "@/app/[siteId]/[popId]/operations/ExpenseDetailSummaryView"
import { OperationExpenseDetailMeta } from "@/app/[siteId]/[popId]/operations/OperationExpenseDetailMeta"
import { OperationExpenseDetailPayments } from "@/app/[siteId]/[popId]/operations/OperationExpenseDetailPayments"
import { expenseDetailTitle } from "@/app/[siteId]/[popId]/operations/operationExpenseUi"
import {
  opsDialogHeader,
  opsDialogSectionTitle,
  opsDialogSurfaceMd,
} from "@/app/[siteId]/[popId]/operations/operationDialogStyles"
import {
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  layoutsOperarSummaryPanelMaxWidthClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  expense: OperationExpenseLedgerRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  timeZone?: string
}

export function OperationExpenseDetailDialog({
  expense,
  open,
  onOpenChange,
  timeZone,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={opsDialogSurfaceMd}>
        <DialogHeader className={opsDialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {expense ? expenseDetailTitle(expense) : "Detalle de gasto"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {expense ? expenseDetailTitle(expense) : "Detalle de gasto"}
          </DialogDescription>
        </DialogHeader>

        {expense ? (
          <div className={`grid min-h-0 flex-1 items-start lg:grid-cols-[minmax(17rem,21rem)_minmax(${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px,1fr)]`}>
            <div className="min-h-0 overflow-y-auto overscroll-contain border-b border-border/50 bg-muted/20 px-5 py-4 lg:border-b-0 lg:border-r">
              <section>
                <h3 className={opsDialogSectionTitle}>Detalles</h3>
                <OperationExpenseDetailMeta
                  expense={expense}
                  timeZone={timeZone}
                />
              </section>

              <section className="mt-6">
                <h3 className={opsDialogSectionTitle}>Pagos</h3>
                <OperationExpenseDetailPayments
                  expense={expense}
                  timeZone={timeZone}
                />
              </section>
            </div>

            <div className="px-5 py-4 lg:pl-4">
              <div className={`mx-auto w-full ${layoutsOperarSummaryPanelMaxWidthClass}`}>
                <ExpenseDetailSummaryView expense={expense} showHeading={false} />
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
