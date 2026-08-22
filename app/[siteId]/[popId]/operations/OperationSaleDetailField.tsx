"use client"

import {
  dataWorkspaceEntityCardStatLabelClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function OperationSaleDetailField({
  label,
  children,
  muted = false,
}: {
  label: string
  children: ReactNode
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className={dataWorkspaceEntityCardStatLabelClass}>{label}</p>
      <div
        className={cn(
          "min-w-0 font-canopy text-sm leading-snug text-[var(--rootsy-bruma-900)]",
          muted && "break-all text-xs text-[var(--rootsy-bruma-500)]",
        )}
      >
        {children}
      </div>
    </div>
  )
}
