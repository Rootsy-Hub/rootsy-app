"use client"

import {
  SalesReportDownloadMenu,
  type SalesReportExportFormat,
} from "@/components/reports/SalesReportDownloadMenu"
import { RootsIconButton } from "@/components/rootsy-button"
import { showReportExportInProgressToast } from "@/lib/reportExportInProgressToast"
import { cn } from "@/lib/utils"
import { Printer } from "lucide-react"
import { useCallback, useState } from "react"

type PendingExportAction = "export" | "print" | null

type Props = {
  disabled?: boolean
  busy?: boolean
  onExport: (format: SalesReportExportFormat) => void | Promise<void>
  onPrint: () => void | Promise<void>
  showPrint?: boolean
  className?: string
}

export function ReportExportActionButtons({
  disabled = false,
  onExport,
  onPrint,
  showPrint = true,
  className,
}: Props) {
  const [pendingAction, setPendingAction] = useState<PendingExportAction>(null)

  const handleExport = useCallback(
    async (format: SalesReportExportFormat) => {
      setPendingAction("export")
      const dismissToast = showReportExportInProgressToast()
      try {
        await onExport(format)
      } finally {
        setPendingAction(null)
        dismissToast()
      }
    },
    [onExport],
  )

  const handlePrint = useCallback(async () => {
    if (typeof onPrint !== "function") return
    setPendingAction("print")
    const dismissToast = showReportExportInProgressToast()
    try {
      await onPrint()
    } finally {
      setPendingAction(null)
      dismissToast()
    }
  }, [onPrint])

  const exportLoading = pendingAction === "export"
  const printLoading = pendingAction === "print"

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2 self-end sm:self-auto",
        className,
      )}
    >
      <SalesReportDownloadMenu
        disabled={disabled || printLoading}
        busy={exportLoading}
        onExport={handleExport}
      />
      {showPrint ? (
        <RootsIconButton
          type="button"
          label="Imprimir"
          size="compact"
          tone="secondary"
          disabled={disabled || exportLoading}
          loading={printLoading}
          onClick={() => {
            void handlePrint()
          }}
        >
          <Printer aria-hidden />
        </RootsIconButton>
      ) : null}
    </div>
  )
}
