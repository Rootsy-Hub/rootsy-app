"use client"

import {
  getOperationAccountingEntries,
  type OperationAccountingEntryDetail,
  type OperationsListView,
} from "@/app/[siteId]/[popId]/operations/actions"
import {
  tdMoneyClass,
  tdMoneyMutedClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { BookOpen } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const SOURCE_TYPE_LABELS: Record<string, string> = {
  sale: "Venta",
  purchase: "Compra (recepción)",
  purchase_payment: "Pago de compra",
  manual: "Manual",
  adjustment: "Ajuste",
  payment: "Cobro / pago",
  opening: "Apertura",
  closing: "Cierre",
  cash_register_close: "Cierre de caja (arqueo)",
  inventory_adjustment: "Ajuste de inventario",
  inventory_initial: "Stock inicial",
  expense_payment: "Pago de gasto",
  expense_void: "Anulación de gasto",
  service_charge_payment: "Cobro de servicio",
  treasury_settlement: "Liquidación tarjeta",
  check_receive: "Cheque recibido / emitido",
  check_deposit: "Depósito de cheque",
  check_reject: "Rechazo de cheque",
  check_void: "Anulación de cheque",
  current_account_receipt: "Cobro / pago de cuenta corriente",
}

function formatSourceType(s: string): string {
  return SOURCE_TYPE_LABELS[s] ?? s
}

function formatIsoDate(iso: string) {
  if (!iso) return "—"
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(d)
}

const dialogClass = cn(
  "rootsy-app-light gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl ring-1 ring-black/[0.04] sm:max-w-2xl",
  "max-h-[min(90vh,720px)] flex flex-col overflow-hidden",
)
const dialogHeader =
  "shrink-0 space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
const dialogBody =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4"

const accountingLineMoneyClass = cn(
  "font-medium text-foreground",
  tdMoneyClass,
)

const accountingTotalMoneyClass = cn(
  "text-base font-semibold text-primary",
  tdMoneyClass,
)

function AccountingAmount({
  amount,
  className,
}: {
  amount: number
  className?: string
}) {
  if (amount <= 0) {
    return <span className={tdMoneyMutedClass}>—</span>
  }
  return <span className={className}>{fmt.format(amount)}</span>
}

function EntryBlock({ entry }: { entry: OperationAccountingEntryDetail }) {
  return (
    <section className="space-y-3">
      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            Asiento n.º {entry.entryNumber}
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatIsoDate(entry.entryDate)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatSourceType(entry.sourceType)}
          {entry.description ? ` · ${entry.description}` : ""}
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-foreground">
                Cuenta
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Debe
              </TableHead>
              <TableHead className="text-right font-semibold text-foreground">
                Haber
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entry.lines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Sin líneas en este asiento.
                </TableCell>
              </TableRow>
            ) : (
              entry.lines.map((ln) => (
                <TableRow key={ln.id} className="border-border">
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {ln.accountCode}
                    </span>{" "}
                    <span className="text-sm text-foreground">
                      {ln.accountName}
                    </span>
                    {ln.lineDescription ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {ln.lineDescription}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <AccountingAmount
                      amount={ln.debitAmount}
                      className={accountingLineMoneyClass}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <AccountingAmount
                      amount={ln.creditAmount}
                      className={accountingLineMoneyClass}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div className="flex items-baseline justify-between gap-4 py-1.5">
          <span className="text-sm text-muted-foreground">Total debe</span>
          <span className={accountingTotalMoneyClass}>
            {fmt.format(entry.totalDebit)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-1.5">
          <span className="text-sm text-muted-foreground">Total haber</span>
          <span className={accountingTotalMoneyClass}>
            {fmt.format(entry.totalCredit)}
          </span>
        </div>
      </div>
    </section>
  )
}

function ModalSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-16 animate-pulse rounded-lg bg-muted-foreground/10" />
      <div className="h-40 animate-pulse rounded-lg bg-muted-foreground/10" />
    </div>
  )
}

export function OperationAccountingViewButton({
  onClick,
  label = "Ver asientos contables",
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 gap-1.5 px-2.5 text-xs"
      onClick={onClick}
      aria-label={label}
    >
      <BookOpen className="size-3.5" aria-hidden />
      Ver
    </Button>
  )
}

export function OperationAccountingModal({
  popId,
  view,
  operationId,
  groupedSaleIds,
  subtitle,
  open,
  onOpenChange,
}: {
  popId: string
  view: OperationsListView
  operationId: string | null
  groupedSaleIds?: string[]
  subtitle?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<OperationAccountingEntryDetail[]>([])

  const load = useCallback(async () => {
    if (!popId || !operationId) return
    setLoading(true)
    setError(null)
    setEntries([])
    const res = await getOperationAccountingEntries(popId, {
      view,
      operationId,
      groupedSaleIds,
    })
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setEntries(res.entries)
  }, [popId, view, operationId, groupedSaleIds])

  useEffect(() => {
    if (!open || !operationId) return
    void load()
  }, [open, operationId, load])

  const title =
    view === "sales"
      ? "Contabilidad de la venta"
      : view === "purchases"
        ? "Contabilidad de la compra"
        : "Contabilidad del gasto"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClass}>
        <DialogHeader className={dialogHeader}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {title}
          </DialogTitle>
          {subtitle ? (
            <DialogDescription className="text-sm leading-relaxed">
              {subtitle}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className={dialogBody}>
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          {loading ? (
            <ModalSkeleton />
          ) : !error && entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay asientos contables registrados para esta operación.
            </p>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <EntryBlock key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
