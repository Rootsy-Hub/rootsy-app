"use client"

import { useEffect, useState } from "react"

/** Lista elegida en Operar — vive en memoria de la sesión de página. */

let session: { popId: string; priceListId: string } | null = null
const listeners = new Set<() => void>()

function notifySalePriceListSession() {
  for (const listener of listeners) listener()
}

export function setSalePriceListSession(popId: string, priceListId: string) {
  session = { popId, priceListId }
  notifySalePriceListSession()
}

export function getSalePriceListSession(popId: string): string | undefined {
  if (!session || session.popId !== popId) return undefined
  return session.priceListId
}

export function subscribeSalePriceListSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Lista activa en Operar — se actualiza al cambiar el selector del catálogo. */
export function useSalePriceListId(popId: string | undefined): string | undefined {
  const [priceListId, setPriceListId] = useState(() =>
    popId ? getSalePriceListSession(popId) : undefined,
  )

  useEffect(() => {
    const sync = () => {
      setPriceListId(popId ? getSalePriceListSession(popId) : undefined)
    }
    sync()
    return subscribeSalePriceListSession(sync)
  }, [popId])

  return priceListId
}
