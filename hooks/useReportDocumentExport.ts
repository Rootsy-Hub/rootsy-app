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
  printFn: (context: ReportExportContext) => Promise<void>
}

export function useReportDocumentExport({
  popId,
  disabled = false,
  emptyMessage = "No hay datos para exportar.",
  exportFn,
  printFn,
}: Options) {
  const [exportBusy, setExportBusy] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const runWithContext = useCallback(
    async (action: (context: ReportExportContext) => Promise<void>) => {
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
        await action(res.context)
      } catch (e: unknown) {
        setExportError(
          e instanceof Error ? e.message : "No se pudo exportar el reporte.",
        )
      } finally {
        setExportBusy(false)
      }
    },
    [disabled, emptyMessage, popId],
  )

  const handleExport = useCallback(
    async (format: SalesReportExportFormat) => {
      await runWithContext((context) => exportFn(format, context))
    },
    [exportFn, runWithContext],
  )

  const handlePrint = useCallback(async () => {
    await runWithContext(printFn)
  }, [printFn, runWithContext])

  return { exportBusy, exportError, handleExport, handlePrint, setExportError }
}
