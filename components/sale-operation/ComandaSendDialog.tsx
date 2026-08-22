"use client"

import type { PendingComandaItem } from "@/app/[siteId]/[popId]/comandas/comandasTypes"
import { CheckoutSectionLabel } from "@/components/checkout/CheckoutFormFields"
import {
  saleFinalizeDialogPartialAmountClass,
  saleFinalizeDialogPartialCheckClass,
  saleFinalizeDialogPartialNameClass,
  saleFinalizeDialogPartialRowClass,
  saleFinalizeDialogPartialStepperButtonClass,
  saleFinalizeDialogPartialStepperClass,
  saleFinalizeDialogPartialUnitsClass,
} from "@/components/checkout/saleFinalizeDialogStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import { RootsFormControlInput } from "@/components/rootsy-form/RootsFormControlInput"
import { RootsFormControlTextarea } from "@/components/rootsy-form/RootsFormControlTextarea"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { MessageSquare, Minus, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contextLabel: "mesa" | "pedido"
  items: PendingComandaItem[]
  loading?: boolean
  submitting?: boolean
  submitError?: string | null
  onConfirm: (input: {
    quantities: Record<string, number>
    stationComments: Record<string, string>
  }) => void | Promise<void>
}

function selectedQty(
  selection: Record<string, number>,
  item: PendingComandaItem,
): number {
  const raw = selection[item.cartLineId] ?? 0
  return Math.min(item.quantity, Math.max(0, Math.round(raw)))
}

export function ComandaSendDialog({
  open,
  onOpenChange,
  contextLabel,
  items,
  loading = false,
  submitting = false,
  submitError = null,
  onConfirm,
}: Props) {
  const [selection, setSelection] = useState<Record<string, number>>({})
  const [stationComments, setStationComments] = useState<Record<string, string>>(
    {},
  )

  useEffect(() => {
    if (!open || loading) {
      setSelection({})
      setStationComments({})
      return
    }
    setSelection(
      Object.fromEntries(items.map((item) => [item.cartLineId, item.quantity])),
    )
    setStationComments({})
  }, [open, loading, items])

  const visibleItems = loading ? [] : items

  const selectedItems = useMemo(
    () =>
      visibleItems
        .map((item) => ({ item, qty: selectedQty(selection, item) }))
        .filter((entry) => entry.qty > 0),
    [visibleItems, selection],
  )

  const stations = useMemo(() => {
    const map = new Map<
      string,
      { stationId: string; stationName: string; count: number }
    >()
    for (const { item, qty } of selectedItems) {
      const current = map.get(item.stationId)
      if (current) {
        current.count += qty
        continue
      }
      map.set(item.stationId, {
        stationId: item.stationId,
        stationName: item.stationName,
        count: qty,
      })
    }
    return [...map.values()]
  }, [selectedItems])

  const selectedUnitCount = selectedItems.reduce((sum, entry) => sum + entry.qty, 0)

  const setItemQty = (item: PendingComandaItem, nextQty: number) => {
    const clamped = Math.max(0, Math.min(item.quantity, Math.round(nextQty)))
    setSelection((prev) => ({ ...prev, [item.cartLineId]: clamped }))
  }

  const toggleItem = (item: PendingComandaItem, checked: boolean) => {
    setItemQty(item, checked ? item.quantity : 0)
  }

  const itemsList =
    visibleItems.length === 0 ? (
      <p className="py-2 font-canopy text-sm text-[var(--rootsy-bruma-500)]">
        No hay ítems sin comandar.
      </p>
    ) : (
      <ul className={saleFinalizeDialogPartialUnitsClass}>
        {visibleItems.map((item) => {
          const qty = selectedQty(selection, item)
          const selected = qty > 0
          const showQuantityStepper = item.quantity > 1
          const comment = item.comment.trim()
          return (
            <li
              key={item.cartLineId}
              role="checkbox"
              aria-checked={selected}
              aria-label={`Seleccionar ${item.recipeName}`}
              tabIndex={0}
              onClick={() => toggleItem(item, !selected)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  toggleItem(item, !selected)
                }
              }}
              className={cn(saleFinalizeDialogPartialRowClass, "items-start")}
            >
              <span
                className={cn(saleFinalizeDialogPartialCheckClass(selected), "mt-0.5")}
                aria-hidden
              >
                ✓
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(saleFinalizeDialogPartialNameClass(selected), "block")}
                  title={item.recipeName}
                >
                  {item.recipeName}
                </span>
                {comment ? (
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px] font-medium leading-snug",
                      selected
                        ? "text-[var(--rootsy-bruma-700)]"
                        : "text-[var(--rootsy-bruma-500)]",
                    )}
                  >
                    <MessageSquare
                      className="mr-1 inline size-3 -translate-y-px text-[var(--rootsy-bruma-600)]"
                      aria-hidden
                    />
                    {comment}
                  </span>
                ) : null}
              </span>
              {showQuantityStepper ? (
                <div
                  className={saleFinalizeDialogPartialStepperClass}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label={`Quitar una unidad de ${item.recipeName}`}
                    disabled={qty <= 0}
                    onClick={() => setItemQty(item, qty - 1)}
                    className={saleFinalizeDialogPartialStepperButtonClass}
                  >
                    <Minus className="size-3.5" aria-hidden />
                  </button>
                  <span className="min-w-5 text-center font-numeric text-xs tabular-nums text-[var(--rootsy-bruma-700)]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Agregar una unidad de ${item.recipeName}`}
                    disabled={qty >= item.quantity}
                    onClick={() => setItemQty(item, qty + 1)}
                    className={saleFinalizeDialogPartialStepperButtonClass}
                  >
                    <Plus className="size-3.5" aria-hidden />
                  </button>
                </div>
              ) : null}
              <span className={saleFinalizeDialogPartialAmountClass(selected)}>
                {item.stationName}
              </span>
            </li>
          )
        })}
      </ul>
    )

  const stationNoteValue = (stationId: string) =>
    stationComments[stationId] ?? ""

  const setStationNote = (stationId: string, value: string) => {
    setStationComments((prev) => ({ ...prev, [stationId]: value }))
  }

  const stationsList =
    stations.length === 0 ? (
      <p className="font-canopy text-sm text-[var(--rootsy-bruma-500)]">
        Tildá ítems a la derecha para armar el envío.
      </p>
    ) : (
      <ul className="space-y-3">
        {stations.map((station) => (
          <li key={station.stationId} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                {station.stationName}
              </p>
              <p className="font-canopy text-[11px] text-[var(--rootsy-bruma-500)]">
                {station.count} {station.count === 1 ? "ítem" : "ítems"}
              </p>
            </div>
            <div className="lg:hidden">
              <RootsFormControlInput
                value={stationNoteValue(station.stationId)}
                onChange={(event) =>
                  setStationNote(station.stationId, event.target.value)
                }
                placeholder="Nota para esta isla (opcional)"
              />
            </div>
            <div className="hidden lg:block">
              <RootsFormControlTextarea
                rows={2}
                value={stationNoteValue(station.stationId)}
                onChange={(event) =>
                  setStationNote(station.stationId, event.target.value)
                }
                placeholder="Nota para esta isla (opcional)"
              />
            </div>
          </li>
        ))}
      </ul>
    )

  const stationsPanel = (
    <div
      className={cn(
        "space-y-3",
        "lg:rounded-xl lg:border lg:border-[var(--rootsy-bruma-200)] lg:bg-white lg:p-3.5",
      )}
    >
      <CheckoutSectionLabel>Estaciones</CheckoutSectionLabel>
      {stationsList}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="twoCol" className="flex flex-col sm:!max-w-4xl">
        <RootsDialogHeader title={`Enviar comanda de ${contextLabel}`} />

        {loading ? (
          <RootsDialogBody className="flex min-h-[280px] flex-1 items-center justify-center">
            <RootsDialogLoadingState message="Cargando ítems a comandar" />
          </RootsDialogBody>
        ) : (
          <RootsDialogBody className="!overflow-hidden grid min-h-0 flex-1 gap-4 lg:min-h-[420px] lg:grid-cols-2">
            <div className="min-h-0 min-w-0 space-y-4 overflow-y-auto overscroll-contain">
              {submitError ? (
                <RootsDialogErrorBanner>{submitError}</RootsDialogErrorBanner>
              ) : null}
              {stationsPanel}
              <div className="lg:hidden">
                <div
                  className="border-t border-[var(--rootsy-bruma-200)] pt-4"
                  aria-hidden
                />
                <CheckoutSectionLabel>Ítems a comandar</CheckoutSectionLabel>
                <div className="mt-2.5">{itemsList}</div>
              </div>
            </div>
            <div className="hidden min-h-0 min-w-0 overflow-y-auto overscroll-contain lg:block">
              <CheckoutSectionLabel>Ítems a comandar</CheckoutSectionLabel>
              <div className="mt-2.5">{itemsList}</div>
            </div>
          </RootsDialogBody>
        )}

        <RootsDialogDualActionFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel="Cancelar"
          confirmLabel="Enviar comanda"
          confirmLoadingLabel="Enviando…"
          onConfirm={() =>
            void onConfirm({
              quantities: Object.fromEntries(
                selectedItems.map(({ item, qty }) => [item.cartLineId, qty]),
              ),
              stationComments,
            })
          }
          confirmDisabled={submitting || selectedUnitCount === 0 || loading}
          confirmLoading={submitting}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
