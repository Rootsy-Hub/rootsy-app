"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"

export type PopOptimisticNav = {
  href: string
  title: string
}

type PopOptimisticNavContextValue = {
  pending: PopOptimisticNav | null
  start: (nav: PopOptimisticNav) => void
  clear: () => void
}

const PopOptimisticNavContext =
  createContext<PopOptimisticNavContextValue | null>(null)

function pathOf(href: string): string {
  const queryIndex = href.indexOf("?")
  const hashIndex = href.indexOf("#")
  const end =
    queryIndex >= 0 && hashIndex >= 0
      ? Math.min(queryIndex, hashIndex)
      : queryIndex >= 0
        ? queryIndex
        : hashIndex
  return end >= 0 ? href.slice(0, end) : href
}

export function navigationArrived(pathname: string, href: string): boolean {
  const target = pathOf(href)
  return pathname === target || pathname.startsWith(`${target}/`)
}

export function PopOptimisticNavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [pending, setPending] = useState<PopOptimisticNav | null>(null)

  const start = useCallback((nav: PopOptimisticNav) => {
    setPending(nav)
  }, [])

  const clear = useCallback(() => {
    setPending(null)
  }, [])

  useEffect(() => {
    if (!pending) return
    if (navigationArrived(pathname, pending.href)) {
      setPending(null)
    }
  }, [pathname, pending])

  const value = useMemo(
    (): PopOptimisticNavContextValue => ({ pending, start, clear }),
    [pending, start, clear],
  )

  return (
    <PopOptimisticNavContext.Provider value={value}>
      {children}
    </PopOptimisticNavContext.Provider>
  )
}

export function usePopOptimisticNav(): PopOptimisticNavContextValue {
  const ctx = useContext(PopOptimisticNavContext)
  if (!ctx) {
    return {
      pending: null,
      start: () => {},
      clear: () => {},
    }
  }
  return ctx
}
