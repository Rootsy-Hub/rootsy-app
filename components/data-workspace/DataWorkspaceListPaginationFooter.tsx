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
  RootsFormSelectContent,
  RootsFormSelectItem,
  RootsFormSelectTrigger,
  RootsFormSelectValue,
} from "@/components/rootsy-form"
import {
  darkTableFooterCenterClass,
  darkTableFooterTotalLabelClass,
  darkTableFooterClass,
  darkTableFooterNavIconButtonClass,
  darkTableFooterNavSideClass,
  earthTableFooterClass,
  earthTableFooterDotClass,
  earthTableFooterCenterClass,
  earthTableFooterNavIconButtonClass,
  earthTableFooterSelectItemClass,
  earthTableFooterSelectTriggerClass,
  earthTableFooterTotalLabelClass,
  tableChromeFooterClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  layoutsTablesFooterCountStrongClass,
  layoutsTablesFooterCountTextClass,
  layoutsTablesFooterGridClass,
  layoutsTablesFooterNavClusterClass,
  layoutsTablesFooterPageLabelClass,
  layoutsTablesFooterPageSizeClusterClass,
  layoutsTablesFooterSelectItemClass,
  layoutsTablesFooterSelectTriggerClass,
  layoutsTablesFooterSurfaceClass,
} from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { FooterTotalCountSkeleton } from "@/components/data-workspace/DataWorkspaceListPaginationFooterSkeleton"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { PopGlassChrome } from "@/components/layouts/PopGlassChrome"
import {
  popGlassFooterDotClass,
  popGlassFooterMutedTextClass,
} from "@/components/layouts/popHeaderBackdropStyles"
import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import type { PaginationItem } from "@/components/data-workspace/buildPaginationItems"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

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
  variant?: "default" | "dark" | "earth" | "tables"
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
  variant = "default",
}: DataWorkspaceListPaginationFooterProps) {
  const popWorkspace = usePopWorkspaceOptional()
  const backgroundImageUrl =
    popWorkspace?.bootstrap?.backgroundImageUrl ??
    popWorkspace?.popAccess?.pop.backgroundImageUrl ??
    null
  const isDark = variant === "dark"
  const isEarth = variant === "earth"
  const isTables = variant === "tables"
  const isCompact = isDark || isEarth || isTables
  const isEmpty = !listFetching && totalCount <= 0
  const paginationDisabled = listFetching || isEmpty
  const totalCountLabel = totalCount.toLocaleString("es-AR")

  const footerPaginationAriaLabel = listFetching
    ? "Cargando cantidad de resultados"
    : totalCount === 0
      ? "Sin resultados"
      : (() => {
          const pagePart =
            totalPages > 1
              ? `, página ${currentPage} de ${totalPages}`
              : ""
          return `Mostrando ${rangeStart.toLocaleString("es-AR")} a ${rangeEnd.toLocaleString("es-AR")} de ${totalCountLabel}${pagePart}`
        })()

  const effectiveTotalPages = Math.max(1, totalPages)

  if (isCompact) {
    const pageOptions = Array.from(
      { length: effectiveTotalPages },
      (_, i) => i + 1,
    )
    const safeCurrentPage = isEmpty
      ? 1
      : Math.min(Math.max(1, currentPage), effectiveTotalPages)

    if (isTables) {
      const footerBody = (
        <div className={layoutsTablesFooterGridClass}>
          <p className={cn(layoutsTablesFooterCountTextClass, "min-w-0 truncate")}>
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {footerPaginationAriaLabel}
            </span>
            <span aria-hidden>
              {isEmpty ? (
                "Nada para mostrar"
              ) : (
                <>
                  Viendo{" "}
                  <strong className={layoutsTablesFooterCountStrongClass}>
                    {listFetching
                      ? "…"
                      : `${rangeStart.toLocaleString("es-AR")} a ${rangeEnd.toLocaleString("es-AR")}`}
                  </strong>{" "}
                  de{" "}
                  {listFetching ? (
                    <FooterTotalCountSkeleton variant="tables" />
                  ) : (
                    <strong className={layoutsTablesFooterCountStrongClass}>
                      {totalCountLabel}
                    </strong>
                  )}
                </>
              )}
            </span>
          </p>

          <div className={layoutsTablesFooterNavClusterClass}>
            <RootsIconButton
              label="Ir al inicio"
              theme="pos"
              emphasis="ghost"
              size="default"
              className="hidden md:inline-flex"
              disabled={paginationDisabled || safeCurrentPage <= 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft aria-hidden />
            </RootsIconButton>
            <RootsIconButton
              label="Página anterior"
              theme="pos"
              emphasis="ghost"
              size="default"
              disabled={paginationDisabled || safeCurrentPage <= 1}
              onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            >
              <ChevronLeft aria-hidden />
            </RootsIconButton>
            <span className={layoutsTablesFooterPageLabelClass} aria-hidden>
              {safeCurrentPage.toLocaleString("es-AR")} /{" "}
              {effectiveTotalPages.toLocaleString("es-AR")}
            </span>
            <RootsIconButton
              label="Página siguiente"
              theme="pos"
              emphasis="ghost"
              size="default"
              disabled={paginationDisabled || safeCurrentPage >= effectiveTotalPages}
              onClick={() =>
                onPageChange(Math.min(effectiveTotalPages, safeCurrentPage + 1))
              }
            >
              <ChevronRight aria-hidden />
            </RootsIconButton>
            <RootsIconButton
              label="Ir al final"
              theme="pos"
              emphasis="ghost"
              size="default"
              className="hidden md:inline-flex"
              disabled={paginationDisabled || safeCurrentPage >= effectiveTotalPages}
              onClick={() => onPageChange(effectiveTotalPages)}
            >
              <ChevronsRight aria-hidden />
            </RootsIconButton>
          </div>

          <div className={layoutsTablesFooterPageSizeClusterClass}>
            <span
              id={pageSizeLabelId}
              className={cn(layoutsTablesFooterCountTextClass, "whitespace-nowrap")}
            >
              Por página
            </span>
            <Select
              value={String(pageSize)}
              disabled={paginationDisabled}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <RootsFormSelectTrigger
                tone="dark"
                aria-labelledby={pageSizeLabelId}
                aria-label="Resultados por página"
                className={layoutsTablesFooterSelectTriggerClass}
              >
                <RootsFormSelectValue />
              </RootsFormSelectTrigger>
              <RootsFormSelectContent tone="dark" align="end">
                {pageSizeOptions.map((n) => (
                  <RootsFormSelectItem
                    key={n}
                    tone="dark"
                    className={layoutsTablesFooterSelectItemClass}
                    value={String(n)}
                  >
                    {n.toLocaleString("es-AR")}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectContent>
            </Select>
          </div>
        </div>
      )

      return (
        <MenuHeaderEntity as="footer" size="module">
          <div
            className={layoutsTablesFooterSurfaceClass}
            role="navigation"
            aria-label="Paginación del listado"
            aria-busy={listFetching}
          >
            {footerBody}
          </div>
        </MenuHeaderEntity>
      )
    }

    const usePopGlassFooter = isDark && Boolean(backgroundImageUrl?.trim())
    const selectTone = "dark"
    const navButtonClass = isEarth
      ? earthTableFooterNavIconButtonClass
      : darkTableFooterNavIconButtonClass
    const dotClass = isEarth ? earthTableFooterDotClass : usePopGlassFooter ? popGlassFooterDotClass : "text-[#33443d]"
    const totalLabelClass = cn(
      isEarth ? earthTableFooterTotalLabelClass : darkTableFooterTotalLabelClass,
      isDark && usePopGlassFooter && popGlassFooterMutedTextClass,
    )
    const skeletonVariant = isEarth ? "earth" : "dark"
    const centerClass = isEarth ? earthTableFooterCenterClass : darkTableFooterCenterClass
    const footerLayoutClass = isEarth
      ? "grid h-full w-full grid-cols-[1fr_auto_1fr] items-center"
      : "flex h-full w-full items-center"

    const footerBody = (
      <div className={footerLayoutClass}>
          <div className={cn(darkTableFooterNavSideClass, "justify-start", isEarth && "!w-auto")}>
            <button
              type="button"
              className={navButtonClass}
              disabled={paginationDisabled || safeCurrentPage <= 1}
              aria-label="Ir al inicio"
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className={navButtonClass}
              disabled={paginationDisabled || safeCurrentPage <= 1}
              aria-label="Retroceder una página"
              onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
          </div>

          <div className={centerClass}>
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {footerPaginationAriaLabel}
            </span>

            {isEarth ? (
              <>
                <Select
                  value={String(safeCurrentPage)}
                  disabled={paginationDisabled}
                  onValueChange={(v) => onPageChange(Number(v))}
                >
                  <RootsFormSelectTrigger
                    tone="dark"
                    aria-label="Página"
                    className={earthTableFooterSelectTriggerClass}
                  >
                    <RootsFormSelectValue />
                  </RootsFormSelectTrigger>
                  <RootsFormSelectContent tone="light" align="center">
                    {pageOptions.map((p) => (
                      <RootsFormSelectItem
                        key={p}
                        tone="light"
                        className={earthTableFooterSelectItemClass}
                        value={String(p)}
                      >
                        {p.toLocaleString("es-AR")}
                      </RootsFormSelectItem>
                    ))}
                  </RootsFormSelectContent>
                </Select>

                <span className={dotClass} aria-hidden>
                  ·
                </span>

                <Select
                  value={String(pageSize)}
                  disabled={paginationDisabled}
                  onValueChange={(v) => onPageSizeChange(Number(v))}
                >
                  <RootsFormSelectTrigger
                    tone="dark"
                    aria-label="Cantidad por página"
                    className={earthTableFooterSelectTriggerClass}
                  >
                    <RootsFormSelectValue />
                  </RootsFormSelectTrigger>
                  <RootsFormSelectContent tone="light" align="center">
                    {pageSizeOptions.map((n) => (
                      <RootsFormSelectItem
                        key={n}
                        tone="light"
                        className={earthTableFooterSelectItemClass}
                        value={String(n)}
                      >
                        {n.toLocaleString("es-AR")}
                      </RootsFormSelectItem>
                    ))}
                  </RootsFormSelectContent>
                </Select>
              </>
            ) : (
              <>
                <Select
                  value={String(safeCurrentPage)}
                  disabled={paginationDisabled}
                  onValueChange={(v) => onPageChange(Number(v))}
                >
                  <RootsFormSelectTrigger tone={selectTone} aria-label="Página">
                    <RootsFormSelectValue />
                  </RootsFormSelectTrigger>
                  <RootsFormSelectContent tone={selectTone} align="center">
                    {pageOptions.map((p) => (
                      <RootsFormSelectItem key={p} tone={selectTone} value={String(p)}>
                        {p.toLocaleString("es-AR")}
                      </RootsFormSelectItem>
                    ))}
                  </RootsFormSelectContent>
                </Select>

                <span className={dotClass} aria-hidden>
                  ·
                </span>

                <Select
                  value={String(pageSize)}
                  disabled={paginationDisabled}
                  onValueChange={(v) => onPageSizeChange(Number(v))}
                >
                  <RootsFormSelectTrigger
                    tone={selectTone}
                    aria-labelledby={pageSizeLabelId}
                    aria-label="Resultados por página"
                  >
                    <RootsFormSelectValue />
                  </RootsFormSelectTrigger>
                  <RootsFormSelectContent tone={selectTone} align="center">
                    {pageSizeOptions.map((n) => (
                      <RootsFormSelectItem key={n} tone={selectTone} value={String(n)}>
                        {n.toLocaleString("es-AR")}
                      </RootsFormSelectItem>
                    ))}
                  </RootsFormSelectContent>
                </Select>
              </>
            )}

            <span className={dotClass} aria-hidden>
              ·
            </span>
            <span
              id={isEarth ? undefined : pageSizeLabelId}
              className={totalLabelClass}
              aria-hidden={isEarth}
            >
              {listFetching ? (
                <>
                  <FooterTotalCountSkeleton variant={skeletonVariant} className="md:hidden" />
                  <span className="hidden items-center gap-1 md:inline-flex">
                    <FooterTotalCountSkeleton variant={skeletonVariant} />
                    <span> en total</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="md:hidden">{totalCountLabel}</span>
                  <span className="hidden md:inline">{totalCountLabel} en total</span>
                </>
              )}
            </span>
          </div>

          <div className={cn(darkTableFooterNavSideClass, "justify-end", isEarth && "!w-auto")}>
            <button
              type="button"
              className={navButtonClass}
              disabled={paginationDisabled || safeCurrentPage >= effectiveTotalPages}
              aria-label="Avanzar una página"
              onClick={() =>
                onPageChange(Math.min(effectiveTotalPages, safeCurrentPage + 1))
              }
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className={navButtonClass}
              disabled={paginationDisabled || safeCurrentPage >= effectiveTotalPages}
              aria-label="Ir al final"
              onClick={() => onPageChange(effectiveTotalPages)}
            >
              <ChevronsRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
    )

    if (usePopGlassFooter) {
      return (
        <PopGlassChrome borderTop className="h-17 shrink-0">
          <div
            role="navigation"
            aria-label="Paginación del listado"
            aria-busy={listFetching}
            className="h-full"
          >
            {footerBody}
          </div>
        </PopGlassChrome>
      )
    }

    return (
      <div
        className={cn(
          isEarth ? earthTableFooterClass : darkTableFooterClass,
          "h-17 shrink-0",
        )}
        role="navigation"
        aria-label="Paginación del listado"
        aria-busy={listFetching}
      >
        {footerBody}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
        tableChromeFooterClass,
      )}
      aria-busy={listFetching}
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
          {listFetching ? (
            <FooterTotalCountSkeleton variant="default" />
          ) : (
            <span className="font-medium text-primary dark:text-primary/90">
              {totalCountLabel}
            </span>
          )}
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
            disabled={paginationDisabled}
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
          disabled={paginationDisabled || currentPage <= 1}
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
                disabled={paginationDisabled}
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
          disabled={paginationDisabled || currentPage >= totalPages}
          aria-label="Página siguiente"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
