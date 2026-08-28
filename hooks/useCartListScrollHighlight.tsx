"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefCallback,
} from "react"

const PIN_THRESHOLD_PX = 64

export function isCartScrollPinnedToBottom(
  root: Pick<HTMLElement, "scrollHeight" | "scrollTop" | "clientHeight">,
  thresholdPx = PIN_THRESHOLD_PX,
) {
  return root.scrollHeight - root.scrollTop - root.clientHeight <= thresholdPx
}

export type CartListScrollHighlightValue = {
  scrollRef: RefCallback<HTMLDivElement>
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

function scrollCartToBlockEnd(
  root: HTMLDivElement,
  behavior: ScrollBehavior = "smooth",
) {
  root.scrollTo({ top: root.scrollHeight, behavior })
}

function scrollCartToAffectedLine(root: HTMLDivElement, lineId: string) {
  const escaped = CSS.escape(lineId)
  const el = root.querySelector<HTMLElement>(`[data-cart-line-id="${escaped}"]`)
  if (!el) return false

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

export function useCartListScrollHighlight(
  anchorKey?: string | null,
): CartListScrollHighlightValue {
  const scrollNodeRef = useRef<HTMLDivElement | null>(null)
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)
  const pinnedRef = useRef(true)
  const programmaticRef = useRef(false)
  const [pulse, setPulse] = useState<{ lineId: string; tick: number } | null>(
    null,
  )

  const scrollRef = useCallback<RefCallback<HTMLDivElement>>((node) => {
    scrollNodeRef.current = node
    setScrollEl(node)
  }, [])

  const notifyLineAdded = useCallback((lineId: string) => {
    if (!lineId) return
    setPulse({ lineId, tick: Date.now() })
  }, [])

  const isLineHighlighted = useCallback(
    (lineId: string) => pulse?.lineId === lineId,
    [pulse?.lineId, pulse?.tick],
  )

  useEffect(() => {
    pinnedRef.current = true
  }, [anchorKey])

  useEffect(() => {
    const root = scrollEl
    if (!root) return

    const onScroll = () => {
      if (programmaticRef.current) return
      pinnedRef.current = isCartScrollPinnedToBottom(root)
    }
    root.addEventListener("scroll", onScroll, { passive: true })

    const followIfPinned = () => {
      if (!pinnedRef.current) return
      programmaticRef.current = true
      root.scrollTop = root.scrollHeight
      requestAnimationFrame(() => {
        programmaticRef.current = false
      })
    }

    followIfPinned()

    const ro = new ResizeObserver(followIfPinned)
    ro.observe(root)
    for (const child of Array.from(root.children)) {
      ro.observe(child)
    }

    const mo = new MutationObserver(() => {
      for (const child of Array.from(root.children)) {
        ro.observe(child)
      }
      followIfPinned()
    })
    mo.observe(root, { childList: true, subtree: true })

    return () => {
      root.removeEventListener("scroll", onScroll)
      ro.disconnect()
      mo.disconnect()
    }
  }, [scrollEl, anchorKey])

  useEffect(() => {
    if (!pulse?.lineId) return

    let attempts = 0
    let raf = 0

    const tryScroll = () => {
      const root = scrollNodeRef.current
      if (root) {
        const escaped = CSS.escape(pulse.lineId)
        const el = root.querySelector<HTMLElement>(
          `[data-cart-line-id="${escaped}"]`,
        )
        if (el && isLastCartLine(root, el)) {
          pinnedRef.current = true
        }
        if (scrollCartToAffectedLine(root, pulse.lineId)) return
      }
      if (attempts >= 12) {
        if (root) {
          pinnedRef.current = true
          scrollCartToBlockEnd(root)
        }
        return
      }
      attempts += 1
      raf = requestAnimationFrame(tryScroll)
    }

    raf = requestAnimationFrame(tryScroll)
    const layoutFollowUp = window.setTimeout(() => {
      const root = scrollNodeRef.current
      if (!root) return
      const escaped = CSS.escape(pulse.lineId)
      const el = root.querySelector<HTMLElement>(
        `[data-cart-line-id="${escaped}"]`,
      )
      if (el && isLastCartLine(root, el)) {
        pinnedRef.current = true
      }
      if (!scrollCartToAffectedLine(root, pulse.lineId)) {
        pinnedRef.current = true
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
