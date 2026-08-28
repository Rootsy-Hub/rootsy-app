import type { MostradorRightPanelView } from "@/app/[siteId]/[popId]/mostrador/mostradorTypes"

export type MostradorPersistedMobileStage = "home" | "ticket" | "catalog"

export type MostradorWorkspacePreference = {
  orderId: string | null
  rightView: MostradorRightPanelView
  mobileStage?: MostradorPersistedMobileStage
}

const STORAGE_PREFIX = "rootsy:mostrador-workspace:"

const RIGHT_VIEWS = new Set<MostradorRightPanelView>(["detail", "cart"])
const MOBILE_STAGES = new Set<MostradorPersistedMobileStage>([
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

export function parseMostradorWorkspacePreference(
  raw: unknown,
): MostradorWorkspacePreference | undefined {
  if (!isRecord(raw)) return undefined
  const rightView = raw.rightView
  if (
    typeof rightView !== "string" ||
    !RIGHT_VIEWS.has(rightView as MostradorRightPanelView)
  ) {
    return undefined
  }
  const mobileStage =
    typeof raw.mobileStage === "string" &&
    MOBILE_STAGES.has(raw.mobileStage as MostradorPersistedMobileStage)
      ? (raw.mobileStage as MostradorPersistedMobileStage)
      : undefined
  return {
    orderId: asNullableId(raw.orderId),
    rightView: rightView as MostradorRightPanelView,
    ...(mobileStage ? { mobileStage } : {}),
  }
}

export function reconcileMostradorWorkspaceView(input: {
  rightView: MostradorRightPanelView
  mobileStage?: MostradorPersistedMobileStage
  orderExists: boolean
}): {
  rightView: MostradorRightPanelView
  mobileStage?: MostradorPersistedMobileStage
} {
  const rightView =
    input.rightView === "cart" && !input.orderExists ? "detail" : input.rightView
  let mobileStage = input.mobileStage
  if (mobileStage === "catalog" && !input.orderExists) {
    mobileStage = "ticket"
  }
  return { rightView, mobileStage }
}

export function readMostradorWorkspacePreference(
  popId: string,
): MostradorWorkspacePreference | undefined {
  if (typeof window === "undefined" || !popId) return undefined
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${popId}`)
    if (!raw) return undefined
    return parseMostradorWorkspacePreference(JSON.parse(raw))
  } catch {
    return undefined
  }
}

export function writeMostradorWorkspacePreference(
  popId: string,
  value: MostradorWorkspacePreference,
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
