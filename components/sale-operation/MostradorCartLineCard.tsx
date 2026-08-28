"use client"

import { RootsNaturePill } from "@/components/rootsy-pill"
import { CartLineScrollTarget } from "@/components/sale-operation/CartLineScrollTarget"
import { useSaleScanInputFocus } from "@/components/sale-operation/SaleScanInputFocusContext"
import {
  layoutsOperarTicketProposalLineAmountClass,
  layoutsOperarTicketProposalLineGridClass,
  layoutsOperarTicketProposalLineMetaClass,
  layoutsOperarTicketProposalLineNameClass,
  layoutsOperarTicketProposalLineThumbClass,
  layoutsOperarTicketProposalQtyClass,
} from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import { LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import type { OperationCartLineOverrideState } from "@/components/sale-operation/OperationCartLineRow"
import { CheckoutDialogFooter } from "@/components/checkout/CheckoutDialogFooter"
import {
  CheckoutFieldHint,
  CheckoutNumericValueField,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
  type CheckoutDiscountMode,
} from "@/components/checkout/CheckoutFormFields"
import { RootsFormSegmentField, RootsFormTextareaField } from "@/components/rootsy-form"
import { CartLineSubtitleRow } from "@/components/sale-operation/CartLineSubtitleRow"
import {
  CartLineQuantityLabel,
  cartLineRowGridClass,
  cartLineRowGridNoPriceClass,
  formatOperarTicketQuantity,
} from "@/components/sale-operation/CartLineQuantityLabel"
import { resolveCatalogCartLinePricing } from "@/components/sale-operation/saleCatalogProduct"
import {
  saleOpCartLineDividerTopClass,
  saleOpFmt,
  saleOpImporteBaseClass,
  saleOpImporteCartClass,
} from "@/components/sale-operation/saleOperationStyles"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import {
  mostradorCartRowCommentKey,
  pricingForMostradorRow,
  productDescriptionForMostradorRow,
  resolveMostradorCartRowComment,
  type MostradorCartDisplayRow,
} from "@/lib/mostradorCartDisplay"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import {
  normalizeCartLineDiscountDraftForApply,
  type MostradorCartLineEditInput,
} from "@/lib/menuCartLineMerge"
import { CartLineComandaStatusBar } from "@/components/sale-operation/CartLineComandaStatusBar"
import { ComandaVoidDialog } from "@/components/sale-operation/ComandaVoidDialog"
import {
  isComandaLocked,
  isComandaVoidable,
  isComandaVoided,
} from "@/lib/comandaCartLine"
import { getRowPaymentStatus } from "@/lib/partialCheckoutSelection"
import {
  labelUnitOfMeasure,
  quantityAllowsDecimalsForUnitOfMeasure,
  quantityStepForUnitOfMeasure,
  shortUnitOfMeasure,
  isValidQuantityInputForUnitOfMeasure,
} from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { Banknote, CheckCircle2, Hash, MessageSquare, Percent, Trash2 } from "lucide-react"
import Image from "next/image"
import { useId, useRef, useState } from "react"

type Props = {
  row: MostradorCartDisplayRow
  overrides: OperationCartLineOverrideState
  paidPartialUnits?: Record<string, number>
  onApplyEdits: (input: MostradorCartLineEditInput) => void
  onRemove: () => void
  onVoidLine?: (input: { quantity: number; comment: string }) => void | Promise<void>
  grouped?: boolean
  variant?: "legacy" | "operar"
}

const TICKET_PROPOSAL = LAYOUTS_OPERAR_DEFAULT_TICKET_PROPOSAL

const QUANTITY_INPUT_MAX_LEN = 11

function formatQuantityForInput(n: number, unit: string): string {
  if (!Number.isFinite(n) || n <= 0) {
    return quantityAllowsDecimalsForUnitOfMeasure(unit) ? "" : "1"
  }
  if (!quantityAllowsDecimalsForUnitOfMeasure(unit)) {
    return String(Math.max(1, Math.round(n)))
  }
  const rounded = Math.round(n * 1000) / 1000
  if (Number.isInteger(rounded)) return String(rounded)
  return String(rounded).replace(".", ",")
}

function parseQuantityDraft(raw: string, fallback: number, unit: string): number {
  const trimmed = raw.trim()
  if (!trimmed) return fallback
  const n = Number.parseFloat(trimmed.replace(",", "."))
  if (!Number.isFinite(n) || n <= 0) return fallback
  if (!quantityAllowsDecimalsForUnitOfMeasure(unit)) {
    return Math.max(1, Math.round(n))
  }
  return Math.round(n * 1000) / 1000
}

function promoContentsLabel(
  selections: PromotionCartSelection[] | undefined,
): string {
  if (!selections?.length) return ""
  return selections
    .map((selection) => {
      const name = selection.name.trim()
      if (!name) return ""
      if (selection.slotQuantity > 1) return `${selection.slotQuantity}× ${name}`
      return name
    })
    .filter(Boolean)
    .join(" · ")
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
  onVoidLine,
  variant = "operar",
}: Props) {
  const paymentStatus = getRowPaymentStatus(row, paidPartialUnits)
  const {
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  } = overrides

  const [open, setOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [voidSubmitting, setVoidSubmitting] = useState(false)
  const [voidError, setVoidError] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState("")
  const [quantityDraft, setQuantityDraft] = useState(() =>
    formatQuantityForInput(row.cantidad, unitOfMeasureForRow(row)),
  )
  const [discountModeDraft, setDiscountModeDraft] = useState<
    CheckoutDiscountMode
  >("porcentaje")
  const [discountDraft, setDiscountDraft] = useState("")
  const [imageFailed, setImageFailed] = useState(false)
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

  const commentStorageKey = mostradorCartRowCommentKey(row)
  const comentario = resolveMostradorCartRowComment(row, {
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  })
  const pricing = pricingForMostradorRow(row, {
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  })

  const descuentoSuprimido = itemDescuentoSuprimido[row.cartLineId] === true
  const descuentoRaw = itemDescuentoDraft[row.cartLineId] ?? ""
  const tieneComentario = comentario.trim().length > 0
  const isQuantityDeal = Boolean(row.quantityDealApplicationId)
  const showPrice = !row.hidePrice || (variant === "operar" && isQuantityDeal)

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

  const isPaidLocked =
    row.paidLocked === true ||
    paymentStatus.isFullyPaid ||
    paymentStatus.isPartiallyPaid
  const isVoided = isComandaVoided(row.comandaStatus)
  const canVoidLine =
    Boolean(onVoidLine) && isComandaVoidable(row.comandaStatus) && !isPaidLocked
  const isCartLineLocked =
    isPaidLocked || isComandaLocked(row.comandaStatus)

  const openModal = () => {
    if (canVoidLine) {
      setVoidError(null)
      setVoidOpen(true)
      return
    }
    if (isCartLineLocked) return
    baselineCantidadRef.current = row.cantidad
    setQuantityDraft(formatQuantityForInput(row.cantidad, unitOfMeasure))
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

  const scanFocus = useSaleScanInputFocus()

  const closeModal = () => {
    setOpen(false)
    scanFocus?.focusScanInput()
  }

  const handleDone = () => {
    const parsedQuantity = parseQuantityDraft(
      quantityDraft,
      baselineCantidadRef.current,
      unitOfMeasure,
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

  const quantityStep = quantityStepForUnitOfMeasure(unitOfMeasure)

  const adjustQuantityDraft = (direction: -1 | 1) => {
    setQuantityDraft((current) => {
      const parsed = parseQuantityDraft(current, row.cantidad, unitOfMeasure)
      const next = Math.round((parsed + direction * quantityStep) * 1000) / 1000
      if (next <= 0) return current
      return formatQuantityForInput(next, unitOfMeasure)
    })
  }

  const canDecreaseQuantity =
    parseQuantityDraft(quantityDraft, row.cantidad, unitOfMeasure) - quantityStep >
    0

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

  const quantityFieldLabel =
    unitOfMeasureLabel !== "—"
      ? `Cantidad en ${unitOfMeasureLabel}`
      : "Cantidad en unidad"

  const isOperar = variant === "operar"
  const showLinePrice =
    showPrice && (isOperar || row.promoGroupVariant !== "discount")
  const rowGridLayoutClass = isOperar
    ? layoutsOperarTicketProposalLineGridClass(TICKET_PROPOSAL)
    : showLinePrice || !showPrice
      ? cartLineRowGridClass
      : cartLineRowGridNoPriceClass
  const hasLineDiscount = showLinePrice && pricing.precioBase > pricing.precioFinal + 0.004
  const catalogLinePricing = isOperar && hasLineDiscount
    ? resolveCatalogCartLinePricing(
        row.producto,
        row.cantidad,
        overrides.itemDescuentoSuprimido[row.cartLineId]
          ? null
          : overrides.itemDescuentoDraft[row.cartLineId]?.trim()
            ? {
                mode: overrides.itemDescuentoModo[row.cartLineId] ?? "porcentaje",
                draft: overrides.itemDescuentoDraft[row.cartLineId] ?? "",
              }
            : null,
        {
          suppressCatalogDiscount:
            row.discountEditingDisabled ||
            overrides.itemDescuentoSuprimido[row.cartLineId] === true,
        },
      )
    : null
  const catalogOffPercent =
    catalogLinePricing?.itemDiscountMode === "porcentaje" &&
    catalogLinePricing.itemDiscountValue != null
      ? catalogLinePricing.itemDiscountValue
      : null
  const computedOffPercent =
    pricing.precioBase > 0.004
      ? Math.round(
          ((pricing.precioBase - pricing.precioFinal) / pricing.precioBase) * 100,
        )
      : null
  const discountOffPercent = catalogOffPercent ?? computedOffPercent
  const quantityDealPill = isQuantityDeal
    ? row.promoGroupLabel?.trim() || undefined
    : undefined
  const discountPillLabel =
    row.kind === "promotion"
      ? "PROMO"
      : quantityDealPill ??
        (hasLineDiscount && discountOffPercent != null && discountOffPercent > 0
          ? `${Number.isInteger(discountOffPercent) ? String(discountOffPercent) : discountOffPercent.toLocaleString("es-AR", { maximumFractionDigits: 2 })}% OFF`
          : undefined)

  const paidBadge =
    paymentStatus.isFullyPaid ? (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
        <CheckCircle2 className="size-3" aria-hidden />
        Pagado
      </span>
    ) : paymentStatus.isPartiallyPaid ? (
      <span className="inline-flex rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
        {paymentStatus.paidQuantity} pagado
      </span>
    ) : null

  const lineImage =
    row.kind === "promotion"
      ? row.promotionMeta?.imageUrl?.trim() || ""
      : row.producto?.imagen?.trim() ?? ""
  const showLineImage = lineImage.length > 0 && !imageFailed
  const promoContents =
    row.kind === "promotion" ? promoContentsLabel(row.promotionSelections) : ""

  const rowContent = isOperar ? (
    <>
      <span
        className={layoutsOperarTicketProposalLineThumbClass(TICKET_PROPOSAL)}
        aria-hidden
      >
        {showLineImage ? (
          <Image
            src={lineImage}
            alt=""
            fill
            sizes="56px"
            unoptimized
            onError={() => setImageFailed(true)}
            className="object-cover"
          />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              layoutsOperarTicketProposalLineNameClass(TICKET_PROPOSAL),
              paymentStatus.isFullyPaid && "line-through decoration-emerald-600/50",
              isVoided && "line-through decoration-[var(--rootsy-danger)]/50",
            )}
          >
            {row.nombre}
          </span>
          {paidBadge}
        </span>
        {promoContents ? (
          <span
            className={layoutsOperarTicketProposalLineMetaClass(TICKET_PROPOSAL)}
            title={promoContents}
          >
            {promoContents}
          </span>
        ) : null}
        {showLinePrice || discountPillLabel ? (
          <span className="mt-0.5 flex flex-col items-start gap-0.5 leading-none">
            {showLinePrice ? (
              <span className="flex flex-wrap items-baseline gap-x-1.5">
                <span
                  className={cn(
                    layoutsOperarTicketProposalLineAmountClass(TICKET_PROPOSAL),
                    "text-xs font-bold",
                  )}
                >
                  {saleOpFmt.format(pricing.precioFinal)}
                </span>
                {hasLineDiscount ? (
                  <span className="text-xs font-normal tabular-nums text-[var(--rootsy-bruma-600)] line-through">
                    {saleOpFmt.format(pricing.precioBase)}
                  </span>
                ) : null}
              </span>
            ) : null}
            {discountPillLabel ? (
              <RootsNaturePill variant="savia" atmosphere="bruma">
                {discountPillLabel}
              </RootsNaturePill>
            ) : null}
          </span>
        ) : null}
        {tieneComentario ? (
          <span className="mt-1 block text-[11px] font-medium leading-snug text-[var(--rootsy-bruma-700)]">
            <MessageSquare
              className="mr-1 inline size-3 -translate-y-px text-[var(--rootsy-bruma-600)]"
              aria-hidden
            />
            {comentario.trim()}
          </span>
        ) : null}
      </span>
      <span
        className={layoutsOperarTicketProposalQtyClass(TICKET_PROPOSAL)}
        title={formatOperarTicketQuantity(row.cantidad, unitOfMeasure)}
      >
        {formatOperarTicketQuantity(row.cantidad, unitOfMeasure)}
      </span>
    </>
  ) : (
    <>
      <CartLineQuantityLabel cantidad={row.cantidad} />

      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "block text-sm font-semibold leading-snug text-slate-900",
              paymentStatus.isFullyPaid && "line-through decoration-emerald-600/50",
              isVoided && "line-through decoration-[var(--rootsy-danger)]/50",
            )}
          >
            {row.nombre}
          </span>
          {paidBadge}
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
          isOperar
            ? paymentStatus.isFullyPaid && "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,var(--rootsy-bruma-100))]"
            : cn(
                paymentStatus.isFullyPaid && "bg-emerald-50/70",
                paymentStatus.isPartiallyPaid && "bg-emerald-50/35",
              ),
          isOperar &&
            paymentStatus.isPartiallyPaid &&
            "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_6%,var(--rootsy-bruma-100))]",
        )}
      >
        {row.comandaStatus ? (
          <CartLineComandaStatusBar status={row.comandaStatus} />
        ) : null}
        {isCartLineLocked && !canVoidLine ? (
          <div
            className={cn(
              rowGridLayoutClass,
              (paymentStatus.isFullyPaid || isVoided) && "opacity-70",
            )}
            aria-label={
              paymentStatus.isFullyPaid || row.paidLocked
                ? `${row.nombre} (pagado)`
                : isVoided
                  ? `${row.nombre} (anulado)`
                  : isComandaLocked(row.comandaStatus)
                    ? `${row.nombre} (comandada)`
                    : row.nombre
            }
          >
            {rowContent}
          </div>
        ) : (
          <button
            type="button"
            onClick={openModal}
            className={cn(
              rowGridLayoutClass,
              !isOperar &&
                "bg-transparent transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300/80",
              isOperar &&
                "bg-transparent transition-colors hover:bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_35%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)]",
            )}
            aria-label={
              canVoidLine ? `Anular ${row.nombre}` : `Editar ${row.nombre}`
            }
          >
            {rowContent}
          </button>
        )}

        {tieneComentario && !isOperar ? (
          <div
            className={cn(saleOpCartLineDividerTopClass, "bg-slate-50/80 px-3 py-2")}
          >
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
        <RootsDialogContent className="flex flex-col">
          <RootsDialogHeader title={row.nombre} />

          <RootsDialogBody className="space-y-4">
            <CheckoutSectionPanel>
              <div className="space-y-2.5">
                <CheckoutSectionLabel htmlFor={quantityFieldId}>
                  {quantityFieldLabel}
                </CheckoutSectionLabel>
                {!canChangeQuantity ? (
                  <p className="rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-2.5 text-xs leading-snug text-[var(--rootsy-bruma-500)]">
                    {quantityDisabledHint}
                  </p>
                ) : (
                  <>
                    <CheckoutNumericValueField
                      id={quantityFieldId}
                      icon={Hash}
                      value={quantityDraft}
                      onChange={(raw) => {
                        if (
                          !isValidQuantityInputForUnitOfMeasure(
                            raw,
                            unitOfMeasure,
                            QUANTITY_INPUT_MAX_LEN,
                          )
                        ) {
                          return
                        }
                        setQuantityDraft(raw)
                      }}
                      onDecrease={() => adjustQuantityDraft(-1)}
                      onIncrease={() => adjustQuantityDraft(1)}
                      decreaseDisabled={!canDecreaseQuantity}
                      placeholder={formatQuantityForInput(row.cantidad, unitOfMeasure)}
                      suffix={unitOfMeasureSuffix || undefined}
                      inputMode={
                        quantityAllowsDecimalsForUnitOfMeasure(unitOfMeasure)
                          ? "decimal"
                          : "numeric"
                      }
                      maxLength={QUANTITY_INPUT_MAX_LEN}
                      ariaLabel={quantityFieldLabel}
                    />
                  </>
                )}
              </div>
            </CheckoutSectionPanel>

            <CheckoutSectionPanel>
              {!canComment ? (
                <p className="rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-2.5 text-xs leading-snug text-[var(--rootsy-bruma-500)]">
                  Este ítem no admite comentario.
                </p>
              ) : (
                <RootsFormTextareaField
                  id={commentFieldId}
                  label="Comentario"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Ej: sin cebolla, bien cocido..."
                  rows={3}
                  textareaClassName="resize-none"
                />
              )}
            </CheckoutSectionPanel>

            <CheckoutSectionPanel>
              {!canDiscount ? (
                <p className="rounded-xl border border-dashed border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-2.5 text-xs leading-snug text-[var(--rootsy-bruma-500)]">
                  El descuento está incluido en la promoción aplicada.
                </p>
              ) : (
                <>
                  <RootsFormSegmentField
                    label="Tipo"
                    value={discountModeDraft}
                    onValueChange={(value) =>
                      setDiscountModeDraft(value as CheckoutDiscountMode)
                    }
                    options={[
                      {
                        value: "porcentaje",
                        label: (
                          <>
                            <Percent className="size-4" aria-hidden />
                            Porcentaje
                          </>
                        ),
                      },
                      {
                        value: "fijo",
                        label: (
                          <>
                            <span
                              className="text-sm font-semibold tabular-nums"
                              aria-hidden
                            >
                              $
                            </span>
                            Monto fijo
                          </>
                        ),
                        disabled: maxDiscountLine <= 0,
                      },
                    ]}
                  />

                  <div className="space-y-2.5">
                    <CheckoutSectionLabel htmlFor={discountFieldId}>
                      Valor
                    </CheckoutSectionLabel>
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
          </RootsDialogBody>

          <CheckoutDialogFooter
            secondaryAction={{
              label: "Eliminar del pedido",
              icon: Trash2,
              tone: "destructive",
              onClick: handleRemove,
            }}
            primary={{ label: "Listo", onClick: handleDone }}
          />
        </RootsDialogContent>
      </Dialog>

      {onVoidLine ? (
        <ComandaVoidDialog
          open={voidOpen}
          onOpenChange={(next) => {
            if (voidSubmitting) return
            setVoidOpen(next)
            if (!next) setVoidError(null)
          }}
          itemName={row.nombre}
          maxQuantity={row.cantidad}
          submitting={voidSubmitting}
          submitError={voidError}
          onConfirm={async ({ quantity, comment }) => {
            setVoidSubmitting(true)
            setVoidError(null)
            try {
              await onVoidLine({ quantity, comment })
              setVoidOpen(false)
            } catch (error) {
              setVoidError(
                error instanceof Error
                  ? error.message
                  : "No se pudo anular el ítem.",
              )
            } finally {
              setVoidSubmitting(false)
            }
          }}
        />
      ) : null}
    </>
  )
}
