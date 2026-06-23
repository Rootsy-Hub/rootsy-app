"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  darkTableFooterCenterClass,
  darkTableFooterCenterMutedClass,
  darkTableFooterClass,
  darkTableFooterNavButtonClass,
  darkTableFooterNavGroupClass,
  footerPaginationSelectTriggerClass,
  tableChromeFooterClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { PaginationItem } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import type { ReactNode } from "react"

export type DataWorkspaceListPaginationFooterProps = {
  listFetching: boolean
  totalCount: number
  rangeStart: number
  rangeEnd: number
  currentPage: number
  totalPages: number
  pageSize: number
  pageSizeOptions: readonly number[]
  paginationItems: PaginationItem[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeLabelId: string
  loadingSlot?: ReactNode
  variant?: "default" | "dark"
}

export function DataWorkspaceListPaginationFooter({
  listFetching,
  totalCount,
  rangeStart,
  rangeEnd,
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  paginationItems,
  onPageChange,
  onPageSizeChange,
  pageSizeLabelId,
  loadingSlot,
  variant = "default",
}: DataWorkspaceListPaginationFooterProps) {
  const isDark = variant === "dark"
  const totalCountLabel = totalCount.toLocaleString("es-AR")

  const footerPaginationAriaLabel =
    totalCount === 0
      ? "Sin resultados"
      : (() => {
          const pagePart =
            totalPages > 1
              ? `, página ${currentPage} de ${totalPages}`
              : ""
          return `Mostrando ${rangeStart.toLocaleString("es-AR")} a ${rangeEnd.toLocaleString("es-AR")} de ${totalCountLabel}${pagePart}`
        })()

  if (listFetching) {
    return (
      <div
        className={cn("shrink-0", isDark ? darkTableFooterClass : tableChromeFooterClass)}
      >
        {loadingSlot}
      </div>
    )
  }
  if (totalCount <= 0) {
    return null
  }

  if (isDark) {
    const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
      <div
        className={darkTableFooterClass}
        role="navigation"
        aria-label="Paginación del listado"
      >
        <div className="flex w-full items-stretch">
          <div className={cn(darkTableFooterNavGroupClass, "justify-start")}>
            <button
              type="button"
              className={cn(
                darkTableFooterNavButtonClass,
                "border-r border-white/10",
              )}
              disabled={currentPage <= 1}
              aria-label="Ir a la primera página"
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft className="size-7" aria-hidden />
            </button>
            <button
              type="button"
              className={darkTableFooterNavButtonClass}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <ChevronLeft className="size-7" aria-hidden />
            </button>
          </div>

          <div className={darkTableFooterCenterClass}>
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {footerPaginationAriaLabel}
            </span>

            <Select
              value={String(currentPage)}
              onValueChange={(v) => onPageChange(Number(v))}
            >
              <SelectTrigger
                className={footerPaginationSelectTriggerClass}
                aria-label="Página"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="center">
                {pageOptions.map((p) => (
                  <SelectItem key={p} value={String(p)}>
                    {p.toLocaleString("es-AR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-white/20" aria-hidden>
              ·
            </span>

            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger
                className={footerPaginationSelectTriggerClass}
                aria-labelledby={pageSizeLabelId}
                aria-label="Resultados por página"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="center">
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n.toLocaleString("es-AR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-white/20" aria-hidden>
              ·
            </span>
            <span
              id={pageSizeLabelId}
              className={darkTableFooterCenterMutedClass}
              aria-hidden
            >
              {totalCountLabel}
            </span>
          </div>

          <div className={cn(darkTableFooterNavGroupClass, "justify-end")}>
            <button
              type="button"
              className={cn(
                darkTableFooterNavButtonClass,
                "border-l border-white/10",
              )}
              disabled={currentPage >= totalPages}
              aria-label="Página siguiente"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
            >
              <ChevronRight className="size-7" aria-hidden />
            </button>
            <button
              type="button"
              className={darkTableFooterNavButtonClass}
              disabled={currentPage >= totalPages}
              aria-label="Ir a la última página"
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronsRight className="size-7" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
        tableChromeFooterClass,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/90">
          <span className="text-foreground/80 dark:text-foreground/85">
            {rangeStart.toLocaleString("es-AR")}
          </span>
          <span className="text-muted-foreground/60">–</span>
          <span className="text-foreground/80">
            {rangeEnd.toLocaleString("es-AR")}
          </span>
          <span className="normal-case"> de </span>
          <span className="font-medium text-primary dark:text-primary/90">
            {totalCountLabel}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <span
            id={pageSizeLabelId}
            className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/90"
          >
            Por página
          </span>
          <Select
            value={String(pageSize)}
            disabled={listFetching}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-[4.25rem] border-border/80 bg-background/80 text-xs shadow-sm dark:border-border/60 dark:bg-background/50 dark:text-foreground/90"
              aria-labelledby={pageSizeLabelId}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 border-border/80 bg-background/80 shadow-sm dark:border-border/55 dark:bg-card/50 dark:hover:bg-accent/60"
          disabled={listFetching || currentPage <= 1}
          aria-label="Página anterior"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div
          className="flex items-center gap-1"
          role="navigation"
          aria-label="Paginación por número"
        >
          {paginationItems.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex min-w-8 items-center justify-center px-1 text-xs text-muted-foreground dark:text-muted-foreground/80"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={currentPage === item ? "default" : "outline"}
                size="sm"
                disabled={listFetching}
                className={cn(
                  "h-8 min-w-8 px-2 text-xs",
                  currentPage === item
                    ? "shadow-sm"
                    : "dark:border-border/55 dark:bg-card/40 dark:hover:bg-accent/50",
                )}
                aria-label={`Ir a página ${item}`}
                aria-current={currentPage === item ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item.toLocaleString("es-AR")}
              </Button>
            ),
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 border-border/80 bg-background/80 shadow-sm dark:border-border/55 dark:bg-card/50 dark:hover:bg-accent/60"
          disabled={listFetching || currentPage >= totalPages}
          aria-label="Página siguiente"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
