"use client"

import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import { useMemo, useState } from "react"

type Props = {
  open: boolean
  promotion: MenuCatalogPromotion | null
  onOpenChange: (open: boolean) => void
  onConfirm: (selections: PromotionCartSelection[]) => void
}

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{promotion?.name ?? "Promoción"}</DialogTitle>
          <DialogDescription>
            Elegí qué producto o receta va en cada ítem del combo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {slots.map((slot) => (
            <div key={slot.id} className="space-y-1.5">
              <Label>
                {slot.label}
                {slot.quantity > 1 ? ` × ${slot.quantity}` : ""}
              </Label>
              <Select
                value={selectionBySlot[slot.id] ?? ""}
                onValueChange={(v) =>
                  setSelectionBySlot((prev) => ({ ...prev, [slot.id]: v }))
                }
              >
                <SelectTrigger>
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
                            {o.name} · {fmt.format(o.salePrice)}
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
                            {o.name} · {fmt.format(o.salePrice)}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm) return
              onConfirm(selections)
              setSelectionBySlot({})
              onOpenChange(false)
            }}
          >
            Agregar al pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
