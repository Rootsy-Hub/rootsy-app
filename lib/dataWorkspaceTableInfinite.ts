import { uniqueById } from "@/lib/operateCatalogPage"
import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query"

/** Página fija de los listados tabla — scroll infinito, sin pie de paginación. */
export const DATA_WORKSPACE_TABLE_PAGE_SIZE = 20

export function dataWorkspaceTableStartPage(page: number) {
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
}

export function dataWorkspaceTableLoadedPageSet(
  startPage: number,
  loadedCount: number,
  pageSize = DATA_WORKSPACE_TABLE_PAGE_SIZE,
) {
  const pages = new Set<number>()
  if (startPage < 1 || pageSize < 1 || loadedCount <= 0) return pages
  const loadedPages = Math.ceil(loadedCount / pageSize)
  for (let i = 0; i < loadedPages; i++) {
    pages.add(startPage + i)
  }
  return pages
}

/** Última página del catálogo ya está en esta vista (tramo actual). */
export function dataWorkspaceTableReachedLastPage(
  startPage: number,
  loadedCount: number,
  totalCount: number,
  pageSize = DATA_WORKSPACE_TABLE_PAGE_SIZE,
) {
  if (totalCount <= 0 || loadedCount <= 0 || pageSize < 1) return false
  const totalPages = Math.ceil(totalCount / pageSize)
  const loadedPages = Math.ceil(loadedCount / pageSize)
  return startPage + loadedPages - 1 >= totalPages
}

export function nextDataWorkspaceTablePage(
  page: number,
  totalCount: number,
  pageSize = DATA_WORKSPACE_TABLE_PAGE_SIZE,
) {
  if (page < 1 || pageSize < 1 || totalCount <= 0) return undefined
  return page * pageSize < totalCount ? page + 1 : undefined
}

/** Normaliza params de listado para que el cache infinito no se parta por `page`/`ps` de la URL. */
export function pinDataWorkspaceTableInfiniteParams<T extends { page: number; pageSize: number }>(
  params: T,
): T {
  return {
    ...params,
    page: 1,
    pageSize: DATA_WORKSPACE_TABLE_PAGE_SIZE,
  }
}

/**
 * Si un refetch appende la misma página, se queda la más nueva y se ordena por pageParam.
 */
export function coalesceInfiniteTablePages<T>(data: {
  pages: T[]
  pageParams: number[]
}): { pages: T[]; pageParams: number[] } {
  if (data.pages.length <= 1) return data
  const byParam = new Map<number, T>()
  for (let i = 0; i < data.pageParams.length; i++) {
    const param = Number(data.pageParams[i])
    if (!Number.isFinite(param)) continue
    byParam.set(param, data.pages[i]!)
  }
  const pageParams = [...byParam.keys()].sort((a, b) => a - b)
  const pages = pageParams.map((param) => byParam.get(param)!)
  const sameOrder =
    pages.length === data.pages.length &&
    pageParams.every((param, index) => param === data.pageParams[index])
  if (sameOrder) return data
  return { pages, pageParams }
}

export function uniqueTableRowsById<T>(rows: T[]): T[] {
  if (rows.length < 2) return rows
  const first = rows[0]
  if (
    !first ||
    typeof first !== "object" ||
    !("id" in first) ||
    typeof (first as { id: unknown }).id !== "string"
  ) {
    return rows
  }
  return uniqueById(rows as { id: string }[]) as T[]
}

export function isInfiniteTableData<T>(
  data: unknown,
): data is InfiniteData<T, number> {
  return (
    !!data &&
    typeof data === "object" &&
    "pages" in data &&
    "pageParams" in data &&
    Array.isArray((data as InfiniteData<unknown>).pages) &&
    Array.isArray((data as InfiniteData<unknown>).pageParams)
  )
}

/** Acepta InfiniteData o una página suelta (prefetch plano legado). */
export function pagesOfInfiniteTableData<T>(
  data: InfiniteData<T, number> | T,
): T[] {
  if (isInfiniteTableData<T>(data)) {
    return coalesceInfiniteTablePages(data).pages
  }
  return [data]
}

/** Recorta a la primera página y refetch — evita ids duplicados tras crear/editar. */
export async function invalidateDataWorkspaceTableInfinite(
  queryClient: QueryClient,
  queryKey: QueryKey,
  options?: { refetchType?: "active" | "inactive" | "all" | "none" },
) {
  queryClient.setQueriesData({ queryKey }, (data) => {
    if (!isInfiniteTableData(data)) return data
    if (data.pages.length <= 1) return data
    return {
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }
  })
  await queryClient.invalidateQueries({
    queryKey,
    refetchType: options?.refetchType,
  })
}
