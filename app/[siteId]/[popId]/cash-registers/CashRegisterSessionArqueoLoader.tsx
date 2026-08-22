"use client"

import type { CashRegisterSessionArqueoDetail } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { fetchCashRegisterSessionArqueo } from "@/lib/rootsyApi/cashRegistersClient"
import { CashRegisterSessionArqueoView } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterSessionArqueoView"
import { CashRegisterSessionArqueoSkeleton } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterDetailSkeleton"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"

type Props = {
  siteId: string
  popId: string
  sessionId: string
  refreshToken?: number
  className?: string
}

export function CashRegisterSessionArqueoLoader({
  siteId,
  popId,
  sessionId,
  refreshToken = 0,
  className,
}: Props) {
  const [detail, setDetail] = useState<CashRegisterSessionArqueoDetail | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await fetchCashRegisterSessionArqueo(popId, sessionId)
    setLoading(false)
    if (!res.success) {
      setDetail(null)
      setError(res.error)
      return
    }
    setDetail(res.data)
  }, [popId, sessionId])

  useEffect(() => {
    void load()
  }, [load, refreshToken])

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <CashRegisterSessionArqueoSkeleton className={className} />
        <span className="sr-only">Cargando arqueo…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-[1.375rem] border border-[color-mix(in_srgb,var(--color-status-danger)_25%,var(--rootsy-bruma-200))] bg-[color-mix(in_srgb,var(--color-status-danger)_6%,white)] px-4 py-3 font-canopy text-sm text-[var(--color-status-danger)]",
          className,
        )}
      >
        {error}
      </div>
    )
  }

  if (!detail) return null

  return (
    <CashRegisterSessionArqueoView
      siteId={siteId}
      popId={popId}
      detail={detail}
      className={className}
    />
  )
}
