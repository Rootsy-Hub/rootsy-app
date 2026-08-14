"use client"

import type { OperationSaleRow } from "@/app/[siteId]/[popId]/operations/actions"
import { exportSalesDetailReportCsv } from "@/lib/salesReportCsvExport"
import { exportSalesDetailReportPdf } from "@/lib/salesReportPdfExport"
import { RootsDefaultButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown/RootsDropdownMenu"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react"

export type SalesReportExportFormat = "csv" | "pdf"

type Props = {
  disabled?: boolean
  busy?: boolean
  onExport: (format: SalesReportExportFormat) => void | Promise<void>
}

export function SalesReportDownloadMenu({
  disabled = false,
  busy = false,
  onExport,
}: Props) {
  const isDisabled = disabled || busy

  return (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
        <RootsDefaultButton
          type="button"
          size="compact"
          disabled={isDisabled}
          className={cn(rootsButtonCompactSizeClass, "shrink-0 self-end sm:self-auto")}
          aria-busy={busy}
        >
          {busy ? (
            <RootsSpinner size="xs" aria-hidden className="shrink-0" />
          ) : (
            <Download className="size-4 shrink-0" aria-hidden />
          )}
          Descargar
          <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
        </RootsDefaultButton>
      </RootsDropdownTrigger>
      <RootsDropdownContent align="end" theme="light">
        <RootsDropdownItem
          theme="light"
          disabled={isDisabled}
          onSelect={() => void onExport("csv")}
        >
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 shrink-0" aria-hidden />
            Descargar CSV
          </span>
        </RootsDropdownItem>
        <RootsDropdownItem
          theme="light"
          disabled={isDisabled}
          onSelect={() => void onExport("pdf")}
        >
          <span className="flex items-center gap-2">
            <FileText className="size-4 shrink-0" aria-hidden />
            Descargar PDF
          </span>
        </RootsDropdownItem>
      </RootsDropdownContent>
    </RootsDropdownMenu>
  )
}
