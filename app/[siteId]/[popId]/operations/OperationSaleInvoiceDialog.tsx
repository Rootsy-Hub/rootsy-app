"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { fetchOperationSaleById } from "@/lib/rootsyApi/operationsClient"
import { SaleComprobanteSheetPreview } from "@/components/checkout/SaleComprobanteSheetPreview"
import {
  SaleComprobanteTicketPreview,
  type SaleComprobantePreviewInput,
} from "@/components/checkout/SaleComprobanteTicketPreview"
import { RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  rootsDialogPanelPaddingXClass,
} from "@/components/rootsy-dialog"
import { Dialog } from "@/components/ui/dialog"
import "@/app/library/layouts/layoutsOperarTheme.css"
import {
  layoutsOperarBodyScopeClass,
  layoutsOperarScrollMinimalClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  rootsFormSegmentGroupClass,
  rootsFormSegmentIndicatorClass,
  rootsFormSegmentOptionClass,
} from "@/components/rootsy-form"
import { getFormSegmentIndicatorLayoutStyle } from "@/components/rootsy-form/rootsFormSpecRuntime"
import { cn } from "@/lib/utils"
import { useSaleComprobanteEmitterContext } from "@/hooks/useSaleComprobanteEmitterContext"
import { useSaleComprobantePreviewModel } from "@/hooks/useSaleComprobantePreviewModel"
import { saleComprobanteLabel } from "@/lib/operationSaleComprobante"
import {
  printSaleComprobanteElement,
  SALE_COMPROBANTE_PRINT_FORMATS,
  type SaleComprobantePrintFormat,
} from "@/lib/saleComprobantePrint"
import { buildSaleDetailCartDisplayRows } from "@/lib/saleDetailCartDisplay"
import { Printer } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

const EMPTY_CART_OVERRIDES = {
  itemDescuentoModo: {},
  itemDescuentoDraft: {},
  itemDescuentoSuprimido: {},
  itemComentarios: {},
}

function saleToComprobantePreviewInput(
  sale: OperationSaleRow,
  popId: string,
  siteId: string,
): SaleComprobantePreviewInput {
  return {
    popId,
    siteId,
    comprobanteLabel: sale.invoiceTypeLabel,
    cartDisplayRows: buildSaleDetailCartDisplayRows(sale.lineItems),
    cartLineOverrides: EMPTY_CART_OVERRIDES,
    subtotal: sale.subtotal,
    discountAmount: sale.discountTotal,
    total: sale.total,
    customerName: sale.customerName ?? "",
    customerTaxId: sale.customerTaxId,
    customerIvaLabel: sale.customerIvaConditionLabel,
    paymentMethodLabel: sale.paymentMethodLabel,
  }
}

type Props = {
  sale: OperationSaleRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  popId: string
  nested?: boolean
}

export function OperationSaleInvoiceDialog({
  sale,
  open,
  onOpenChange,
  siteId,
  popId,
  nested = false,
}: Props) {
  const { emitter, loading, error } = useSaleComprobanteEmitterContext(
    popId,
    open && sale != null,
  )
  const [format, setFormat] = useState<SaleComprobantePrintFormat>("rollo")
  const [printing, setPrinting] = useState(false)
  const [detailSale, setDetailSale] = useState<OperationSaleRow | null>(null)
  const printRootRef = useRef<HTMLDivElement>(null)
  const resolvedSale = detailSale ?? sale

  useEffect(() => {
    if (!open || !sale?.id || !popId) {
      setDetailSale(null)
      return
    }
    if ((sale.lineItems?.length ?? 0) > 0) {
      setDetailSale(sale)
      return
    }
    let cancelled = false
    void fetchOperationSaleById(popId, sale.id).then((res) => {
      if (cancelled) return
      if (res.success) setDetailSale(res.sale)
    })
    return () => {
      cancelled = true
    }
  }, [open, sale, popId])

  const previewInput = useMemo(() => {
    if (!resolvedSale) return null
    return saleToComprobantePreviewInput(resolvedSale, popId, siteId)
  }, [resolvedSale, popId, siteId])

  const issuedAt = useMemo(() => {
    if (!resolvedSale?.soldAt) return undefined
    const date = new Date(resolvedSale.soldAt)
    return Number.isNaN(date.getTime()) ? undefined : date
  }, [resolvedSale?.soldAt])

  const { canPrint } = useSaleComprobantePreviewModel({
    previewInput,
    emitter,
    previewComprobanteLabel: resolvedSale?.invoiceTypeLabel ?? null,
    issuedAt,
  })

  useEffect(() => {
    if (!open) {
      setFormat("rollo")
      setPrinting(false)
    }
  }, [open])

  const tipo = resolvedSale ? saleComprobanteLabel(resolvedSale) : "—"
  const selectedFormatIndex = SALE_COMPROBANTE_PRINT_FORMATS.findIndex(
    (option) => option.value === format,
  )
  const previewProps = {
    previewInput,
    emitter,
    previewComprobanteLabel: resolvedSale?.invoiceTypeLabel ?? null,
    issuedAt,
    loading,
    error,
  }

  const handlePrint = async () => {
    const surface = printRootRef.current?.querySelector<HTMLElement>(
      ".sale-comprobante-print-surface",
    )
    if (!surface || !canPrint || printing) return
    setPrinting(true)
    try {
      await printSaleComprobanteElement(surface, format)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent
        size="wide"
        nested={nested}
        className={cn(
          layoutsOperarBodyScopeClass,
          format === "hoja" && "max-h-[min(90vh,860px)] sm:max-w-2xl",
        )}
      >
        <RootsDialogHeader
          open={open}
          title="Comprobante"
          description={tipo !== "—" ? tipo : "Sin tipo fiscal registrado"}
        />

        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-3 pb-[var(--rootsy-space-150)]",
            rootsDialogPanelPaddingXClass,
          )}
        >
          <div
            role="group"
            aria-label="Formato de impresión"
            className={cn(rootsFormSegmentGroupClass, "w-[13.75rem] shrink-0 grid-cols-2")}
          >
            <span
              aria-hidden
              className={rootsFormSegmentIndicatorClass}
              style={getFormSegmentIndicatorLayoutStyle(
                SALE_COMPROBANTE_PRINT_FORMATS.length,
                Math.max(0, selectedFormatIndex),
              )}
            />
            {SALE_COMPROBANTE_PRINT_FORMATS.map((option) => {
              const isSelected = format === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  className={rootsFormSegmentOptionClass(isSelected)}
                  onClick={() => setFormat(option.value)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <RootsSubtleButton
            type="button"
            size="compact"
            withIcon
            disabled={!canPrint || loading}
            loading={printing}
            loadingLabel="Imprimiendo"
            onClick={() => {
              void handlePrint()
            }}
          >
            <Printer className="size-4" aria-hidden />
            Imprimir
          </RootsSubtleButton>
        </div>

        <RootsDialogBody className={layoutsOperarScrollMinimalClass}>
          <div ref={printRootRef}>
            {format === "rollo" ? (
              <SaleComprobanteTicketPreview {...previewProps} framed={false} />
            ) : (
              <SaleComprobanteSheetPreview {...previewProps} />
            )}
          </div>
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
