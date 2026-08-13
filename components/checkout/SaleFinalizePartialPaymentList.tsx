"use client"

import type { PartialPaymentSelection, PartialPaymentUnit } from "@/lib/partialCheckoutSelection"
import {
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

function roundLineTotal(unit: PartialPaymentUnit, qty: number): number {
  if (unit.unitFinalPrice != null) {
    return Math.round(unit.unitFinalPrice * qty * 100) / 100
  }
  if (unit.maxSelectable > 0) {
    return Math.round((unit.lineFinalTotal / unit.maxSelectable) * qty * 100) / 100
  }
  return unit.lineFinalTotal
}

export function selectionQty(
  selection: PartialPaymentSelection,
  unit: PartialPaymentUnit,
): number {
  const raw = selection[unit.selectionKey] ?? 0
  if (unit.isAtomic) return raw >= 1 ? 1 : 0
  return Math.min(unit.maxSelectable, Math.max(0, raw))
}

function PartialPaymentUnitRow({
  unit,
  qty,
  onToggle,
  onSetQty,
}: {
  unit: PartialPaymentUnit
  qty: number
  onToggle: (checked: boolean) => void
  onSetQty: (qty: number) => void
}) {
  const selected = qty > 0
  const rowTotal = unit.isAtomic
    ? unit.lineFinalTotal
    : roundLineTotal(unit, qty)
  const itemTitle = unit.detail?.trim()
    ? `${unit.label} · ${unit.detail.trim()}`
    : unit.label
  const showQuantityStepper = unit.maxSelectable > 1

  return (
    <li
      role="checkbox"
      aria-checked={selected}
      aria-label={`Seleccionar ${unit.label}`}
      tabIndex={0}
      onClick={() => onToggle(!selected)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onToggle(!selected)
        }
      }}
      className={cn(
        "flex w-full min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rootsy-bruma-50)]",
        selected
          ? "border-[color-mix(in_srgb,var(--rootsy-savia-500)_40%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-500)_8%,white)]"
          : "border-[var(--rootsy-bruma-200)] bg-white hover:border-[var(--rootsy-bruma-300)] hover:bg-[var(--rootsy-bruma-50)]",
      )}
    >
      <span
        className={cn(
          saleOpImporteBaseClass,
          "flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold",
          selected
            ? "border-[var(--rootsy-savia-600)] bg-[var(--rootsy-savia-600)] text-white"
            : "border-[var(--rootsy-bruma-300)] bg-white text-transparent",
        )}
        aria-hidden
      >
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--rootsy-bruma-900)]">
          {itemTitle}
        </p>
        {showQuantityStepper ? (
          <div
            className="mt-1 flex items-center gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={`Quitar una unidad de ${unit.label}`}
              disabled={qty <= 0}
              onClick={() => onSetQty(qty - 1)}
              className="inline-flex size-7 items-center justify-center rounded-md border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-700)] disabled:opacity-40"
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span className="min-w-6 text-center text-xs font-semibold tabular-nums text-[var(--rootsy-bruma-900)]">
              {qty}
            </span>
            <button
              type="button"
              aria-label={`Agregar una unidad de ${unit.label}`}
              disabled={qty >= unit.maxSelectable}
              onClick={() => onSetQty(qty + 1)}
              className="inline-flex size-7 items-center justify-center rounded-md border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-700)] disabled:opacity-40"
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
      <span
        className={cn(
          saleOpImporteCartClass,
          "w-22 shrink-0 text-right text-sm text-[var(--rootsy-bruma-900)]",
        )}
      >
        {saleOpFmt.format(rowTotal)}
      </span>
    </li>
  )
}

type Props = {
  units: PartialPaymentUnit[]
  selection: PartialPaymentSelection
  onSelectionChange: (next: PartialPaymentSelection) => void
}

export function SaleFinalizePartialPaymentList({
  units,
  selection,
  onSelectionChange,
}: Props) {
  const setUnitQty = (unit: PartialPaymentUnit, nextQty: number) => {
    const clamped = unit.isAtomic
      ? nextQty >= 1
        ? 1
        : 0
      : Math.max(0, Math.min(unit.maxSelectable, nextQty))
    onSelectionChange({
      ...selection,
      [unit.selectionKey]: clamped,
    })
  }

  const toggleUnit = (unit: PartialPaymentUnit, checked: boolean) => {
    if (unit.isAtomic) {
      setUnitQty(unit, checked ? 1 : 0)
      return
    }
    setUnitQty(unit, checked ? unit.maxSelectable : 0)
  }

  if (units.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-6 text-center text-sm text-[var(--rootsy-bruma-500)]">
        No hay ítems pendientes de cobro.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {units.map((unit) => (
        <PartialPaymentUnitRow
          key={unit.selectionKey}
          unit={unit}
          qty={selectionQty(selection, unit)}
          onToggle={(checked) => toggleUnit(unit, checked)}
          onSetQty={(nextQty) => setUnitQty(unit, nextQty)}
        />
      ))}
    </ul>
  )
}

export function canConfirmPartialPayment(
  partialPayment: boolean,
  units: PartialPaymentUnit[],
  selection: PartialPaymentSelection,
): boolean {
  if (!partialPayment) return true
  return units.some((unit) => selectionQty(selection, unit) > 0)
}
