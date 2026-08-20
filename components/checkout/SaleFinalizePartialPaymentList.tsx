"use client"

import {
  saleFinalizeDialogPartialAmountClass,
  saleFinalizeDialogPartialCheckClass,
  saleFinalizeDialogPartialNameClass,
  saleFinalizeDialogPartialRowClass,
  saleFinalizeDialogPartialStepperButtonClass,
  saleFinalizeDialogPartialStepperClass,
  saleFinalizeDialogPartialUnitsClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import type { PartialPaymentSelection, PartialPaymentUnit } from "@/lib/partialCheckoutSelection"
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
  const rowTotal =
    unit.isAtomic || qty <= 0
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
      className={saleFinalizeDialogPartialRowClass}
    >
      <span className={saleFinalizeDialogPartialCheckClass(selected)} aria-hidden>
        ✓
      </span>
      <span className={saleFinalizeDialogPartialNameClass(selected)} title={itemTitle}>
        {itemTitle}
      </span>
      {showQuantityStepper ? (
        <div
          className={saleFinalizeDialogPartialStepperClass}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Quitar una unidad de ${unit.label}`}
            disabled={qty <= 0}
            onClick={() => onSetQty(qty - 1)}
            className={saleFinalizeDialogPartialStepperButtonClass}
          >
            <Minus className="size-3.5" aria-hidden />
          </button>
          <span className="min-w-5 text-center font-numeric text-xs tabular-nums text-[var(--rootsy-bruma-700)]">
            {qty}
          </span>
          <button
            type="button"
            aria-label={`Agregar una unidad de ${unit.label}`}
            disabled={qty >= unit.maxSelectable}
            onClick={() => onSetQty(qty + 1)}
            className={saleFinalizeDialogPartialStepperButtonClass}
          >
            <Plus className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
      <span className={saleFinalizeDialogPartialAmountClass(selected)}>
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
      <p className="py-2 font-canopy text-sm text-[var(--rootsy-bruma-500)]">
        No hay ítems pendientes de cobro.
      </p>
    )
  }

  return (
    <ul className={saleFinalizeDialogPartialUnitsClass}>
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
