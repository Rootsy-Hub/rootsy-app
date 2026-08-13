"use client"

import {
  layoutsOperarCatalogToolbarControlFocusClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  operarCanvasToolbarColumnHeaderClass,
  operarCanvasToolbarLabelClass,
  operarCanvasToolbarCountPillBaseClass,
  operarCanvasToolbarCountPillWideClass,
  operarCanvasToolbarCountPillOpenClass,
  operarCanvasToolbarCountPillTotalActiveClass,
  operarCanvasToolbarCountPillTotalIdleClass,
  operarCanvasToolbarColumnIconClass,
  operarCanvasToolbarIndicatorClass,
  operarCanvasToolbarShellClass,
  operarCanvasToolbarTabActiveClass,
  operarCanvasToolbarTabButtonClass,
  operarCanvasToolbarTabIdleClass,
} from "@/components/sale-operation/operarCanvasToolbarStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

const OperarCanvasToolbarTabsContext = createContext<
  ((id: string, el: HTMLButtonElement | null) => void) | null
>(null)

export function OperarCanvasToolbarCountPill({
  value,
  variant,
  active = false,
  label,
}: {
  value: number
  variant: "open" | "total"
  active?: boolean
  label: string
}) {
  return (
    <span
      className={cn(
        operarCanvasToolbarCountPillBaseClass,
        String(value).length > 1 && operarCanvasToolbarCountPillWideClass,
        variant === "open"
          ? operarCanvasToolbarCountPillOpenClass
          : active
            ? operarCanvasToolbarCountPillTotalActiveClass
            : operarCanvasToolbarCountPillTotalIdleClass,
      )}
      aria-label={label}
      title={label}
    >
      {value}
    </span>
  )
}

export function OperarCanvasToolbarColumnHeader({
  icon: Icon,
  label,
  count,
  className,
}: {
  icon: LucideIcon
  label: string
  count: number
  className?: string
}) {
  const countLabel = `${count} pedido${count === 1 ? "" : "s"}`

  return (
    <div
      className={cn(operarCanvasToolbarColumnHeaderClass, className)}
      aria-label={`${label}. ${countLabel}`}
    >
      <Icon
        className={cn("size-3.5 shrink-0", operarCanvasToolbarColumnIconClass)}
        aria-hidden
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          operarCanvasToolbarLabelClass,
          operarCanvasToolbarTabActiveClass,
        )}
      >
        {label}
      </span>
      <span className="ml-auto shrink-0">
        <OperarCanvasToolbarCountPill
          value={count}
          variant="total"
          active
          label={countLabel}
        />
      </span>
    </div>
  )
}

type OperarCanvasToolbarTabsProps<T extends string> = {
  value: T
  ariaLabel: string
  children: ReactNode
  className?: string
}

/** Barra de tabs oscura con indicador savia — salones, filtros de canvas. */
export function OperarCanvasToolbarTabs<T extends string>({
  value,
  ariaLabel,
  children,
  className,
}: OperarCanvasToolbarTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<string, HTMLButtonElement | null>>>({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  const registerRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    tabRefs.current[id] = el
  }, [])

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    const tab = tabRefs.current[value]
    if (!container || !tab) return
    const cRect = container.getBoundingClientRect()
    const tRect = tab.getBoundingClientRect()
    setIndicator({
      left: tRect.left - cRect.left,
      width: tRect.width,
      ready: true,
    })
  }, [value])

  useLayoutEffect(() => {
    updateIndicator()
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(updateIndicator)
    ro.observe(container)
    return () => ro.disconnect()
  }, [updateIndicator, children, value])

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", operarCanvasToolbarShellClass, className)}
    >
      <div
        ref={containerRef}
        className="relative flex h-full w-full min-w-0"
        role="tablist"
        aria-label={ariaLabel}
      >
        <span
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 h-0.5",
            operarCanvasToolbarIndicatorClass,
            "transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
            indicator.ready ? "opacity-100" : "opacity-0",
          )}
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
          }}
          aria-hidden
        />
        <OperarCanvasToolbarTabsContext.Provider value={registerRef}>
          {children}
        </OperarCanvasToolbarTabsContext.Provider>
      </div>
    </div>
  )
}

export function OperarCanvasToolbarTab({
  active,
  onClick,
  ariaLabel,
  tabId,
  children,
}: {
  active: boolean
  onClick: () => void
  ariaLabel: string
  tabId: string
  children: ReactNode
}) {
  const registerRef = useContext(OperarCanvasToolbarTabsContext)

  return (
    <button
      ref={(el) => registerRef?.(tabId, el)}
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        operarCanvasToolbarTabButtonClass,
        layoutsOperarCatalogToolbarControlFocusClass,
        "focus-visible:ring-inset",
        active ? operarCanvasToolbarTabActiveClass : operarCanvasToolbarTabIdleClass,
      )}
    >
      {children}
    </button>
  )
}

/** Fila de headers de columnas Kanban — misma toolbar que salones. */
export function OperarCanvasToolbarColumnHeaderRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid shrink-0 grid-cols-3 divide-x divide-[var(--layouts-operar-border-dark-hairline)]",
        className,
      )}
    >
      {children}
    </div>
  )
}
