"use client"

import type { InventoryCostLayerRow } from "@/app/[siteId]/[popId]/inventory/actions"
import { formatInventoryQtyWithUnit } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  RootsFormDateField,
  RootsFormQuantityField,
} from "@/components/rootsy-form"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { Dialog } from "@/components/ui/dialog"
import { labelUnitOfMeasure } from "@/lib/articleItemKind"
import { formatInventoryExpiryDate } from "@/lib/inventory/inventoryExpiry"
import { useEffect, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  layer: InventoryCostLayerRow | null
  banner: string | null
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: { expiresAt: string | null; quantity: number }) => void
}

export function InventoryLayerExpiryDialog({
  open,
  layer,
  banner,
  saving,
  onOpenChange,
  onSubmit,
}: Props) {
  const remaining = layer?.quantityRemaining ?? 0
  const [expiresAt, setExpiresAt] = useState("")
  const [qty, setQty] = useState("1")

  useEffect(() => {
    if (!open || !layer) return
    setExpiresAt(layer.expiresAt ?? "")
    const whole = Number.isInteger(remaining)
      ? String(remaining)
      : String(remaining)
    setQty(whole)
  }, [open, layer, remaining])

  if (!layer) return null

  const parsedQty = Number.parseFloat(qty.replace(",", "."))
  const canSubmit =
    Number.isFinite(parsedQty) && parsedQty > 0 && parsedQty <= remaining + 1e-6
  const splits = canSubmit && parsedQty < remaining - 1e-6
  const unitLabel = labelUnitOfMeasure(layer.unitOfMeasure)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({
      expiresAt: expiresAt.trim() || null,
      quantity: parsedQty,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title={layer.articleName}
            description={`${layer.locationName} · hay ${formatInventoryQtyWithUnit(remaining, layer.unitOfMeasure)}`}
          />
          <RootsDialogBody>
            {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
            <RootsFormDateField
              label="Vencimiento"
              value={expiresAt}
              onChange={setExpiresAt}
              placeholder="Sin fecha"
              hint={
                layer.expiresAt
                  ? `Hoy: ${formatInventoryExpiryDate(layer.expiresAt)}`
                  : "Opcional. Si no hay fecha, el lote sale último."
              }
            />
            {expiresAt ? (
              <RootsSubtleButton
                type="button"
                size="compact"
                onClick={() => setExpiresAt("")}
              >
                Quitar fecha
              </RootsSubtleButton>
            ) : null}
            <RootsFormQuantityField
              label={unitLabel ? `Cantidad en ${unitLabel}` : "Cantidad"}
              id="inv-expiry-qty"
              value={qty}
              onChange={setQty}
              max={Math.max(1, remaining)}
              hint={
                splits
                  ? `Se parte el lote: ${formatInventoryQtyWithUnit(parsedQty, layer.unitOfMeasure)} con esta fecha y el resto queda como está.`
                  : "Si ponés menos que el restante, se parte el lote."
              }
            />
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmType="submit"
            confirmLabel={splits ? "Partir lote" : "Guardar fecha"}
            confirmDisabled={saving || !canSubmit}
            confirmLoading={saving}
            confirmLoadingLabel="Guardando…"
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
