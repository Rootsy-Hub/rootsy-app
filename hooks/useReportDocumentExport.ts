"use client"

import type { SalesReportExportFormat } from "@/components/reports/SalesReportDownloadMenu"
import { getReportExportContext } from "@/lib/reportExportContextActions"
import type { ReportExportContext } from "@/lib/reportExportContext"
import { useCallback, useState } from "react"

type Options = {
  popId: string
  disabled?: boolean
  emptyMessage?: string
  exportFn: (
    format: SalesReportExportFormat,
    context: ReportExportContext,
  ) => Promise<void>
}

export function useReportDocumentExport({
  popId,
  disabled = false,
  emptyMessage = "No hay datos para exportar.",
  exportFn,
}: Options) {
  const [exportBusy, setExportBusy] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = useCallback(
    async (format: SalesReportExportFormat) => {
      if (disabled) {
        setExportError(emptyMessage)
        return
      }

      setExportBusy(true)
      setExportError(null)
      try {
        const res = await getReportExportContext(popId)
        if (!res.success) {
          setExportError(res.error)
          return
        }
        await exportFn(format, res.context)
      } catch (e: unknown) {
        setExportError(
          e instanceof Error ? e.message : "No se pudo exportar el reporte.",
        )
      } finally {
        setExportBusy(false)
      }
    },
    [disabled, emptyMessage, exportFn, popId],
  )

  return { exportBusy, exportError, handleExport, setExportError }
}
