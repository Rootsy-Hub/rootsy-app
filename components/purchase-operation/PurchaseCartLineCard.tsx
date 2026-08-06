"use client"

import { CartLineScrollTarget } from "@/components/sale-operation/CartLineScrollTarget"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutDiscountModeSegment,
  CheckoutFieldHint,
  CheckoutNumericValueField,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
  CheckoutToggleCard,
  type CheckoutDiscountMode,
} from "@/components/checkout/CheckoutFormFields"
import { CartLineSubtitleRow } from "@/components/sale-operation/CartLineSubtitleRow"
import {
  CartLineQuantityLabel,
  cartLineRowGridClass,
  cartLineRowGridNoPriceClass,
} from "@/components/sale-operation/CartLineQuantityLabel"
import { MostradorCartPromoBanner } from "@/components/sale-operation/MostradorCartPromoBanner"
import {
  saleOpDialogBody,
  saleOpDialogContentMd,
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
import { resolveSaleLineDiscount } from "@/lib/saleLineDiscount"
import { discountGroupBannerLabelFromPricing } from "@/lib/cartLineDiscountBadge"
import {
  labelUnitOfMeasure,
  shortUnitOfMeasure,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import {
  Banknote,
  DollarSign,
  Hash,
  MessageSquare,
  Percent,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { useId, useRef, useState } from "react"

export type PurchaseCartLine = {
  productoId: string
  cantidad: number
  nombre: string
  descripcion?: string | null
  fallbackCost: number
  iva?: number
  unitOfMeasure: string
}

export type PurchaseCartLineOverrides = {
  itemUnitCosts: Record<string, string>
  itemUpdateArticleCost: Record<string, boolean>
  itemDescuentoModo: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft: Record<string, string>
  itemComentarios: Record<string, string>
}

export type PurchaseLineEditInput = {
  productoId: string
  quantity: number
  unitCost: string
  updateArticleCost: boolean
  discountMode: "porcentaje" | "fijo"
  discountDraft: string
  comment: string
  hasQuantityEdit: boolean
  hasCostEdit: boolean
  hasUpdateCostEdit: boolean
  hasDiscountEdit: boolean
  hasCommentEdit: boolean
}

function parseUnitCost(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw.trim().replace(",", "."))
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.round(n * 100) / 100
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

type Props = {
  line: PurchaseCartLine
  overrides: PurchaseCartLineOverrides
  canUpdateArticles: boolean
  onApplyEdits: (input: PurchaseLineEditInput) => void
  onRemove: () => void
}

export function PurchaseCartLineCard({
  line,
  overrides,
  canUpdateArticles,
  onApplyEdits,
  onRemove,
}: Props) {
  const itemId = line.productoId
  const quantityFieldId = useId()
  const costFieldId = useId()
  const discountFieldId = useId()
  const commentFieldId = useId()

  const {
    itemUnitCosts,
    itemUpdateArticleCost,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemComentarios,
  } = overrides

  const [open, setOpen] = useState(false)
  const [quantityDraft, setQuantityDraft] = useState(() =>
    formatQuantityForInput(line.cantidad),
  )
  const [unitCostDraft, setUnitCostDraft] = useState("")
  const [updateCostDraft, setUpdateCostDraft] = useState(false)
  const [commentDraft, setCommentDraft] = useState("")
  const [discountModeDraft, setDiscountModeDraft] =
    useState<CheckoutDiscountMode>("porcentaje")
  const [discountDraft, setDiscountDraft] = useState("")

  const baselineCantidadRef = useRef(line.cantidad)
  const initialUnitCostRef = useRef("")
  const initialUpdateCostRef = useRef(false)
  const initialCommentRef = useRef("")
  const initialDiscountRef = useRef({
    mode: "porcentaje" as CheckoutDiscountMode,
    draft: "",
  })

  const unitCostRaw = itemUnitCosts[itemId] ?? ""
  const unitCost = parseUnitCost(unitCostRaw, line.fallbackCost)
  const descuentoRaw = itemDescuentoDraft[itemId] ?? ""
  const modoItemDescuento = itemDescuentoModo[itemId] ?? "porcentaje"
  const comentario = itemComentarios[itemId] ?? ""

  const linePricing = resolveSaleLineDiscount({
    listUnitPrice: unitCost,
    quantity: line.cantidad,
    manualDiscount:
      descuentoRaw.trim() !== ""
        ? { mode: modoItemDescuento, draft: descuentoRaw }
        : null,
  })

  const lineTotal = linePricing.lineSubtotal
  const tieneDescuentoItem = linePricing.itemDiscountAmount > 0
  const descuentoBannerLabel = discountGroupBannerLabelFromPricing(linePricing)
  const tieneComentario = comentario.trim().length > 0

  const descripcionProducto = line.descripcion?.trim() ?? ""
  const showDescripcion =
    descripcionProducto.length > 0 && descripcionProducto !== "—"

  const draftUnitCost = parseUnitCost(unitCostDraft, line.fallbackCost)
  const parsedQuantityDraft = parseQuantityDraft(quantityDraft, line.cantidad)
  const maxDiscountLine = draftUnitCost * parsedQuantityDraft
  const unitOfMeasureSuffix = shortUnitOfMeasure(line.unitOfMeasure)
  const unitOfMeasureLabel = labelUnitOfMeasure(line.unitOfMeasure)

  const openModal = () => {
    baselineCantidadRef.current = line.cantidad
    setQuantityDraft(formatQuantityForInput(line.cantidad))
    initialUnitCostRef.current = unitCostRaw
    setUnitCostDraft(unitCostRaw)
    initialUpdateCostRef.current = itemUpdateArticleCost[itemId] === true
    setUpdateCostDraft(itemUpdateArticleCost[itemId] === true)
    initialCommentRef.current = comentario
    setCommentDraft(comentario)
    const mode = itemDescuentoModo[itemId] ?? "porcentaje"
    initialDiscountRef.current = { mode, draft: descuentoRaw }
    setDiscountModeDraft(mode)
    setDiscountDraft(descuentoRaw)
    setOpen(true)
  }

  const closeModal = () => setOpen(false)

  const handleDone = () => {
    const parsedQuantity = parseQuantityDraft(
      quantityDraft,
      baselineCantidadRef.current,
    )
    const hasQuantityEdit = parsedQuantity !== baselineCantidadRef.current
    const hasCostEdit = unitCostDraft !== initialUnitCostRef.current
    const hasUpdateCostEdit =
      updateCostDraft !== initialUpdateCostRef.current
    const hasCommentEdit = commentDraft !== initialCommentRef.current
    const hasDiscountEdit =
      discountModeDraft !== initialDiscountRef.current.mode ||
      discountDraft !== initialDiscountRef.current.draft

    if (
      hasQuantityEdit ||
      hasCostEdit ||
      hasUpdateCostEdit ||
      hasCommentEdit ||
      hasDiscountEdit
    ) {
      onApplyEdits({
        productoId: itemId,
        quantity: parsedQuantity,
        unitCost: unitCostDraft,
        updateArticleCost: updateCostDraft,
        discountMode: discountModeDraft,
        discountDraft,
        comment: commentDraft,
        hasQuantityEdit,
        hasCostEdit,
        hasUpdateCostEdit,
        hasDiscountEdit,
        hasCommentEdit,
      })
    }

    closeModal()
  }

  const handleRemove = () => {
    onRemove()
    closeModal()
  }

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

  const adjustQuantityDraft = (delta: number) => {
    setQuantityDraft((current) => {
      const parsed = parseQuantityDraft(current, line.cantidad)
      const next = Math.round((parsed + delta) * 1e6) / 1e6
      if (next <= 0) return current
      return formatQuantityForInput(next)
    })
  }

  const canDecreaseQuantity =
    parseQuantityDraft(quantityDraft, line.cantidad) - 1 > 0

  const rowGridClass = cartLineRowGridClass
  const rowGridNoPriceClass = cartLineRowGridNoPriceClass

  return (
    <>
      <CartLineScrollTarget lineId={line.productoId}>
      <section
        className={cn(
          "w-full border-b border-slate-200/90",
          tieneDescuentoItem && "border-l-[3px] border-l-emerald-400",
        )}
      >
        {tieneDescuentoItem && descuentoBannerLabel ? (
          <MostradorCartPromoBanner
            label={descuentoBannerLabel}
            promoVariant="discount"
            discountMode={modoItemDescuento}
            discountAmount={linePricing.itemDiscountAmount}
            finalTotal={lineTotal}
          />
        ) : null}

        <div
          className={cn(
            tieneDescuentoItem && "bg-gradient-to-b from-emerald-50/35 to-white",
          )}
        >
        <button
          type="button"
          onClick={openModal}
          className={cn(
            tieneDescuentoItem ? rowGridNoPriceClass : rowGridClass,
            "transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300/80",
          )}
          aria-label={`Editar ${line.nombre}`}
        >
          <CartLineQuantityLabel cantidad={line.cantidad} />

          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-snug text-slate-900">
              {line.nombre}
            </span>
            <CartLineSubtitleRow
              descripcion={descripcionProducto}
              showDescripcion={showDescripcion}
            />
          </span>

          {!tieneDescuentoItem ? (
            <span className="pt-0.5 text-right">
              <span className={saleOpImporteCartClass}>
                {saleOpFmt.format(lineTotal)}
              </span>
            </span>
          ) : null}
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
      </section>
      </CartLineScrollTarget>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) closeModal()
        }}
      >
        <DialogContent className={saleOpDialogContentMd}>
          <DialogHeader className={cn(saleOpDialogHeader, "shrink-0")}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {line.nombre}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Cantidad, costo, comentario o descuento de la línea.
            </p>
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
                  placeholder={formatQuantityForInput(line.cantidad)}
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
              </div>

              <div className="space-y-2.5">
                <CheckoutSectionLabel>Costo unitario</CheckoutSectionLabel>
                <CheckoutNumericValueField
                  id={costFieldId}
                  icon={DollarSign}
                  value={unitCostDraft}
                  onChange={(raw) => {
                    if (!/^\d*[.,]?\d*$/.test(raw)) return
                    setUnitCostDraft(raw)
                  }}
                  placeholder={
                    line.fallbackCost > 0 ? String(line.fallbackCost) : "0"
                  }
                  inputMode="decimal"
                  ariaLabel="Costo unitario"
                />
                {line.iva != null && line.iva > 0 ? (
                  <CheckoutFieldHint>
                    IVA {line.iva}% incluido en el costo ingresado.
                  </CheckoutFieldHint>
                ) : null}
              </div>

              {canUpdateArticles ? (
                <CheckoutToggleCard
                  title="Actualizar costo en el artículo"
                  subtitle="Guarda este costo en la ficha del artículo al confirmar la compra."
                  selected={updateCostDraft}
                  onClick={() => setUpdateCostDraft((prev) => !prev)}
                  icon={RefreshCw}
                />
              ) : null}
            </CheckoutSectionPanel>

            <CheckoutSectionPanel>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor={commentFieldId}>Comentario</FieldLabel>
                  <Textarea
                    id={commentFieldId}
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Ej: lote vencimiento, bonificación..."
                    rows={3}
                    className="min-h-22 resize-none rounded-xl"
                  />
                </Field>
              </FieldGroup>
            </CheckoutSectionPanel>

            <CheckoutSectionPanel>
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
                  icon={discountModeDraft === "porcentaje" ? Percent : Banknote}
                  value={discountDraft}
                  onChange={handleDiscountChange}
                  suffix={discountModeDraft === "porcentaje" ? "%" : "$"}
                  disabled={discountModeDraft === "fijo" && maxDiscountLine <= 0}
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
            </CheckoutSectionPanel>
          </div>

          <CheckoutDialogFooter
            secondaryAction={{
              label: "Eliminar de la compra",
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
