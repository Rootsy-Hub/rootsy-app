"use client"

import type { CashRegisterRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import {
  formatCashRegisterDateTime,
  formatCashRegisterMoney,
} from "@/app/[siteId]/[popId]/cash-registers/cashRegisterFormatters"
import {
  dataWorkspaceEntityCardStatLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormGrid,
  RootsFormPrefixedInput,
  RootsFormTextareaField,
  rootsFormColumnClass,
  rootsFormFieldHintClass,
  rootsFormFieldLabelClass,
} from "@/components/rootsy-form"
import { useMoneyInputField } from "@/components/rootsy-form/useMoneyInputField"
import { Dialog } from "@/components/ui/dialog"
import {
  closingPaymentDifference,
  closingVarianceLabel,
} from "@/lib/cashRegisterCloseSettlement"
import { isMoneyInputComplete, parseMoneyInput } from "@/lib/moneyInput"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import { useMemo, type FormEvent } from "react"

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

function SummaryMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <p className="mt-1.5 truncate font-canopy text-sm font-medium text-[var(--rootsy-bruma-900)]">
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
    const isShort = diff < 0
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
          isShort
            ? "bg-rose-500/10 text-rose-700"
            : "bg-amber-500/10 text-amber-800",
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

function CloseCountMoneyInput({
  id,
  value,
  onChange,
  autoFocus,
  ariaLabel,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  ariaLabel: string
}) {
  const {
    inputRef,
    inputValue,
    handleMouseDown,
    handleFocus,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleBlur,
  } = useMoneyInputField({ value, onChange })

  return (
    <RootsFormPrefixedInput
      ref={inputRef}
      id={id}
      prefix="$"
      numeric
      inputMode="decimal"
      autoComplete="off"
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      value={inputValue}
      className="w-full min-h-9 min-w-[9.5rem]"
      inputClassName="h-9 min-w-0 flex-1 tabular-nums text-right text-sm"
      onMouseDown={handleMouseDown}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  )
}

function ClosePaymentMethodsTable({ rows }: { rows: CloseRowDef[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)] bg-white">
      <ul className="divide-y divide-[var(--rootsy-bruma-200)]">
        {rows.map((line) => (
          <li
            key={line.kind}
            className="grid grid-cols-[minmax(0,1fr)_10.5rem] items-center gap-x-4 px-3 py-3 sm:px-4"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate font-canopy text-sm font-medium text-[var(--rootsy-bruma-900)]">
                {line.label}
              </p>
              <p className="font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                Esperado {formatCashRegisterMoney(line.expected)}
              </p>
              <CloseVarianceBadge
                expected={line.expected}
                actualValue={line.actualValue}
              />
            </div>
            <CloseCountMoneyInput
              id={line.inputId}
              value={line.actualValue}
              onChange={line.onActualChange}
              autoFocus={line.autoFocus}
              ariaLabel={`${line.label} — monto contado`}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ArqueoSummaryPanel({
  arqueoNumber,
  openedAt,
  openedByName,
  openingNote,
}: {
  arqueoNumber?: number | null
  openedAt?: string | null
  openedByName?: string | null
  openingNote?: string | null
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-4 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-canopy text-base font-semibold tracking-tight text-[var(--rootsy-bruma-900)]">
          Arqueo #{arqueoNumber || "—"}
        </h3>
        <span className="rounded-full border border-[color-mix(in_srgb,var(--rootsy-savia-600)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--rootsy-savia-600)_10%,white)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--rootsy-savia-800)]">
          Turno abierto
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SummaryMetric
          label="Apertura"
          value={openedAt ? formatCashRegisterDateTime(openedAt) : "—"}
        />
        <SummaryMetric label="Usuario de apertura" value={openedByName ?? "—"} />
        <SummaryMetric label="Cierre" value="Pendiente" />
        <SummaryMetric label="Usuario de cierre" value="Pendiente" />
      </div>

      {openingNote ? (
        <div className="mt-4 border-t border-[var(--rootsy-bruma-200)] pt-3">
          <p className={dataWorkspaceEntityCardStatLabelClass}>Nota de apertura</p>
          <p className="mt-1.5 font-canopy text-sm text-[var(--rootsy-bruma-900)]">
            {openingNote}
          </p>
        </div>
      ) : null}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol">
        <RootsDialogHeader
          title={registerName ? `Cerrar caja · ${registerName}` : "Cerrar caja"}
        />
        <RootsDialogForm onSubmit={onSubmit}>
          <RootsDialogBody>
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <RootsFormGrid>
              <div className={rootsFormColumnClass}>
                <ArqueoSummaryPanel
                  arqueoNumber={meta?.arqueoNumber}
                  openedAt={row?.openedAt}
                  openedByName={meta?.openedByName}
                  openingNote={meta?.openingNote}
                />

                <RootsFormTextareaField
                  label="Nota de cierre (opcional)"
                  id="cr-close-note"
                  value={closeNote}
                  onChange={(e) => onCloseNoteChange(e.target.value)}
                  placeholder="Ej. diferencia con liquidación…"
                  rows={4}
                  textareaClassName="min-h-24 resize-y"
                />
              </div>

              <div className={rootsFormColumnClass}>
                <div className="flex flex-col gap-2">
                  <span className={rootsFormFieldLabelClass}>Conteo para cerrar</span>
                  <ClosePaymentMethodsTable rows={closeRows} />
                  {hasAdjustments ? (
                    <p className={rootsFormFieldHintClass}>
                      Las diferencias se registrarán en contabilidad al confirmar,
                      imputadas a la cuenta correspondiente.
                    </p>
                  ) : null}
                </div>
              </div>
            </RootsFormGrid>
          </RootsDialogBody>

          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Cerrar caja"
            confirmLoadingLabel="Cerrando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
