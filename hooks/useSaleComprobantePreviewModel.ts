"use client"

import {
  buildSaleComprobantePreview,
  type BuildSaleComprobantePreviewInput,
  type SaleComprobantePreviewModel,
} from "@/lib/saleComprobantePreview"
import { SALE_COMPROBANTE_SIN_LABEL } from "@/lib/saleComprobantePicker"
import { isLegalSaleComprobanteLabel } from "@/lib/saleComprobanteRules"
import { useMemo } from "react"

export type SaleComprobantePreviewSourceInput = Omit<
  BuildSaleComprobantePreviewInput,
  "emitter" | "issuedAt"
> | null

type Args = {
  previewInput: SaleComprobantePreviewSourceInput
  emitter: BuildSaleComprobantePreviewInput["emitter"]
  previewComprobanteLabel?: string | null
  issuedAt?: Date
}

export function useSaleComprobantePreviewModel({
  previewInput,
  emitter,
  previewComprobanteLabel,
  issuedAt,
}: Args): {
  model: SaleComprobantePreviewModel | null
  isSinComprobante: boolean
  missingFiscalCuit: boolean
  canPrint: boolean
} {
  const resolvedComprobanteLabel =
    previewComprobanteLabel !== undefined
      ? previewComprobanteLabel
      : previewInput?.comprobanteLabel ?? null

  const isSinComprobante =
    previewInput != null &&
    (resolvedComprobanteLabel == null ||
      resolvedComprobanteLabel === SALE_COMPROBANTE_SIN_LABEL)

  const needsValidFiscalCuit =
    previewInput != null &&
    !isSinComprobante &&
    isLegalSaleComprobanteLabel(resolvedComprobanteLabel)

  const model = useMemo(() => {
    if (!previewInput || !emitter || isSinComprobante) return null
    if (needsValidFiscalCuit && !emitter.hasValidFiscalCuit) return null
    return buildSaleComprobantePreview({
      ...previewInput,
      comprobanteLabel: resolvedComprobanteLabel,
      emitter,
      issuedAt,
    })
  }, [
    previewInput,
    emitter,
    issuedAt,
    resolvedComprobanteLabel,
    isSinComprobante,
    needsValidFiscalCuit,
  ])

  const missingFiscalCuit = Boolean(
    needsValidFiscalCuit && emitter && !emitter.hasValidFiscalCuit,
  )

  return {
    model,
    isSinComprobante,
    missingFiscalCuit,
    canPrint: model != null,
  }
}
