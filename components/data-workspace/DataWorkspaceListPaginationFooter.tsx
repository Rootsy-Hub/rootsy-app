"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { tableChromeFooterClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { PaginationItem } from "@/app/[siteId]/[popId]/layout/layoutPreviewPagination"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
}: DataWorkspaceListPaginationFooterProps) {
  if (listFetching) {
    return (
      <div className={cn("shrink-0", tableChromeFooterClass)}>
        {loadingSlot}
      </div>
    )
  }
  if (totalCount <= 0) {
    return null
  }
  const totalCountLabel = totalCount.toLocaleString("es-AR")
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
