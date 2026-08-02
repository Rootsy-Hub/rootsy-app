"use client"

import type { CashRegisterRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  cashRegisterCloseDialogContentClass,
  CashRegisterDialogTwoColumnBody,
} from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDialogLayout"
import {
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutMoneyValueField,
  CheckoutSectionLabel,
} from "@/components/checkout/CheckoutFormFields"
import { tdMoneyClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  closingPaymentDifference,
  closingVarianceLabel,
} from "@/lib/cashRegisterCloseSettlement"
import { isMoneyInputComplete, parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import {
  saleOpChannelFormField,
  saleOpDialogHeader,
} from "@/components/sale-operation/saleOperationStyles"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"
import { useMemo, useRef, type FormEvent } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: CashRegisterRow | null
  saving: boolean
  banner: string | null
  closeCash: string
  onCloseCashChange: (value: string) => void
  closeTreasuryLines: Record<string, string>
  onCloseTreasuryLineChange: (key: string, value: string) => void
  closeNote: string
  onCloseNoteChange: (value: string) => void
  onSubmit: (e: FormEvent) => void | Promise<void>
}

type CloseRowDef = {
  kind: string
  label: string
  expected: number
  actualValue: string
  onActualChange: (value: string) => void
  inputId: string
  autoFocus?: boolean
}

const sectionLabel =
  "text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"

function SummaryMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className={sectionLabel}>{label}</p>
      <p className="mt-1.5 truncate text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  )
}

function CloseVarianceBadge({
  expected,
  actualValue,
}: {
  expected: number
  actualValue: string
}) {
  if (!isMoneyInputComplete(actualValue)) return null

  const actual = parseMoneyInput(actualValue)
  const diff = closingPaymentDifference(actual, expected)
  const varianceLabel = closingVarianceLabel(diff)

  if (varianceLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
          diff < 0
            ? "bg-rose-500/10 text-rose-700"
            : "bg-emerald-500/10 text-emerald-800",
        )}
      >
        {varianceLabel}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
      <CheckCircle2 className="size-3.5 shrink-0 opacity-80" aria-hidden />
      Coincide
    </span>
  )
}

function ClosePaymentMethodsTable({ rows }: { rows: CloseRowDef[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_7.5rem] items-center gap-x-3 border-b border-border/60 bg-muted/25 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:grid-cols-[minmax(0,1fr)_6.5rem_8rem] sm:px-4">
        <span>Cuenta</span>
        <span className="text-right">Esperado</span>
        <span className="text-right">Contado</span>
      </div>
      <ul className="divide-y divide-border/50">
        {rows.map((line) => (
          <li
            key={line.kind}
            className="grid grid-cols-[minmax(0,1fr)_5.5rem_7.5rem] items-center gap-x-3 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_6.5rem_8rem] sm:px-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {line.label}
              </p>
              <div className="mt-1">
                <CloseVarianceBadge
                  expected={line.expected}
                  actualValue={line.actualValue}
                />
              </div>
            </div>
            <p
              className={cn(
                "text-right text-[13px] text-muted-foreground",
                tdMoneyClass,
              )}
            >
              {formatCashRegisterMoney(line.expected)}
            </p>
            <div className="min-w-0">
              <CheckoutMoneyValueField
                id={line.inputId}
                value={line.actualValue}
                onChange={line.onActualChange}
                autoFocus={line.autoFocus}
                ariaLabel={`${line.label} — monto contado`}
                hideIcon
                size="compact"
                className="w-full"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CashRegisterCloseDialog({
  open,
  onOpenChange,
  row,
  saving,
  banner,
  closeCash,
  onCloseCashChange,
  closeTreasuryLines,
  onCloseTreasuryLineChange,
  closeNote,
  onCloseNoteChange,
  onSubmit,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const efectivoTeorico = row?.openSessionTotals?.efectivoTeoricoEnCajon ?? 0
  const cobrosParaCierre = row?.openSessionTotals?.cobrosParaCierre ?? []
  const meta = row?.openSessionMeta

  const closeRows = useMemo((): CloseRowDef[] => {
    const rows: CloseRowDef[] = []

    rows.push({
      kind: "cash",
      label: "Efectivo en cajón",
      expected: efectivoTeorico,
      actualValue: closeCash,
      onActualChange: onCloseCashChange,
      inputId: "cr-close-cash",
      autoFocus: true,
    })

    for (const line of cobrosParaCierre) {
      rows.push({
        kind: line.key,
        label: line.label,
        expected: line.total,
        actualValue: closeTreasuryLines[line.key] ?? "0",
        onActualChange: (value) => onCloseTreasuryLineChange(line.key, value),
        inputId: `cr-close-tl-${line.key.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
      })
    }

    return rows
  }, [
    cobrosParaCierre,
    efectivoTeorico,
    closeCash,
    closeTreasuryLines,
    onCloseCashChange,
    onCloseTreasuryLineChange,
  ])

  const canSubmit = closeRows.every((line) =>
    isMoneyInputComplete(line.actualValue),
  )

  const hasAdjustments = closeRows.some((line) => {
    if (!isMoneyInputComplete(line.actualValue)) return false
    return (
      Math.abs(
        closingPaymentDifference(
          parseMoneyInput(line.actualValue),
          line.expected,
        ),
      ) >= 0.01
    )
  })

  const registerName = row?.name?.trim()
  const arqueoNumber = meta?.arqueoNumber

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cashRegisterCloseDialogContentClass}>
        <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {registerName ? `Cerrar caja · ${registerName}` : "Cerrar caja"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Resumen del arqueo y conteo por cuenta al cerrar el turno.
          </DialogDescription>
        </DialogHeader>

        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <CashRegisterDialogTwoColumnBody
            banner={banner}
            left={
              <>
                <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/10 px-4 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      Arqueo #{arqueoNumber || "—"}
                    </h3>
                    <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                      Turno abierto
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <SummaryMetric
                      label="Apertura"
                      value={
                        row?.openedAt
                          ? formatCashRegisterDateTime(row.openedAt)
                          : "—"
                      }
                    />
                    <SummaryMetric
                      label="Usuario de apertura"
                      value={meta?.openedByName ?? "—"}
                    />
                    <SummaryMetric label="Cierre" value="Pendiente" />
                    <SummaryMetric
                      label="Usuario de cierre"
                      value="Pendiente"
                    />
                  </div>

                  {meta?.openingNote ? (
                    <div className="mt-4 border-t border-border/60 pt-3">
                      <p className={sectionLabel}>Nota de apertura</p>
                      <p className="mt-1.5 text-sm text-foreground">
                        {meta.openingNote}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2.5">
                  <CheckoutSectionLabel>Nota de cierre (opcional)</CheckoutSectionLabel>
                  <Textarea
                    id="cr-close-note"
                    value={closeNote}
                    onChange={(e) => onCloseNoteChange(e.target.value)}
                    placeholder="Ej. diferencia con liquidación…"
                    rows={4}
                    className={cn(
                      saleOpChannelFormField,
                      "min-h-[96px] resize-y",
                    )}
                  />
                </div>
              </>
            }
            right={
              <div className="space-y-2.5">
                <CheckoutSectionLabel>Conteo para cerrar</CheckoutSectionLabel>
                <ClosePaymentMethodsTable rows={closeRows} />
                {hasAdjustments ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Las diferencias se registrarán en contabilidad al confirmar,
                    imputadas a la cuenta correspondiente.
                  </p>
                ) : null}
              </div>
            }
          />

          <CheckoutDialogFooter
            onCancel={() => onOpenChange(false)}
            cancelDisabled={saving}
            primary={{
              label: "Cerrar caja",
              onClick: () => formRef.current?.requestSubmit(),
              disabled: !canSubmit,
              loading: saving,
              loadingLabel: "Cerrando…",
            }}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
