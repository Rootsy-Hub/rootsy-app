"use client"

import type {
  MenuCatalogPromotion,
  MenuCatalogPromotionOption,
  MenuCatalogPromotionSlot,
} from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import {
  priceComboPromotion,
  type PromotionCartSelection,
} from "@/lib/promotionPricing"
import { cn } from "@/lib/utils"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { Check } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Props = {
  open: boolean
  promotion: MenuCatalogPromotion | null
  onOpenChange: (open: boolean) => void
  onConfirm: (selections: PromotionCartSelection[]) => void
}

function optionValue(option: MenuCatalogPromotionOption) {
  return `${option.kind}:${option.refId}`
}

function slotHeading(slot: MenuCatalogPromotionSlot) {
  if (slot.quantity > 1) return `${slot.label} × ${slot.quantity}`
  return slot.label
}

function comboDealLabel(promotion: MenuCatalogPromotion) {
  if (promotion.pricingMode === "fixed_total" && promotion.fixedPrice != null) {
    return saleOpFmt.format(promotion.fixedPrice)
  }
  if (promotion.pricingMode === "percent_off" && promotion.discountValue != null) {
    return `${promotion.discountValue}% off`
  }
  if (promotion.pricingMode === "fixed_off" && promotion.discountValue != null) {
    return `${saleOpFmt.format(promotion.discountValue)} off`
  }
  return promotion.pricingLabel.trim() || null
}

export function PromotionComboWizard({
  open,
  promotion,
  onOpenChange,
  onConfirm,
}: Props) {
  const [selectionBySlot, setSelectionBySlot] = useState<
    Record<string, string>
  >({})

  const slots = promotion?.slots ?? []

  useEffect(() => {
    if (!open || !promotion) {
      setSelectionBySlot({})
      return
    }

    const next: Record<string, string> = {}
    for (const slot of promotion.slots) {
      if (slot.options.length === 1) {
        next[slot.id] = optionValue(slot.options[0])
      }
    }
    setSelectionBySlot(next)
  }, [open, promotion])

  const selections = useMemo((): PromotionCartSelection[] => {
    if (!promotion) return []
    return slots
      .map((slot) => {
        const value = selectionBySlot[slot.id]
        if (!value) return null
        const i = value.indexOf(":")
        if (i <= 0) return null
        const kind = value.slice(0, i) as "article" | "recipe"
        const refId = value.slice(i + 1)
        const opt = slot.options.find(
          (o) => o.kind === kind && o.refId === refId,
        )
        if (!opt) return null
        return {
          slotId: slot.id,
          slotLabel: slot.label,
          kind: opt.kind,
          refId: opt.refId,
          name: opt.name,
          listUnitPrice: opt.salePrice,
          slotQuantity: slot.quantity,
          iva: opt.iva,
        }
      })
      .filter((s): s is PromotionCartSelection => s != null)
  }, [promotion, selectionBySlot, slots])

  const canConfirm =
    promotion != null && selections.length === slots.length && slots.length > 0

  const pendingSlots = slots.filter((slot) => !selectionBySlot[slot.id])
  const pricedCombo =
    promotion && canConfirm
      ? priceComboPromotion(promotion, selections, 1)
      : null
  const dealLabel = promotion ? comboDealLabel(promotion) : null
  const showOptionPrice = promotion?.pricingMode !== "fixed_total"

  const handleOpenChange = (next: boolean) => {
    if (!next) setSelectionBySlot({})
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm(selections)
    setSelectionBySlot({})
    onOpenChange(false)
  }

  const confirmHint =
    pendingSlots.length === 1
      ? `Elegí ${pendingSlots[0].label} para agregar`
      : pendingSlots.length > 1
        ? "Elegí una opción en cada ítem"
        : undefined

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <RootsDialogContent
        size="wide"
        className="flex max-h-[min(90vh,720px)] flex-col"
      >
        <RootsDialogHeader
          open={open}
          title={promotion?.name ?? "Combo"}
          description={
            dealLabel
              ? `Elegí una opción en cada ítem · ${dealLabel}`
              : "Elegí una opción en cada ítem."
          }
        />

        <RootsDialogBody className="space-y-5">
          {slots.map((slot, index) => {
            const selectedValue = selectionBySlot[slot.id] ?? ""
            const selectedOption = slot.options.find(
              (option) => optionValue(option) === selectedValue,
            )
            const done = selectedOption != null
            const optionsScroll = slot.options.length > 5

            return (
              <section key={slot.id} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                        done
                          ? "bg-[var(--rootsy-savia-600)] text-white"
                          : "border border-[var(--rootsy-bruma-200)] bg-white text-[var(--rootsy-bruma-500)]",
                      )}
                    >
                      {done ? (
                        <Check className="size-3.5" strokeWidth={2.5} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <h3 className="truncate font-canopy text-sm font-semibold tracking-[-0.01em] text-[var(--rootsy-bruma-900)]">
                      {slotHeading(slot)}
                    </h3>
                  </div>
                  <p
                    className={cn(
                      "max-w-[46%] truncate text-right text-xs leading-4",
                      done
                        ? "font-medium text-[var(--rootsy-savia-700)]"
                        : "text-[var(--rootsy-bruma-400)]",
                    )}
                  >
                    {selectedOption?.name ?? "Elegí una"}
                  </p>
                </div>

                {slot.options.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] px-3.5 py-3 text-xs leading-snug text-[var(--rootsy-bruma-500)]">
                    Este ítem no tiene opciones cargadas.
                  </p>
                ) : (
                  <div
                    role="listbox"
                    aria-label={slot.label}
                    aria-required
                    className={cn(
                      "grid gap-2",
                      optionsScroll &&
                        "max-h-56 overflow-y-auto overscroll-contain pr-0.5",
                    )}
                  >
                    {slot.options.map((option) => {
                      const value = optionValue(option)
                      return (
                        <CheckoutOptionCard
                          key={value}
                          title={option.name}
                          subtitle={
                            showOptionPrice
                              ? saleOpFmt.format(option.salePrice)
                              : undefined
                          }
                          selected={selectedValue === value}
                          trailing="check"
                          onClick={() =>
                            setSelectionBySlot((prev) => ({
                              ...prev,
                              [slot.id]: value,
                            }))
                          }
                        />
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </RootsDialogBody>

        <CheckoutDialogFooter
          onCancel={() => handleOpenChange(false)}
          primary={{
            label: pricedCombo
              ? `Agregar · ${saleOpFmt.format(pricedCombo.promoTotal)}`
              : "Agregar al pedido",
            onClick: handleConfirm,
            disabled: !canConfirm,
            title: confirmHint,
          }}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
