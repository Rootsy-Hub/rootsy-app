"use client"

import { useEffect, useState } from "react"
import { getPopComprobanteEmitterPreview } from "@/app/[siteId]/[popId]/sale/comprobantePreviewActions"
import type { SaleComprobanteEmitterContext } from "@/lib/saleComprobantePreview"

export function useSaleComprobanteEmitterContext(
  popId: string,
  open: boolean,
  cashRegisterId?: string | null,
) {
  const [emitter, setEmitter] = useState<SaleComprobanteEmitterContext | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !popId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    void getPopComprobanteEmitterPreview(popId, cashRegisterId).then((res) => {
      if (cancelled) return
      setLoading(false)
      if (res.success) {
        setEmitter(res.emitter)
        return
      }
      setEmitter(null)
      setError(res.error)
    })

    return () => {
      cancelled = true
    }
  }, [open, popId, cashRegisterId])

  return { emitter, loading, error }
}
