"use client"

import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutFieldHint,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import { cn } from "@/lib/utils"
import {
  saleOpChannelFormField,
  saleOpFmt,
} from "@/components/sale-operation/saleOperationStyles"
import { useEffect, useId, useMemo, useState } from "react"

type Props = {
  open: boolean
  promotion: MenuCatalogPromotion | null
  onOpenChange: (open: boolean) => void
  onConfirm: (selections: PromotionCartSelection[]) => void
}

export function PromotionComboWizard({
  open,
  promotion,
  onOpenChange,
  onConfirm,
}: Props) {
  const formId = useId()
  const [selectionBySlot, setSelectionBySlot] = useState<
    Record<string, string>
  >({})

  const slots = promotion?.slots ?? []

  useEffect(() => {
    if (!open) {
      setSelectionBySlot({})
    }
  }, [open])

  useEffect(() => {
    setSelectionBySlot({})
  }, [promotion?.id])

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <RootsDialogContent className="flex flex-col">
        <RootsDialogHeader title={promotion?.name ?? "Promoción"} />

        <RootsDialogBody className="space-y-4">
          <CheckoutFieldHint>
            Elegí qué producto o receta va en cada ítem del combo.
          </CheckoutFieldHint>

          <CheckoutSectionPanel>
            {slots.map((slot, index) => {
              const fieldId = `${formId}-slot-${slot.id}`
              const slotLabel =
                slot.quantity > 1 ? `${slot.label} × ${slot.quantity}` : slot.label

              return (
                <div
                  key={slot.id}
                  className={cn("space-y-2.5", index > 0 && "pt-1")}
                >
                  <CheckoutSectionLabel>{slotLabel}</CheckoutSectionLabel>
                  <Select
                    value={selectionBySlot[slot.id] ?? ""}
                    onValueChange={(v) =>
                      setSelectionBySlot((prev) => ({ ...prev, [slot.id]: v }))
                    }
                  >
                    <SelectTrigger
                      id={fieldId}
                      className={cn(
                        saleOpChannelFormField,
                        "h-11 w-full font-normal data-placeholder:text-muted-foreground/70",
                      )}
                    >
                      <SelectValue placeholder="Elegir opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {slot.options.some((o) => o.kind === "article") ? (
                        <SelectGroup>
                          <SelectLabel>Productos</SelectLabel>
                          {slot.options
                            .filter((o) => o.kind === "article")
                            .map((o) => (
                              <SelectItem
                                key={`article:${o.refId}`}
                                value={`article:${o.refId}`}
                              >
                                {o.name} · {saleOpFmt.format(o.salePrice)}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      ) : null}
                      {slot.options.some((o) => o.kind === "recipe") ? (
                        <SelectGroup>
                          <SelectLabel>Recetas</SelectLabel>
                          {slot.options
                            .filter((o) => o.kind === "recipe")
                            .map((o) => (
                              <SelectItem
                                key={`recipe:${o.refId}`}
                                value={`recipe:${o.refId}`}
                              >
                                {o.name} · {saleOpFmt.format(o.salePrice)}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </CheckoutSectionPanel>
        </RootsDialogBody>

        <CheckoutDialogFooter
          onCancel={() => handleOpenChange(false)}
          primary={{
            label: "Agregar al pedido",
            onClick: handleConfirm,
            disabled: !canConfirm,
          }}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
