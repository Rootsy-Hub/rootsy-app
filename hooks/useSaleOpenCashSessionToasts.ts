"use client"

import { showRootsyMensajeToast } from "@/components/rootsy-mensaje"
import { ROOTSY_MENSAJE_DEFAULT_PORTRAIT } from "@/components/rootsy-mensaje/rootsyMensaje"
import { useOpenCashSession } from "@/hooks/useOpenCashSession"
import { popScopedHref } from "@/lib/popRoutes"
import { useRouter } from "@/lib/pop-spa/navigation"
import { useEffect, useRef } from "react"

const DAY_MS = 24 * 60 * 60 * 1000

export function isCashSessionOlderThanOneDay(
  openedAt: string,
  now = Date.now(),
): boolean {
  const opened = Date.parse(openedAt)
  if (Number.isNaN(opened)) return false
  return now - opened > DAY_MS
}

export function useSaleOpenCashSessionToasts(
  siteId: string | undefined,
  popId: string | undefined,
  enabled: boolean,
  pageReady: boolean,
) {
  const router = useRouter()
  const { data: session, isSuccess } = useOpenCashSession(popId, { enabled })
  const shownKeyRef = useRef<string | null>(null)
  const toastRef = useRef<{ dismiss: () => void } | null>(null)

  useEffect(() => {
    if (!enabled || !pageReady || !isSuccess || !siteId || !popId) return

    const href = popScopedHref(siteId, popId, "cash-registers")
    const goToCajas = () => {
      router.push(href)
    }

    if (!session) {
      const key = `none:${popId}`
      if (shownKeyRef.current === key) return
      shownKeyRef.current = key
      toastRef.current?.dismiss()
      toastRef.current = showRootsyMensajeToast({
        intent: "warning",
        placement: "top-right",
        portraitSrc: ROOTSY_MENSAJE_DEFAULT_PORTRAIT,
        title: "Necesitás una caja abierta",
        message:
          "Para vender tenés que tener un turno de caja. Abrilo en Cajas y volvemos.",
        actionLabel: "Ir a cajas",
        onAction: goToCajas,
        duration: Number.POSITIVE_INFINITY,
        sound: false,
      })
      return
    }

    if (!isCashSessionOlderThanOneDay(session.openedAt)) {
      if (shownKeyRef.current !== `fresh:${session.sessionId}`) {
        toastRef.current?.dismiss()
        toastRef.current = null
      }
      shownKeyRef.current = `fresh:${session.sessionId}`
      return
    }

    const key = `stale:${session.sessionId}:${session.openedAt}`
    if (shownKeyRef.current === key) return
    shownKeyRef.current = key
    toastRef.current?.dismiss()
    toastRef.current = showRootsyMensajeToast({
      intent: "warning",
      placement: "top-right",
      portraitSrc: ROOTSY_MENSAJE_DEFAULT_PORTRAIT,
      title: "Este turno ya lleva más de un día",
      message:
        "Te recomiendo cerrar la caja y abrir un turno nuevo para el día.",
      actionLabel: "Ir a cajas",
      onAction: goToCajas,
      duration: Number.POSITIVE_INFINITY,
      sound: false,
    })
  }, [enabled, isSuccess, pageReady, popId, router, session, siteId])
}
