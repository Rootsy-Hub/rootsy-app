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

    const scrollToLine = () => {
      const root = scrollRef.current
      if (!root) return false
      const escaped = CSS.escape(pulse.lineId)
      const el = root.querySelector<HTMLElement>(
        `[data-cart-line-id="${escaped}"]`,
      )
      if (!el) return false
      el.scrollIntoView({ behavior: "smooth", block: "nearest" })
      return true
    }

    const tryScroll = () => {
      if (scrollToLine() || attempts >= 8) return
      attempts += 1
      raf = requestAnimationFrame(tryScroll)
    }

    raf = requestAnimationFrame(tryScroll)
    const clearHighlight = window.setTimeout(() => setPulse(null), 1300)

    return () => {
      cancelAnimationFrame(raf)
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
