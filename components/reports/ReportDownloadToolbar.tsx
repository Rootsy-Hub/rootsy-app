"use client"

import {
  SalesReportDownloadMenu,
  type SalesReportExportFormat,
} from "@/components/reports/SalesReportDownloadMenu"
import { dataWorkspaceDetailEmptyStateDescriptionClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  periodSummary: string
  disabled?: boolean
  exportBusy?: boolean
  exportError?: string | null
  onExport: (format: SalesReportExportFormat) => void | Promise<void>
  className?: string
  children?: ReactNode
}

export function ReportDownloadToolbar({
  periodSummary,
  disabled = false,
  exportBusy = false,
  exportError = null,
  onExport,
  className,
  children,
}: Props) {
  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-rootsy-bruma-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8",
          className,
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
            {periodSummary}
          </p>
          {children}
        </div>
        <SalesReportDownloadMenu
          disabled={disabled}
          busy={exportBusy}
          onExport={onExport}
        />
      </div>

      {exportError ? (
        <div
          role="alert"
          className="mx-4 mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6 lg:mx-8"
        >
          {exportError}
        </div>
      ) : null}
    </>
  )
}
