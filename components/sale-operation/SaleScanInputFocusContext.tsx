"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react"

type SaleScanInputFocusContextValue = {
  registerScanInput: (element: HTMLInputElement | null) => void
  focusScanInput: () => void
}

const SaleScanInputFocusContext =
  createContext<SaleScanInputFocusContextValue | null>(null)

export function SaleScanInputFocusProvider({ children }: { children: ReactNode }) {
  const scanInputRef = useRef<HTMLInputElement | null>(null)

  const registerScanInput = useCallback((element: HTMLInputElement | null) => {
    scanInputRef.current = element
  }, [])

  const focusScanInput = useCallback(() => {
    window.setTimeout(() => {
      const el = scanInputRef.current
      if (!el || el.disabled) return
      el.focus({ preventScroll: true })
    }, 50)
  }, [])

  const value = useMemo(
    () => ({ registerScanInput, focusScanInput }),
    [registerScanInput, focusScanInput],
  )

  return (
    <SaleScanInputFocusContext.Provider value={value}>
      {children}
    </SaleScanInputFocusContext.Provider>
  )
}

export function useSaleScanInputFocus() {
  return useContext(SaleScanInputFocusContext)
}
