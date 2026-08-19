"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"

export type CartListScrollHighlightValue = {
  scrollRef: RefObject<HTMLDivElement | null>
  notifyLineAdded: (lineId: string) => void
  isLineHighlighted: (lineId: string) => boolean
  highlightTick: number
}

const CartListScrollHighlightContext =
  createContext<CartListScrollHighlightValue | null>(null)

function isLastCartLine(root: HTMLElement, el: HTMLElement) {
  const lines = root.querySelectorAll("[data-cart-line-id]")
  return lines.length > 0 && lines[lines.length - 1] === el
}

function scrollCartToBlockEnd(root: HTMLDivElement) {
  root.scrollTo({ top: root.scrollHeight, behavior: "smooth" })
}

function scrollCartToAffectedLine(root: HTMLDivElement, lineId: string) {
  const escaped = CSS.escape(lineId)
  const el = root.querySelector<HTMLElement>(`[data-cart-line-id="${escaped}"]`)
  if (!el) return false

  // Un ítem nuevo va al final: hay que revelar el bloque hasta Por cobrar / total.
  if (isLastCartLine(root, el)) {
    scrollCartToBlockEnd(root)
    return true
  }

  const padding = 10
  const rootRect = root.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  if (elRect.bottom > rootRect.bottom - padding) {
    const nextTop =
      root.scrollTop + (elRect.bottom - rootRect.bottom) + padding
    root.scrollTo({ top: nextTop, behavior: "smooth" })
    return true
  }

  if (elRect.top < rootRect.top + padding) {
    const nextTop =
      root.scrollTop - (rootRect.top - elRect.top) - padding
    root.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" })
    return true
  }

  return true
}

export function useCartListScrollHighlight(): CartListScrollHighlightValue {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pulse, setPulse] = useState<{ lineId: string; tick: number } | null>(
    null,
  )

  const notifyLineAdded = useCallback((lineId: string) => {
    if (!lineId) return
    setPulse({ lineId, tick: Date.now() })
  }, [])

  const isLineHighlighted = useCallback(
    (lineId: string) => pulse?.lineId === lineId,
    [pulse?.lineId, pulse?.tick],
  )

  useEffect(() => {
    if (!pulse?.lineId) return

    let attempts = 0
    let raf = 0

    const tryScroll = () => {
      const root = scrollRef.current
      if (root && scrollCartToAffectedLine(root, pulse.lineId)) return
      if (attempts >= 12) {
        if (root) scrollCartToBlockEnd(root)
        return
      }
      attempts += 1
      raf = requestAnimationFrame(tryScroll)
    }

    raf = requestAnimationFrame(tryScroll)
    const layoutFollowUp = window.setTimeout(() => {
      const root = scrollRef.current
      if (!root) return
      if (!scrollCartToAffectedLine(root, pulse.lineId)) {
        scrollCartToBlockEnd(root)
      }
    }, 150)
    const clearHighlight = window.setTimeout(() => setPulse(null), 1300)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(layoutFollowUp)
      window.clearTimeout(clearHighlight)
    }
  }, [pulse?.lineId, pulse?.tick])

  return {
    scrollRef,
    notifyLineAdded,
    isLineHighlighted,
    highlightTick: pulse?.tick ?? 0,
  }
}

export function CartListScrollHighlightProvider({
  value,
  children,
}: {
  value: CartListScrollHighlightValue
  children: ReactNode
}) {
  return (
    <CartListScrollHighlightContext.Provider value={value}>
      {children}
    </CartListScrollHighlightContext.Provider>
  )
}

function useCartListScrollHighlightContext() {
  return useContext(CartListScrollHighlightContext)
}

export function useCartListScrollContainerRef() {
  return useCartListScrollHighlightContext()?.scrollRef ?? null
}

export function useCartLineScrollHighlight(lineId: string) {
  const ctx = useCartListScrollHighlightContext()
  return {
    highlighted: ctx?.isLineHighlighted(lineId) ?? false,
    highlightTick: ctx?.highlightTick ?? 0,
  }
}
