import type { MesasRightPanelView } from "@/app/[siteId]/[popId]/mesas/mesasTypes"

export type MesasPersistedMobileStage = "home" | "ticket" | "catalog"

export type MesasWorkspacePreference = {
  tableId: string | null
  salonId: string | null
  rightView: MesasRightPanelView
  mobileStage?: MesasPersistedMobileStage
}

const STORAGE_PREFIX = "rootsy:mesas-workspace:"

const RIGHT_VIEWS = new Set<MesasRightPanelView>(["session", "cart", "agenda"])
const MOBILE_STAGES = new Set<MesasPersistedMobileStage>([
  "home",
  "ticket",
  "catalog",
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value)
}

function asNullableId(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== "string") return null
  const id = value.trim()
  return id ? id : null
}

export function parseMesasWorkspacePreference(
  raw: unknown,
): MesasWorkspacePreference | undefined {
  if (!isRecord(raw)) return undefined
  const rightView = raw.rightView
  if (typeof rightView !== "string" || !RIGHT_VIEWS.has(rightView as MesasRightPanelView)) {
    return undefined
  }
  const mobileStage =
    typeof raw.mobileStage === "string" &&
    MOBILE_STAGES.has(raw.mobileStage as MesasPersistedMobileStage)
      ? (raw.mobileStage as MesasPersistedMobileStage)
      : undefined
  return {
    tableId: asNullableId(raw.tableId),
    salonId: asNullableId(raw.salonId),
    rightView: rightView as MesasRightPanelView,
    ...(mobileStage ? { mobileStage } : {}),
  }
}

export function reconcileMesasWorkspaceView(input: {
  rightView: MesasRightPanelView
  mobileStage?: MesasPersistedMobileStage
  tableExists: boolean
  tableHasOpenSession: boolean
}): {
  rightView: MesasRightPanelView
  mobileStage?: MesasPersistedMobileStage
} {
  const rightView =
    input.rightView === "cart" && !input.tableHasOpenSession
      ? "session"
      : input.rightView

  let mobileStage = input.mobileStage
  if (mobileStage === "catalog" && !input.tableHasOpenSession) {
    mobileStage = "ticket"
  }
  if (!input.tableExists && rightView === "cart") {
    return { rightView: "session", mobileStage }
  }
  return { rightView, mobileStage }
}

export function tableHasOpenSession(table: {
  sessionId?: string | null
  status?: string | null
} | null): boolean {
  if (!table?.sessionId) return false
  return table.status === "open" || table.status === "paying"
}

export function readMesasWorkspacePreference(
  popId: string,
): MesasWorkspacePreference | undefined {
  if (typeof window === "undefined" || !popId) return undefined
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (!raw) return undefined
    return parseMesasWorkspacePreference(JSON.parse(raw))
  } catch {
    return undefined
  }
}

export function writeMesasWorkspacePreference(
  popId: string,
  value: MesasWorkspacePreference,
): void {
  if (typeof window === "undefined" || !popId) return
  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${popId}`,
      JSON.stringify(value),
    )
  } catch {
    /* quota / private mode */
  }
}
