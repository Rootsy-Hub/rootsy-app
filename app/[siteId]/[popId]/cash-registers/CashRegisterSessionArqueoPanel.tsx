"use client"

import { CashRegisterSessionArqueoLoader } from "@/app/[siteId]/[popId]/cash-registers/CashRegisterSessionArqueoLoader"

type Props = {
  siteId: string
  popId: string
  sessionId: string
  refreshToken?: number
  className?: string
}

export function CashRegisterSessionArqueoPanel({
  siteId,
  popId,
  sessionId,
  refreshToken = 0,
  className,
}: Props) {
  return (
    <CashRegisterSessionArqueoLoader
      siteId={siteId}
      popId={popId}
      sessionId={sessionId}
      refreshToken={refreshToken}
      className={className}
    />
  )
}
