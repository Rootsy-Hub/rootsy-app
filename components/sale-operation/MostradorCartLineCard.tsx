"use client"

import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import { SaleOperationCartQuantityStepper } from "@/components/sale-operation/SaleOperationCartQuantityStepper"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpDialogDestructiveBtn,
  saleOpDialogFooter,
  saleOpDialogGhostBtn,
  saleOpDialogHeader,
  saleOpDialogPrimaryBtn,
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteCartClass,
  saleOpImporteCartMutedClass,
} from "@/components/sale-operation/saleOperationStyles"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  comboComponentCommentKey,
  pricingForMostradorRow,
  productDescriptionForMostradorRow,
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import {
  normalizeCartLineDiscountDraftForApply,
  type MostradorCartLineEditInput,
} from "@/lib/menuCartLineMerge"
import { cn } from "@/lib/utils"
import { Banknote, Hash, MessageSquare, Percent, Trash2 } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"

type Props = {
  row: MostradorCartDisplayRow
  overrides: OperationCartLineOverrideState
  onApplyEdits: (input: MostradorCartLineEditInput) => void
  onRemove: () => void
  grouped?: boolean
}

function discountSnapshot(
  mode: "porcentaje" | "fijo",
  draft: string,
  suppressed: boolean,
) {
  const normalized = normalizeCartLineDiscountDraftForApply(
    suppressed ? "" : draft,
  )
  return {
    mode,
    draft: normalized.draft,
    suppressCatalog: normalized.suppressCatalog,
  }
}

function EditSection({
  title,
  icon: Icon,
  children,
  disabled,
  disabledHint,
}: {
  title: string
  icon: typeof Percent
  children: ReactNode
  disabled?: boolean
  disabledHint?: string
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-slate-400" aria-hidden />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {title}
        </h3>
      </div>
      {disabled ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          {disabledHint}
        </p>
      ) : (
        children
      )}
    </section>
  )
}

export function MostradorCartLineCard({
  row,
  overrides,
  onApplyEdits,
  onRemove,
}: Props) {
  const {
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  } = overrides

  const [open, setOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [quantityDraft, setQuantityDraft] = useState(row.cantidad)
  const [discountModeDraft, setDiscountModeDraft] = useState<
    "porcentaje" | "fijo"
  >("porcentaje")
  const [discountDraft, setDiscountDraft] = useState("")
  const baselineCantidadRef = useRef(row.cantidad)
  const initialCommentRef = useRef("")
  const initialDiscountRef = useRef({
    mode: "porcentaje" as "porcentaje" | "fijo",
    draft: "",
    suppressCatalog: true,
  })

  const commentStorageKey =
    row.variant === "combo_component" && row.comboComponentKey
      ? comboComponentCommentKey(row.cartLineId, row.comboComponentKey)
      : row.cartLineId
  const comentario = itemComentarios[commentStorageKey] ?? row.comment ?? ""
  const pricing = pricingForMostradorRow(row, {
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  })

  const descuentoSuprimido = itemDescuentoSuprimido[row.cartLineId] === true
  const descuentoRaw = itemDescuentoDraft[row.cartLineId] ?? ""
  const tieneComentario = comentario.trim().length > 0
  const tieneDescuentoVisual =
    !row.hidePrice &&
    pricing.precioBase > pricing.precioFinal &&
    pricing.precioFinal >= 0
  const showPrice = !row.hidePrice

  const canChangeQuantity =
    row.variant !== "combo_component" && !row.quantityDealApplicationId
  const canDiscount = !row.discountEditingDisabled
  const canComment = !row.commentEditingDisabled
  const quantityDisabledHint =
    row.variant === "combo_component"
      ? "La cantidad de componentes de combo no se edita por separado."
      : "La cantidad está definida por la promoción. Eliminá la promo para quitar estos ítems."

  const productoDescripcion = productDescriptionForMostradorRow(row)

  const openModal = () => {
    baselineCantidadRef.current = row.cantidad
    setQuantityDraft(row.cantidad)
    initialCommentRef.current = comentario
    setCommentDraft(comentario)
    const mode = itemDescuentoModo[row.cartLineId] ?? "porcentaje"
    const draft = descuentoSuprimido ? "" : descuentoRaw
    initialDiscountRef.current = discountSnapshot(
      mode,
      draft,
      descuentoSuprimido,
    )
    setDiscountModeDraft(mode)
    setDiscountDraft(draft)
    setOpen(true)
  }

  const closeModal = () => setOpen(false)

  const handleDone = () => {
    const hasQuantityEdit =
      canChangeQuantity && quantityDraft !== baselineCantidadRef.current
    const hasCommentEdit = canComment && commentDraft !== initialCommentRef.current
    const nextDiscount = discountSnapshot(
      discountModeDraft,
      discountDraft,
      false,
    )
    const hasDiscountEdit =
      canDiscount &&
      (nextDiscount.mode !== initialDiscountRef.current.mode ||
        nextDiscount.draft !== initialDiscountRef.current.draft ||
        nextDiscount.suppressCatalog !==
          initialDiscountRef.current.suppressCatalog)

    if (hasQuantityEdit || hasCommentEdit || hasDiscountEdit) {
      onApplyEdits({
        cartLineId: row.cartLineId,
        cartLineTotalCantidad: row.cartLineTotalCantidad ?? null,
        sliceUnits: row.cantidad,
        commentStorageKey,
        quantityDelta: quantityDraft - baselineCantidadRef.current,
        comment: commentDraft,
        hasQuantityEdit,
        hasCommentEdit,
        hasDiscountEdit,
        discountMode: discountModeDraft,
        discountDraft,
      })
    }

    closeModal()
  }

  const handleRemove = () => {
    onRemove()
    closeModal()
  }

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={openModal}
          className={cn(
            "grid w-full grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-3 px-3 py-2.5 text-left transition-colors",
            "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300/80",
          )}
          aria-label={`Editar ${row.nombre}`}
        >
          <span className="pt-0.5 text-sm font-bold tabular-nums text-slate-900">
            {row.cantidad}
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-snug text-slate-900">
              {row.nombre}
            </span>
            {productoDescripcion ? (
              <span className="mt-0.5 block truncate text-xs leading-snug text-slate-500">
                {productoDescripcion}
              </span>
            ) : null}
          </span>

          <span className="pt-0.5 text-right">
            {showPrice ? (
              <>
                {tieneDescuentoVisual ? (
                  <span
                    className={cn(
                      saleOpImporteCartMutedClass,
                      "block text-[10px] line-through",
                    )}
                  >
                    {saleOpFmt.format(pricing.precioBase)}
                  </span>
                ) : null}
                <span className={saleOpImporteCartClass}>
                  {saleOpFmt.format(pricing.precioFinal)}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-400">—</span>
            )}
          </span>
        </button>

        {tieneComentario ? (
          <div className="border-t border-dashed border-slate-200/80 bg-slate-50/80 px-3 py-2">
            <p className="text-[11px] leading-snug text-slate-600">
              <MessageSquare
                className="mr-1 inline size-3 -translate-y-px text-slate-400"
                aria-hidden
              />
              {comentario.trim()}
            </p>
          </div>
        ) : null}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) closeModal()
        }}
      >
        <DialogContent className={saleOpDialogContentMd}>
          <DialogHeader className={saleOpDialogHeader}>
            <DialogTitle>{row.nombre}</DialogTitle>
            <DialogDescription>Editá cantidad, comentario o descuento.</DialogDescription>
          </DialogHeader>

          <div className={cn(saleOpDialogBody, "space-y-5")}>
            <EditSection
              title="Cantidad"
              icon={Hash}
              disabled={!canChangeQuantity}
              disabledHint={quantityDisabledHint}
            >
              <div className="flex justify-center py-1">
                <SaleOperationCartQuantityStepper
                  nombre={row.nombre}
                  cantidad={quantityDraft}
                  onDecrease={() =>
                    setQuantityDraft((prev) => Math.max(1, prev - 1))
                  }
                  onIncrease={() => setQuantityDraft((prev) => prev + 1)}
                />
              </div>
            </EditSection>

            <EditSection
              title="Comentario"
              icon={MessageSquare}
              disabled={!canComment}
              disabledHint="Este ítem no admite comentario."
            >
              <Textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Ej: sin cebolla, bien cocido..."
                rows={3}
                className="resize-none"
              />
            </EditSection>

            <EditSection
              title="Descuento"
              icon={Percent}
              disabled={!canDiscount}
              disabledHint="El descuento está incluido en la promoción aplicada."
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 flex-1",
                      discountModeDraft === "porcentaje" &&
                        "border-primary/40 bg-primary/5",
                    )}
                    onClick={() => setDiscountModeDraft("porcentaje")}
                  >
                    <Percent className="size-3.5" aria-hidden />
                    Porcentaje
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 flex-1",
                      discountModeDraft === "fijo" &&
                        "border-primary/40 bg-primary/5",
                    )}
                    onClick={() => setDiscountModeDraft("fijo")}
                  >
                    <Banknote className="size-3.5" aria-hidden />
                    Monto fijo
                  </Button>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                    {discountModeDraft === "porcentaje" ? (
                      <Percent className="size-4" />
                    ) : (
                      <span className={cn(saleOpImporteBaseClass, "text-xs")}>
                        $
                      </span>
                    )}
                  </span>
                  <Input
                    value={discountDraft}
                    onChange={(e) => {
                      const raw = e.target.value
                      if (!/^\d*$/.test(raw)) return
                      setDiscountDraft(raw)
                    }}
                    placeholder={
                      discountModeDraft === "porcentaje" ? "Ej: 10" : "Ej: 500"
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-10 pl-9"
                  />
                </div>
              </div>
            </EditSection>

            <div className="border-t border-slate-200/80 pt-4">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  saleOpDialogDestructiveBtn,
                  "h-10 w-full justify-center gap-2",
                )}
                onClick={handleRemove}
              >
                <Trash2 className="size-4" aria-hidden />
                Eliminar del pedido
              </Button>
            </div>
          </div>

          <DialogFooter className={saleOpDialogFooter}>
            <Button
              type="button"
              variant="ghost"
              className={saleOpDialogGhostBtn}
              onClick={closeModal}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className={saleOpDialogPrimaryBtn}
              onClick={handleDone}
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
