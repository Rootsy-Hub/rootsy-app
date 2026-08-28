"use client"

import type { OperationExpenseLedgerRow } from "@/app/[siteId]/[popId]/operations/actions"
import { ExpenseDetailSummaryView } from "@/app/[siteId]/[popId]/operations/ExpenseDetailSummaryView"
import { OperationExpenseDetailMeta } from "@/app/[siteId]/[popId]/operations/OperationExpenseDetailMeta"
import { OperationExpenseDetailPayments } from "@/app/[siteId]/[popId]/operations/OperationExpenseDetailPayments"
import { expenseDetailTitle } from "@/app/[siteId]/[popId]/operations/operationExpenseUi"
import { opsDialogSectionTitle } from "@/app/[siteId]/[popId]/operations/operationDialogStyles"
import {
  LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX,
  layoutsOperarSummaryPanelMaxWidthClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"

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
      <RootsDialogContent
        size="twoCol"
        className={`sm:max-w-[min(92vw,calc(21rem+${LAYOUTS_OPERAR_SUMMARY_PANEL_WIDTH_PX}px+3rem))]`}
      >
        <RootsDialogHeader
          open={open}
          title={expense ? expenseDetailTitle(expense) : "Detalle de gasto"}
          description={expense ? expenseDetailTitle(expense) : "Detalle de gasto"}
          descriptionHidden
        />

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
      </RootsDialogContent>
    </Dialog>
  )
}
