"use client"

import {
  getCashRegisterSessionArqueoDetail,
  type CashRegisterSessionArqueoDetail,
} from "@/app/[siteId]/[popId]/cash-registers/actions"
import { CashRegisterSessionArqueoView } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterSessionArqueoView"
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
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-10 text-sm text-muted-foreground">
          <Spinner className="size-6 text-muted-foreground" />
          Cargando arqueo…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive",
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
