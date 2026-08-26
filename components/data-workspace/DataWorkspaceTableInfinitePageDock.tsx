"use client"

import { MenuHeaderEntity } from "@/app/[siteId]/[popId]/menu/MenuHeaderEntity"
import { Select } from "@/components/ui/select"
import {
  RootsFormSelectContent,
  RootsFormSelectItem,
  RootsFormSelectTrigger,
  RootsFormSelectValue,
} from "@/components/rootsy-form"
import {
  earthTableFooterSelectItemClass,
  earthTableFooterSelectTriggerClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  layoutsTablesFooterCountStrongClass,
  layoutsTablesFooterCountTextClass,
} from "@/components/layouts-tables/rootsLayoutsTablesProductStyles"
import { cn } from "@/lib/utils"

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
  const selectDisabled = listFetching || isEmpty || totalPages <= 1

  return (
    <MenuHeaderEntity
      as="footer"
      size="dialog"
      className="w-auto overflow-hidden rounded-xl shadow-[0_16px_40px_color-mix(in_srgb,var(--rootsy-sombra-950)_42%,transparent)]"
    >
      <div
        className="flex items-center gap-2.5 px-3 py-1.5"
        role="navigation"
        aria-label="Paginación del listado"
        aria-busy={listFetching}
      >
        <p
          className={cn(
            layoutsTablesFooterCountTextClass,
            "block whitespace-nowrap text-xs font-medium tabular-nums md:justify-self-auto",
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
                <span className="mx-1 text-[var(--rootsy-suelo-400)]">/</span>
                {listFetching ? "…" : totalCount.toLocaleString("es-AR")}
              </>
            )}
          </span>
        </p>
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
              earthTableFooterSelectTriggerClass,
              "!h-8 !min-h-8 !w-[3.75rem] min-w-[3.75rem] max-w-[3.75rem] !rounded-lg text-[11px]",
            )}
          >
            <RootsFormSelectValue />
          </RootsFormSelectTrigger>
          <RootsFormSelectContent tone="light" align="center" className="max-h-64">
            {pageOptions.map((page) => (
              <RootsFormSelectItem
                key={page}
                tone="light"
                value={String(page)}
                disabled={loadedPages.has(page)}
                className={earthTableFooterSelectItemClass}
              >
                {page.toLocaleString("es-AR")}
              </RootsFormSelectItem>
            ))}
          </RootsFormSelectContent>
        </Select>
      </div>
    </MenuHeaderEntity>
  )
}
