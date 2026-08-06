export type WorkspaceTableSortDirection = "asc" | "desc"

export type WorkspaceTableSortDisplayDirection = "none" | WorkspaceTableSortDirection

export type WorkspaceTableSortState = {
  sort: string | null
  ord: WorkspaceTableSortDirection
}

export const WORKSPACE_TABLE_SORT_URL = {
  sort: "sort",
  ord: "ord",
} as const

export function parseWorkspaceTableSortUrl(
  searchParams: URLSearchParams,
  allowed: readonly string[],
): WorkspaceTableSortState {
  const rawSort = searchParams.get(WORKSPACE_TABLE_SORT_URL.sort)?.trim() ?? ""
  const sort = allowed.includes(rawSort) ? rawSort : null
  const ordRaw = searchParams.get(WORKSPACE_TABLE_SORT_URL.ord)?.trim().toLowerCase()
  const ord: WorkspaceTableSortDirection =
    ordRaw === "desc" ? "desc" : "asc"
  return { sort, ord }
}

export function appendWorkspaceTableSortParams(
  params: URLSearchParams,
  state: WorkspaceTableSortState,
) {
  if (state.sort) {
    params.set(WORKSPACE_TABLE_SORT_URL.sort, state.sort)
    if (state.ord !== "asc") {
      params.set(WORKSPACE_TABLE_SORT_URL.ord, state.ord)
    } else {
      params.delete(WORKSPACE_TABLE_SORT_URL.ord)
    }
  } else {
    params.delete(WORKSPACE_TABLE_SORT_URL.sort)
    params.delete(WORKSPACE_TABLE_SORT_URL.ord)
  }
}

export function nextWorkspaceTableSortState(
  current: WorkspaceTableSortState,
  column: string,
): WorkspaceTableSortState {
  if (current.sort !== column) {
    return { sort: column, ord: "asc" }
  }
  if (current.ord === "asc") {
    return { sort: column, ord: "desc" }
  }
  return { sort: null, ord: "asc" }
}

export function workspaceTableSortDisplayDirection(
  state: WorkspaceTableSortState,
  column: string,
): WorkspaceTableSortDisplayDirection {
  if (state.sort !== column) return "none"
  return state.ord
}

export type WorkspaceTableSortConfig<T extends string = string> = {
  allowed: Record<T, string>
  defaultColumn: T
  defaultAscending: boolean
}

export function resolveWorkspaceTableListOrder<T extends string>(
  state: WorkspaceTableSortState,
  config: WorkspaceTableSortConfig<T>,
): { column: string; ascending: boolean } {
  const key =
    state.sort && state.sort in config.allowed
      ? (state.sort as T)
      : config.defaultColumn
  const ascending =
    state.sort && state.sort in config.allowed
      ? state.ord === "asc"
      : config.defaultAscending
  return { column: config.allowed[key], ascending }
}

export function sortRowsInMemory<T>(
  rows: T[],
  state: WorkspaceTableSortState,
  config: {
    allowed: Record<string, (row: T) => string | number | null | undefined>
    defaultColumn: string
    defaultAscending: boolean
  },
): T[] {
  const key =
    state.sort && state.sort in config.allowed
      ? state.sort
      : config.defaultColumn
  const ascending =
    state.sort && state.sort in config.allowed
      ? state.ord === "asc"
      : config.defaultAscending
  const accessor = config.allowed[key]
  if (!accessor) return rows

  return [...rows].sort((a, b) => {
    const av = accessor(a)
    const bv = accessor(b)
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === "number" && typeof bv === "number") {
      return ascending ? av - bv : bv - av
    }
    const cmp = String(av).localeCompare(String(bv), "es", {
      sensitivity: "base",
      numeric: true,
    })
    return ascending ? cmp : -cmp
  })
}
