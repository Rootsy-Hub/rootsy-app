"use client"

import { getPopComprobanteEmitterPreview } from "@/app/[siteId]/[popId]/sale/comprobantePreviewActions"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import type { SaleComprobanteEmitterContext } from "@/lib/saleComprobantePreview"
import {
  readSaleComprobanteEmitterCache,
  writeSaleComprobanteEmitterCache,
} from "@/lib/saleComprobanteEmitterClientCache"
import { useEffect, useState } from "react"

export function useSaleComprobanteEmitterContext(
  popId: string,
  open: boolean,
  cashRegisterId?: string | null,
) {
  const workspace = usePopWorkspaceOptional()
  const popSettingsRev = workspace?.bootstrap?.cacheRevisions.popSettingsRev

  const [emitter, setEmitter] = useState<SaleComprobanteEmitterContext | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !popId) return

    let cancelled = false

    const cached = readSaleComprobanteEmitterCache(
      popId,
      cashRegisterId,
      popSettingsRev,
    )
    if (cached) {
      setEmitter(cached)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    void getPopComprobanteEmitterPreview(popId, cashRegisterId).then((res) => {
      if (cancelled) return
      setLoading(false)
      if (res.success) {
        setEmitter(res.emitter)
        if (popSettingsRev != null) {
          writeSaleComprobanteEmitterCache(
            popId,
            cashRegisterId,
            popSettingsRev,
            res.emitter,
          )
        } else {
          writeSaleComprobanteEmitterCache(
            popId,
            cashRegisterId,
            0,
            res.emitter,
          )
        }
        return
      }
      setEmitter(null)
      setError(res.error)
    })

    return () => {
      cancelled = true
    }
  }, [open, popId, cashRegisterId, popSettingsRev])

  return { emitter, loading, error }
}
