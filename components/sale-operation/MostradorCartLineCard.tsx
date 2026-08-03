"use client"

import { CartLineScrollTarget } from "@/components/sale-operation/CartLineScrollTarget"
import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutDiscountModeSegment,
  CheckoutFieldHint,
  CheckoutNumericValueField,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
  type CheckoutDiscountMode,
} from "@/components/checkout/CheckoutFormFields"
import { CartLineSubtitleRow } from "@/components/sale-operation/CartLineSubtitleRow"
import {
  CartLineQuantityLabel,
  cartLineRowGridClass,
  cartLineRowGridNoPriceClass,
} from "@/components/sale-operation/CartLineQuantityLabel"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
  saleOpCartLineDividerTopClass,
  saleOpDialogHeader,
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { getRowPaymentStatus } from "@/lib/partialCheckoutSelection"
import {
  labelUnitOfMeasure,
  shortUnitOfMeasure,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { Banknote, CheckCircle2, Hash, MessageSquare, Percent, Trash2 } from "lucide-react"
import { useId, useRef, useState } from "react"

type Props = {
  row: MostradorCartDisplayRow
  overrides: OperationCartLineOverrideState
  paidPartialUnits?: Record<string, number>
  onApplyEdits: (input: MostradorCartLineEditInput) => void
  onRemove: () => void
  grouped?: boolean
}

const QUANTITY_INPUT_MAX_LEN = 11

function formatQuantityForInput(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "1"
  const rounded = Math.round(n * 1e6) / 1e6
  if (Number.isInteger(rounded)) return String(rounded)
  return String(rounded).replace(".", ",")
}

function parseQuantityDraft(raw: string, fallback: number): number {
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  const n = Number.parseFloat(trimmed.replace(",", "."))
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.round(n * 1e6) / 1e6
}

function isValidQuantityInput(raw: string): boolean {
  if (raw.length > QUANTITY_INPUT_MAX_LEN) return false
  return /^\d*[.,]?\d*$/.test(raw)
}

function unitOfMeasureForRow(row: MostradorCartDisplayRow): string {
  if (row.kind === "article") {
    return row.producto?.unitOfMeasure?.trim() || "unidad"
  }
  return "unidad"
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

export function MostradorCartLineCard({
  row,
  overrides,
  paidPartialUnits = {},
  onApplyEdits,
  onRemove,
}: Props) {
  const paymentStatus = getRowPaymentStatus(row, paidPartialUnits)
  const {
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  } = overrides

  const [open, setOpen] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [quantityDraft, setQuantityDraft] = useState(() =>
    formatQuantityForInput(row.cantidad),
  )
  const [discountModeDraft, setDiscountModeDraft] = useState<
    CheckoutDiscountMode
  >("porcentaje")
  const [discountDraft, setDiscountDraft] = useState("")
  const quantityFieldId = useId()
  const commentFieldId = useId()
  const discountFieldId = useId()
  const baselineCantidadRef = useRef(row.cantidad)
  const initialCommentRef = useRef("")
  const initialDiscountRef = useRef({
    mode: "porcentaje" as CheckoutDiscountMode,
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
  const showDescripcion = Boolean(productoDescripcion?.trim())
  const unitOfMeasure = unitOfMeasureForRow(row)
  const unitOfMeasureSuffix = shortUnitOfMeasure(unitOfMeasure)
  const unitOfMeasureLabel = labelUnitOfMeasure(unitOfMeasure)

  const isCartLineLocked =
    row.paidLocked === true ||
    paymentStatus.isFullyPaid ||
    paymentStatus.isPartiallyPaid

  const openModal = () => {
    if (isCartLineLocked) return
    baselineCantidadRef.current = row.cantidad
    setQuantityDraft(formatQuantityForInput(row.cantidad))
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
    const parsedQuantity = parseQuantityDraft(
      quantityDraft,
      baselineCantidadRef.current,
    )
    const hasQuantityEdit =
      canChangeQuantity && parsedQuantity !== baselineCantidadRef.current
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
        quantityDelta: parsedQuantity - baselineCantidadRef.current,
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

  const maxDiscountLine = pricing.precioBase

  const adjustQuantityDraft = (delta: number) => {
    setQuantityDraft((current) => {
      const parsed = parseQuantityDraft(current, row.cantidad)
      const next = Math.round((parsed + delta) * 1e6) / 1e6
      if (next <= 0) return current
      return formatQuantityForInput(next)
    })
  }

  const canDecreaseQuantity =
    parseQuantityDraft(quantityDraft, row.cantidad) - 1 > 0

  const handleDiscountChange = (raw: string) => {
    if (!/^\d*$/.test(raw)) return
    if (raw === "") {
      setDiscountDraft("")
      return
    }
    if (discountModeDraft === "fijo" && Number(raw) > maxDiscountLine) {
      setDiscountModeDraft("porcentaje")
      setDiscountDraft("100")
      return
    }
    const nextValue =
      discountModeDraft === "porcentaje"
        ? String(Math.min(100, Number(raw)))
        : raw
    setDiscountDraft(nextValue)
  }

  const showLinePrice = showPrice && row.promoGroupVariant !== "discount"
  const rowGridLayoutClass =
    showLinePrice || !showPrice ? cartLineRowGridClass : cartLineRowGridNoPriceClass

  const rowContent = (
    <>
      <CartLineQuantityLabel cantidad={row.cantidad} />

      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "block text-sm font-semibold leading-snug text-slate-900",
              paymentStatus.isFullyPaid && "line-through decoration-emerald-600/50",
            )}
          >
            {row.nombre}
          </span>
          {paymentStatus.isFullyPaid ? (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              <CheckCircle2 className="size-3" aria-hidden />
              Pagado
            </span>
          ) : paymentStatus.isPartiallyPaid ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              {paymentStatus.paidQuantity} pagado
            </span>
          ) : null}
        </span>
        <CartLineSubtitleRow
          descripcion={productoDescripcion}
          showDescripcion={showDescripcion}
        />
      </span>

      {showLinePrice || !showPrice ? (
        <span className="pt-0.5 text-right">
          {showLinePrice ? (
            <span className={saleOpImporteCartClass}>
              {saleOpFmt.format(pricing.precioFinal)}
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-400">—</span>
          )}
        </span>
      ) : null}
    </>
  )

  return (
    <>
      <CartLineScrollTarget lineId={row.cartLineId}>
      <div
        className={cn(
          "w-full",
          paymentStatus.isFullyPaid && "bg-emerald-50/70",
          paymentStatus.isPartiallyPaid && "bg-emerald-50/35",
        )}
      >
        {isCartLineLocked ? (
          <div
            className={cn(
              rowGridLayoutClass,
              paymentStatus.isFullyPaid && "opacity-70",
            )}
            aria-label={`${row.nombre} (pagado)`}
          >
            {rowContent}
          </div>
        ) : (
          <button
            type="button"
            onClick={openModal}
            className={cn(
              rowGridLayoutClass,
              "bg-transparent transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300/80",
            )}
            aria-label={`Editar ${row.nombre}`}
          >
            {rowContent}
          </button>
        )}

        {tieneComentario ? (
          <div className={cn(saleOpCartLineDividerTopClass, "bg-slate-50/80 px-3 py-2")}>
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
      </CartLineScrollTarget>

      <Dialog
        open={open && !isCartLineLocked}
        onOpenChange={(next) => {
          if (!next) closeModal()
        }}
      >
        <DialogContent className={saleOpDialogContentMd}>
          <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {row.nombre}
            </DialogTitle>
          </DialogHeader>

          <div
            className={cn(
              saleOpDialogBody,
              "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain",
            )}
          >
            <CheckoutSectionPanel>
              <div className="space-y-2.5">
                <CheckoutSectionLabel>Cantidad</CheckoutSectionLabel>
                {!canChangeQuantity ? (
                  <p className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-3.5 py-2.5 text-xs leading-snug text-muted-foreground">
                    {quantityDisabledHint}
                  </p>
                ) : (
                  <>
                    <CheckoutNumericValueField
                      id={quantityFieldId}
                      icon={Hash}
                      value={quantityDraft}
                      onChange={(raw) => {
                        if (!isValidQuantityInput(raw)) return
                        setQuantityDraft(raw)
                      }}
                      onDecrease={() => adjustQuantityDraft(-1)}
                      onIncrease={() => adjustQuantityDraft(1)}
                      decreaseDisabled={!canDecreaseQuantity}
                      placeholder={formatQuantityForInput(row.cantidad)}
                      suffix={unitOfMeasureSuffix || undefined}
                      inputMode="decimal"
                      maxLength={QUANTITY_INPUT_MAX_LEN}
                      ariaLabel={`Cantidad en ${unitOfMeasureLabel}`}
                    />
                    {unitOfMeasureLabel !== "—" ? (
                      <CheckoutFieldHint>
                        Cantidad en {unitOfMeasureLabel}.
                      </CheckoutFieldHint>
                    ) : null}
                  </>
                )}
              </div>
            </CheckoutSectionPanel>

            <CheckoutSectionPanel>
              {!canComment ? (
                <p className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-3.5 py-2.5 text-xs leading-snug text-muted-foreground">
                  Este ítem no admite comentario.
                </p>
              ) : (
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor={commentFieldId}>Comentario</FieldLabel>
                    <Textarea
                      id={commentFieldId}
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Ej: sin cebolla, bien cocido..."
                      rows={3}
                      className="min-h-22 resize-none rounded-xl"
                    />
                  </Field>
                </FieldGroup>
              )}
            </CheckoutSectionPanel>

            <CheckoutSectionPanel>
              {!canDiscount ? (
                <p className="rounded-xl border border-dashed border-border/70 bg-muted/10 px-3.5 py-2.5 text-xs leading-snug text-muted-foreground">
                  El descuento está incluido en la promoción aplicada.
                </p>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <CheckoutSectionLabel>Tipo de descuento</CheckoutSectionLabel>
                    <CheckoutDiscountModeSegment
                      mode={discountModeDraft}
                      fixedAmountDisabled={maxDiscountLine <= 0}
                      onChange={setDiscountModeDraft}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <CheckoutSectionLabel>Valor</CheckoutSectionLabel>
                    <CheckoutNumericValueField
                      id={discountFieldId}
                      icon={
                        discountModeDraft === "porcentaje" ? Percent : Banknote
                      }
                      value={discountDraft}
                      onChange={handleDiscountChange}
                      suffix={discountModeDraft === "porcentaje" ? "%" : "$"}
                      disabled={
                        discountModeDraft === "fijo" && maxDiscountLine <= 0
                      }
                      ariaLabel={
                        discountModeDraft === "porcentaje"
                          ? "Porcentaje de descuento"
                          : "Monto fijo de descuento"
                      }
                    />
                    {discountModeDraft === "fijo" && maxDiscountLine > 0 ? (
                      <CheckoutFieldHint>
                        Máximo sobre esta línea:{" "}
                        <span className={saleOpImporteBaseClass}>
                          {saleOpFmt.format(maxDiscountLine)}
                        </span>
                      </CheckoutFieldHint>
                    ) : null}
                  </div>
                </>
              )}
            </CheckoutSectionPanel>
          </div>

          <CheckoutDialogFooter
            secondaryAction={{
              label: "Eliminar del pedido",
              icon: Trash2,
              tone: "destructive",
              onClick: handleRemove,
            }}
            primary={{ label: "Listo", onClick: handleDone }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
