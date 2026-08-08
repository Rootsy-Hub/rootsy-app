export type OperationsViewId = "sales" | "tables" | "counter" | "purchases" | "expenses"

const VALID_VIEWS = new Set<OperationsViewId>([
  "sales",
  "tables",
  "counter",
  "purchases",
  "expenses",
])

const STORAGE_PREFIX = "rootsy:operations-view:"

function isOperationsViewId(value: unknown): value is OperationsViewId {
  return typeof value === "string" && VALID_VIEWS.has(value as OperationsViewId)
}

export function readSavedOperationsView(
  popId: string,
): OperationsViewId | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (!raw) return undefined
    return isOperationsViewId(raw) ? raw : undefined
  } catch {
    return undefined
  }
}

export function writeSavedOperationsView(
  popId: string,
  view: OperationsViewId,
): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${popId}`, view)
  } catch {
    /* quota / private mode */
  }
}
