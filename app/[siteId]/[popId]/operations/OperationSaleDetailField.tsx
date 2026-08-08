"use client"

import type { ReactNode } from "react"

export function OperationSaleDetailField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm leading-snug text-foreground">{children}</p>
    </div>
  )
}
