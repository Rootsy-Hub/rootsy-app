"use client"

import { getPopComprobanteEmitterPreview } from "@/app/[siteId]/[popId]/sale/comprobantePreviewActions"
import {
  readSaleComprobanteEmitterCache,
  writeSaleComprobanteEmitterCache,
} from "@/lib/saleComprobanteEmitterClientCache"

/** Precarga datos fiscales del emisor en cache (p. ej. al entrar al POP). */
export function prefetchSaleComprobanteEmitter(
  popId: string,
  popSettingsRev: number,
  cashRegisterId?: string | null,
): void {
  if (!popId) return
  if (
    readSaleComprobanteEmitterCache(popId, cashRegisterId, popSettingsRev)
  ) {
    return
  }

  void getPopComprobanteEmitterPreview(popId, cashRegisterId).then((res) => {
    if (!res.success) return
    writeSaleComprobanteEmitterCache(
      popId,
      cashRegisterId,
      popSettingsRev,
      res.emitter,
    )
  })
}
