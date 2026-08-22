"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type OperarMobileToolboxItem = {
  id: string
  icon: LucideIcon
  configured: boolean
  disabled?: boolean
  ariaLabel: string
  onClick: () => void
}

type OperarMobileToolboxValue = {
  items: OperarMobileToolboxItem[] | null
  register: (next: OperarMobileToolboxItem[] | null) => void
}

const OperarMobileToolboxContext =
  createContext<OperarMobileToolboxValue | null>(null)

export function OperarMobileToolboxProvider({
  children,
}: {
  children: ReactNode
}) {
  const [items, setItems] = useState<OperarMobileToolboxItem[] | null>(null)
  const register = useCallback((next: OperarMobileToolboxItem[] | null) => {
    setItems(next)
  }, [])
  const value = useMemo(() => ({ items, register }), [items, register])

  return (
    <OperarMobileToolboxContext.Provider value={value}>
      {children}
    </OperarMobileToolboxContext.Provider>
  )
}

export function useRegisterOperarMobileToolbox(
  items: OperarMobileToolboxItem[],
) {
  const ctx = useContext(OperarMobileToolboxContext)
  const register = ctx?.register
  const itemsRef = useRef(items)
  itemsRef.current = items

  const fingerprint = items
    .map((item) => `${item.id}:${item.configured}:${item.disabled ? 1 : 0}:${item.ariaLabel}`)
    .join("|")

  useEffect(() => {
    if (!register) return
    register(
      itemsRef.current.map((item) => ({
        ...item,
        onClick: () => {
          itemsRef.current.find((current) => current.id === item.id)?.onClick()
        },
      })),
    )
    return () => register(null)
  }, [register, fingerprint])
}

export function OperarMobileToolboxIcons({
  className,
}: {
  className?: string
}) {
  const items = useContext(OperarMobileToolboxContext)?.items
  if (!items || items.length === 0) return null

  return (
    <div
      role="toolbar"
      aria-label="Configuración de la operación"
      className={cn(
        "grid shrink-0 grid-cols-4 gap-2 border-t border-[var(--rootsy-bruma-200)] px-3 py-2.5",
        "bg-[var(--rootsy-bruma-50)]",
        "md:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            aria-label={item.ariaLabel}
            onClick={item.onClick}
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-xl",
              "transition-[color,background-color,opacity,transform] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
              item.configured
                ? "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_16%,transparent)] text-[var(--rootsy-savia-700)]"
                : "bg-[color-mix(in_srgb,var(--rootsy-sombra-300)_08%,white)] text-[var(--rootsy-bruma-800)]",
              item.disabled && "pointer-events-none opacity-45",
            )}
          >
            <Icon className="size-5" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
