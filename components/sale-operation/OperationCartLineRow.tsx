"use client"

import { SaleOperationCartItem } from "@/components/sale-operation/SaleOperationCartItem"
import {
  defaultItemDiscountFromProduct,
  resolveCatalogCartLinePricing,
  type SaleCatalogProduct,
} from "@/components/sale-operation/saleCatalogProduct"
import { resolvePromotionCartPricing } from "@/lib/menuCheckoutPromotions"
import type { MenuCatalogPromotion } from "@/app/[siteId]/[popId]/menu-catalog/actions"
import type { PromotionCartSelection } from "@/lib/promotionPricing"
import { saleOpFmt } from "@/components/sale-operation/saleOperationStyles"
import { Input } from "@/components/ui/input"
import type { Dispatch, SetStateAction } from "react"
import { Banknote, MessageSquare, Percent } from "lucide-react"

const fmt = saleOpFmt

export type OperationCartLineOverrideState = {
  itemDetalleAbiertoId: string | null
  itemDescuentoModo: Record<string, "porcentaje" | "fijo">
  itemDescuentoDraft: Record<string, string>
  itemDescuentoSuprimido: Record<string, true>
  itemComentarios: Record<string, string>
}

export type OperationCartLineOverrideActions = {
  toggleItemDetalle: (lineKey: string) => void
  setItemDescuentoModo: Dispatch<SetStateAction<Record<string, "porcentaje" | "fijo">>>
  setItemDescuentoDraft: Dispatch<SetStateAction<Record<string, string>>>
  setItemDescuentoSuprimido: Dispatch<SetStateAction<Record<string, true>>>
  setItemComentarios: Dispatch<SetStateAction<Record<string, string>>>
}

type Props = {
  lineKey: string
  itemId: string
  nombre: string
  descripcion?: string | null
  cantidad: number
  producto: Pick<
    SaleCatalogProduct,
    | "precio"
    | "precioOriginal"
    | "discountMode"
    | "discountValue"
  > | null
  overrides: OperationCartLineOverrideState
  overrideActions: OperationCartLineOverrideActions
  onQuantityDecrease: () => void
  onQuantityIncrease: () => void
  onRemove: () => void
  promotionMeta?: MenuCatalogPromotion
  promotionSelections?: PromotionCartSelection[]
  /** Unidades de esta línea incluidas en promo por cantidad (descuento en línea aparte). */
  quantityDealUnitsOnLine?: number
  discountEditingDisabled?: boolean
}

export function OperationCartLineRow({
  lineKey,
  itemId,
  nombre,
  descripcion,
  cantidad,
  producto,
  overrides,
  overrideActions,
  onQuantityDecrease,
  onQuantityIncrease,
  onRemove,
  promotionMeta,
  promotionSelections,
  quantityDealUnitsOnLine = 0,
  discountEditingDisabled = false,
}: Props) {
  const {
    itemDetalleAbiertoId,
    itemDescuentoModo,
    itemDescuentoDraft,
    itemDescuentoSuprimido,
    itemComentarios,
  } = overrides
  const {
    toggleItemDetalle,
    setItemDescuentoModo,
    setItemDescuentoDraft,
    setItemDescuentoSuprimido,
    setItemComentarios,
  } = overrideActions

  const abierto = itemDetalleAbiertoId === lineKey
  const comentario = itemComentarios[lineKey] ?? ""
  const descuentoSuprimido = itemDescuentoSuprimido[lineKey] === true
  const quantityDealActive = quantityDealUnitsOnLine > 0
  const editingDisabled = discountEditingDisabled || quantityDealActive
  const modoItemDescuento = itemDescuentoModo[lineKey] ?? "porcentaje"
  const descuentoRaw = itemDescuentoDraft[lineKey] ?? ""

  const catalogPricing =
    promotionMeta && promotionSelections?.length
      ? resolvePromotionCartPricing(
          promotionMeta,
          promotionSelections,
          cantidad,
        )
      : resolveCatalogCartLinePricing(
          producto,
          cantidad,
          !descuentoSuprimido &&
            !quantityDealActive &&
            descuentoRaw !== ""
            ? { mode: modoItemDescuento, draft: descuentoRaw }
            : null,
          {
            suppressCatalogDiscount:
              descuentoSuprimido || quantityDealActive,
          },
        )

  const precioFinal = catalogPricing.precioFinal
  const precioBase = catalogPricing.precioBase

  const modoFormulario =
    itemDescuentoModo[lineKey] ?? catalogPricing.itemDiscountMode ?? "porcentaje"
  const descuentoFormValue = descuentoSuprimido
    ? ""
    : descuentoRaw !== ""
      ? descuentoRaw
      : catalogPricing.discountSource === "catalog" &&
          catalogPricing.itemDiscountValue != null
        ? String(catalogPricing.itemDiscountValue)
        : ""
  const descuentoNumero = Number.parseFloat(
    descuentoFormValue.trim().replace(",", "."),
  )
  const descuentoManual = catalogPricing.itemDiscountAmount
  const tieneDescuentoManual = catalogPricing.tieneDescuentoManual
  const tieneDescuento =
    catalogPricing.tieneDescuentoCatalogo || tieneDescuentoManual
  const precioBaseItem = catalogPricing.precioBase
  const tieneComentario = comentario.trim().length > 0

  return (
    <SaleOperationCartItem
      itemId={itemId}
      nombre={nombre}
      descripcion={descripcion}
      cantidad={cantidad}
      precioUnitario={catalogPricing.precioUnitario}
      precioBase={precioBase}
      precioFinal={precioFinal}
      expandable
      expanded={abierto}
      onToggleExpand={() => toggleItemDetalle(lineKey)}
      onQuantityDecrease={onQuantityDecrease}
      onQuantityIncrease={onQuantityIncrease}
      onRemove={onRemove}
      tieneComentario={tieneComentario}
      tieneDescuento={!quantityDealActive && tieneDescuento}
      descuentoLabel={
        tieneDescuentoManual
          ? modoFormulario === "porcentaje"
            ? `${Math.min(100, Math.max(0, Number.isFinite(descuentoNumero) ? descuentoNumero : 0))}%`
            : fmt.format(descuentoManual)
          : catalogPricing.descuentoCatalogoLabel
      }
      expandedContent={
        editingDisabled ? (
          <div className="flex items-center gap-2 opacity-60">
            <button
              type="button"
              disabled
              aria-disabled
              className="inline-flex h-8 w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-slate-300/70 bg-slate-100 text-slate-400"
            >
              {modoFormulario === "porcentaje" ? (
                <Percent className="size-3.5" aria-hidden />
              ) : (
                <Banknote className="size-3.5" aria-hidden />
              )}
            </button>
            <Input
              disabled
              value=""
              readOnly
              placeholder="descuento"
              className="h-8 w-26 cursor-not-allowed border border-slate-200 bg-slate-50! text-xs shadow-none"
            />
            <div className="relative min-w-0 flex-1">
              <MessageSquare className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                disabled
                value=""
                readOnly
                placeholder="sin comentario"
                className="h-8 cursor-not-allowed border border-slate-200 bg-slate-50! pl-8 text-xs shadow-none"
              />
            </div>
          </div>
        ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-400/50 bg-slate-100 text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
            aria-label="Cambiar tipo de descuento"
            onClick={(e) => {
              e.stopPropagation()
              const actual =
                itemDescuentoModo[lineKey] ??
                catalogPricing.itemDiscountMode ??
                "porcentaje"
              setItemDescuentoModo((prev) => ({
                ...prev,
                [lineKey]: actual === "porcentaje" ? "fijo" : "porcentaje",
              }))
            }}
          >
            {modoFormulario === "porcentaje" ? (
              <Percent className="size-3.5" aria-hidden />
            ) : (
              <Banknote className="size-3.5" aria-hidden />
            )}
          </button>
          <Input
            value={descuentoFormValue}
            onChange={(e) => {
              const raw = e.target.value
              if (!/^\d*$/.test(raw)) return
              if (raw === "") {
                setItemDescuentoDraft((prev) => ({ ...prev, [lineKey]: "" }))
                setItemDescuentoSuprimido((prev) => ({
                  ...prev,
                  [lineKey]: true,
                }))
                return
              }
              setItemDescuentoSuprimido((prev) => {
                if (!(lineKey in prev)) return prev
                const next = { ...prev }
                delete next[lineKey]
                return next
              })
              if (modoFormulario === "fijo" && Number(raw) > precioBaseItem) {
                setItemDescuentoModo((prev) => ({
                  ...prev,
                  [lineKey]: "porcentaje",
                }))
                setItemDescuentoDraft((prev) => ({ ...prev, [lineKey]: "100" }))
                return
              }
              const nextValue =
                modoFormulario === "porcentaje"
                  ? String(Math.min(100, Number(raw)))
                  : raw
              setItemDescuentoDraft((prev) => ({
                ...prev,
                [lineKey]: nextValue,
              }))
            }}
            placeholder="descuento"
            inputMode="numeric"
            pattern="[0-9]*"
            className="h-8 w-26 border border-slate-300 bg-white! text-[#121417] text-xs shadow-none placeholder:text-slate-500"
          />
          <div className="relative min-w-0 flex-1">
            <MessageSquare className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              value={comentario}
              onChange={(e) =>
                setItemComentarios((prev) => ({
                  ...prev,
                  [lineKey]: e.target.value,
                }))
              }
              placeholder="agregá un comentario..."
              className="h-8 border border-slate-300 bg-white! pl-8 text-[#121417] text-xs shadow-none placeholder:text-slate-500"
            />
          </div>
        </div>
        )
      }
    />
  )
}

export function seedCartLineDefaultDiscount(
  product: Pick<
    SaleCatalogProduct,
    "precio" | "precioOriginal" | "discountMode" | "discountValue"
  > | null | undefined,
  lineKey: string,
  actions: Pick<
    OperationCartLineOverrideActions,
    | "setItemDescuentoModo"
    | "setItemDescuentoDraft"
    | "setItemDescuentoSuprimido"
  >,
) {
  if (!product) return
  const defaultDiscount = defaultItemDiscountFromProduct(product)
  if (!defaultDiscount) return
  actions.setItemDescuentoSuprimido((prev) => {
    if (!(lineKey in prev)) return prev
    const next = { ...prev }
    delete next[lineKey]
    return next
  })
  actions.setItemDescuentoModo((prev) => ({
    ...prev,
    [lineKey]: defaultDiscount.mode,
  }))
  actions.setItemDescuentoDraft((prev) => ({
    ...prev,
    [lineKey]: defaultDiscount.draft,
  }))
}

export function clearCartLineOverrides(
  lineKey: string,
  actions: OperationCartLineOverrideActions & {
    setItemDetalleAbiertoId: Dispatch<SetStateAction<string | null>>
  },
) {
  actions.setItemDescuentoModo((prev) => {
    if (!(lineKey in prev)) return prev
    const next = { ...prev }
    delete next[lineKey]
    return next
  })
  actions.setItemDescuentoDraft((prev) => {
    if (!(lineKey in prev)) return prev
    const next = { ...prev }
    delete next[lineKey]
    return next
  })
  actions.setItemDescuentoSuprimido((prev) => {
    if (!(lineKey in prev)) return prev
    const next = { ...prev }
    delete next[lineKey]
    return next
  })
  actions.setItemComentarios((prev) => {
    if (!(lineKey in prev)) return prev
    const next = { ...prev }
    delete next[lineKey]
    return next
  })
  actions.setItemDetalleAbiertoId((prev) => (prev === lineKey ? null : prev))
}
