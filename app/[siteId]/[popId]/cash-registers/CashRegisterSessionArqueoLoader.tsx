"use client"

import {
  getCashRegisterSessionArqueoDetail,
  type CashRegisterSessionArqueoDetail,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterSessionArqueoView } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterSessionArqueoView"
import { dataWorkspaceDetailPanelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { Spinner } from "@/components/ui/spinner"
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
    const res = await getCashRegisterSessionArqueoDetail(popId, sessionId)
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
      <div
        className={cn("flex flex-1 flex-col gap-6", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className={cn(
            dataWorkspaceDetailPanelClass,
            "flex min-h-48 flex-col items-center justify-center gap-3 px-4 py-10 font-canopy text-sm text-[var(--rootsy-bruma-500)]",
          )}
        >
          <Spinner className="size-6 text-[var(--rootsy-bruma-400)]" />
          Cargando arqueo…
        </div>
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
