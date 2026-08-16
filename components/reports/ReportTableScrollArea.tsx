"use client"

import { useWorkspaceTableListScrollState } from "@/components/data-workspace/useWorkspaceTableListScrollState"
import {
  workspaceTableLayoutReportScrollClass,
  workspaceTableLayoutReportScrollScrolledScopeClass,
} from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { cn } from "@/lib/utils"
import type { ReactNode, RefObject } from "react"

type Props = {
  children: ReactNode
  className?: string
  scrollRef?: RefObject<HTMLDivElement | null>
}

export function ReportTableScrollArea({ children, className, scrollRef }: Props) {
  const { setRef, scrollProps } = useWorkspaceTableListScrollState(scrollRef)

  return (
    <div
      ref={setRef}
      className={cn(
        workspaceTableLayoutReportScrollClass,
        workspaceTableLayoutReportScrollScrolledScopeClass,
        className,
      )}
      {...scrollProps}
    >
      {children}
    </div>
  )
}
