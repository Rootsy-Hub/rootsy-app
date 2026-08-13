"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  open: boolean
  children: ReactNode
  className?: string
  innerClassName?: string
}

/** Revelado vertical suave — operar / formularios dark (grid 0fr ↔ 1fr). */
export function OperarReveal({
  open,
  children,
  className,
  innerClassName,
}: Props) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none motion-reduce:opacity-100",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        !open && "pointer-events-none",
        className,
      )}
      aria-hidden={!open || undefined}
    >
      <div className={cn("min-h-0 overflow-hidden", innerClassName)}>
        {children}
      </div>
    </div>
  )
}
