"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import "@/components/data-workspace/dataWorkspaceTableInfinite.css"
import { Select } from "@/components/ui/select"
import {
  RootsFormSelectContent,
  RootsFormSelectItem,
  RootsFormSelectTrigger,
  RootsFormSelectValue,
} from "@/components/rootsy-form"
import {
  layoutsTablesFooterCountStrongClass,
  layoutsTablesFooterCountTextClass,
  layoutsTablesFooterSelectItemClass,
  layoutsTablesFooterSelectTriggerClass,
} from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { dataWorkspaceTableInfiniteDockPages } from "@/lib/dataWorkspaceTableInfinite"
import { cn } from "@/lib/utils"

/** Dock de artículos — alcanza con page + conteos. */
export function DataWorkspaceTableListPageDock({
  listFetching,
  loadedCount,
  totalCount,
  page = 1,
  onPageJump,
}: {
  listFetching: boolean
  loadedCount: number
  totalCount: number
  page?: number
  onPageJump: (page: number) => void
}) {
  const { startPage, totalPages, loadedPages } =
    dataWorkspaceTableInfiniteDockPages(loadedCount, totalCount, page)
  return (
    <DataWorkspaceTableInfinitePageDock
      listFetching={listFetching}
      loadedCount={loadedCount}
      totalCount={totalCount}
      startPage={startPage}
      totalPages={totalPages}
      loadedPages={loadedPages}
      onPageJump={onPageJump}
    />
  )
}

export function DataWorkspaceTableInfinitePageDock({
  listFetching,
  loadedCount,
  totalCount,
  startPage,
  totalPages,
  loadedPages,
  onPageJump,
}: {
  listFetching: boolean
  loadedCount: number
  totalCount: number
  startPage: number
  totalPages: number
  loadedPages: ReadonlySet<number>
  onPageJump: (page: number) => void
}) {
  const loadedPageCount = loadedPages.size
  const lastLoadedPage =
    loadedPageCount === 0 ? startPage : startPage + loadedPageCount - 1
  const selectValue = String(
    Math.min(Math.max(1, lastLoadedPage), Math.max(1, totalPages)),
  )
  const pageOptions = Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1)
  const isEmpty = !listFetching && totalCount <= 0
  const selectDisabled = listFetching || isEmpty

  return (
    <MenuHeaderEntity
      as="footer"
      size="dialog"
      className="data-workspace-table-page-dock transform-gpu w-64 overflow-hidden rounded-xl backdrop-blur-[8px] backdrop-saturate-[1.05] shadow-[0_16px_40px_color-mix(in_srgb,var(--rootsy-sombra-950)_42%,transparent)]"
    >
      <div
        className="relative z-[2] flex w-full items-center justify-between gap-4 py-1.5 pl-3.5 pr-1.5"
        role="navigation"
        aria-label="Paginación del listado"
        aria-busy={listFetching}
      >
        <p
          className={cn(
            layoutsTablesFooterCountTextClass,
            "block min-w-0 flex-1 truncate text-left text-xs font-medium tabular-nums md:justify-self-auto",
          )}
        >
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {isEmpty
              ? "Sin resultados"
              : listFetching
                ? "Cargando resultados"
                : `Viendo ${loadedCount.toLocaleString("es-AR")} de ${totalCount.toLocaleString("es-AR")}`}
          </span>
          <span aria-hidden>
            {isEmpty ? (
              "Nada"
            ) : (
              <>
                <strong className={layoutsTablesFooterCountStrongClass}>
                  {listFetching ? "…" : loadedCount.toLocaleString("es-AR")}
                </strong>
                <span className="mx-1 text-[var(--rootsy-sombra-400)]">/</span>
                {listFetching ? "…" : totalCount.toLocaleString("es-AR")}
              </>
            )}
          </span>
        </p>
        <div className="shrink-0">
        <Select
          value={selectValue}
          disabled={selectDisabled}
          onValueChange={(value) => {
            const page = Number(value)
            if (!Number.isFinite(page) || loadedPages.has(page)) return
            onPageJump(page)
          }}
        >
          <RootsFormSelectTrigger
            tone="dark"
            aria-label="Ir a una página"
            className={cn(
              layoutsTablesFooterSelectTriggerClass,
              "!h-8 !min-h-8 !w-[3.75rem] min-w-[3.75rem] max-w-[3.75rem] !rounded-lg text-[11px]",
            )}
          >
            <RootsFormSelectValue />
          </RootsFormSelectTrigger>
          <RootsFormSelectContent tone="dark" align="center" className="max-h-64">
            {pageOptions.map((page) => (
              <RootsFormSelectItem
                key={page}
                tone="dark"
                value={String(page)}
                disabled={loadedPages.has(page)}
                className={layoutsTablesFooterSelectItemClass}
              >
                {page.toLocaleString("es-AR")}
              </RootsFormSelectItem>
            ))}
          </RootsFormSelectContent>
        </Select>
        </div>
      </div>
    </MenuHeaderEntity>
  )
}
