"use client"

import { useEffect, useState } from "react"
import {
  readSavedSaleCatalogChrome,
  writeSavedSaleCatalogChrome,
} from "@/lib/saleCatalogPreference"

/** Lista elegida en Operar — memoria de página + localStorage por pop. */

let session: { popId: string; priceListId: string } | null = null
const listeners = new Set<() => void>()

function notifySalePriceListSession() {
  for (const listener of listeners) listener()
}

export function setSalePriceListSession(popId: string, priceListId: string) {
  session = { popId, priceListId }
  writeSavedSaleCatalogChrome(popId, { priceListId })
  notifySalePriceListSession()
}

export function getSalePriceListSession(popId: string): string | undefined {
  if (session && session.popId === popId) return session.priceListId
  const saved = readSavedSaleCatalogChrome(popId).priceListId
  if (saved) {
    session = { popId, priceListId: saved }
    return saved
  }
  return undefined
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
