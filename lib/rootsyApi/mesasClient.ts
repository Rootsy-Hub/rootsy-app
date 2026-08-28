import type {
  MesasFloorDecorRow,
  MesasLayoutData,
  MesasReservationSettingsInput,
  MesasSalonRow,
  MesasSortOrderUpdate,
  MesasTableRow,
  MesasWaiterRow,
  MesaReservationRow,
  MesaSessionRow,
  TableSessionMutationInput,
  UpsertMesasFloorDecorInput,
  UpsertMesasSalonInput,
  UpsertMesasTableInput,
} from "@/app/[siteId]/[popId]/mesas/actions"
import { parseTableSessionCheckout } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { MesaSessionFloorStatus } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type { MesasReservationSettings } from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import type {
  MesaReservationInput,
  MesaReservationStatus,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import type { TableSessionCheckoutSnapshot } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"

type ApiErr = { success: false; error?: string }

async function readJson(res: Response) {
  return (await res.json().catch(() => null)) as Record<string, unknown> | null
}

function fail(json: Record<string, unknown> | null, status: number): { success: false; error: string } {
  const error =
    json && typeof json.error === "string" && json.error
      ? json.error
      : `HTTP ${status}`
  return { success: false, error }
}

async function apiGet(popId: string, path: string) {
  return fetch(`/api/pops/${popId}/mesas/${path}`, {
    headers: { accept: "application/json" },
  })
}

async function apiSend(
  popId: string,
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
) {
  return fetch(`/api/pops/${popId}/mesas/${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

type SessionApi = Omit<MesaSessionRow, "checkout"> & {
  checkout: Record<string, unknown> | null
}

function mapSession(row: SessionApi): MesaSessionRow {
  return {
    ...row,
    checkout: row.checkout ? parseTableSessionCheckout(row.checkout) : null,
  }
}

export async function fetchMesasLayout(
  popId: string,
): Promise<
  | { success: true; data: MesasLayoutData }
  | { success: false; error: string }
> {
  const res = await apiGet(popId, "layout")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, data: json.data as MesasLayoutData }
}

export async function fetchMesasWaiters(
  popId: string,
): Promise<
  | { success: true; waiters: MesasWaiterRow[] }
  | { success: false; error: string }
> {
  const res = await apiGet(popId, "waiters")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, waiters: json.waiters as MesasWaiterRow[] }
}

export async function upsertMesasSalonApi(
  popId: string,
  input: UpsertMesasSalonInput,
): Promise<
  | { success: true; salon: MesasSalonRow }
  | { success: false; error: string }
> {
  const body = {
    name: input.name,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  }
  const res = input.id
    ? await apiSend(popId, `salons/${input.id}`, "PATCH", body)
    : await apiSend(popId, "salons", "POST", body)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, salon: json.salon as MesasSalonRow }
}

export async function deleteMesasSalonApi(popId: string, salonId: string) {
  const res = await apiSend(popId, `salons/${salonId}`, "DELETE")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function reorderMesasSalonsApi(
  popId: string,
  updates: MesasSortOrderUpdate[],
) {
  const res = await apiSend(popId, "salons/reorder", "PATCH", { updates })
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function upsertMesasTableApi(
  popId: string,
  input: UpsertMesasTableInput,
): Promise<
  | { success: true; table: MesasTableRow }
  | { success: false; error: string }
> {
  const body = {
    salonId: input.salonId,
    label: input.label,
    shape: input.shape,
    x: input.x,
    y: input.y,
    seats: input.seats,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  }
  const res = input.id
    ? await apiSend(popId, `tables/${input.id}`, "PATCH", body)
    : await apiSend(popId, "tables", "POST", body)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, table: json.table as MesasTableRow }
}

export async function deleteMesasTableApi(popId: string, tableId: string) {
  const res = await apiSend(popId, `tables/${tableId}`, "DELETE")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function reorderMesasTablesApi(
  popId: string,
  salonId: string,
  updates: MesasSortOrderUpdate[],
) {
  const res = await apiSend(popId, "tables/reorder", "PATCH", {
    salonId,
    updates,
  })
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function upsertMesasFloorDecorApi(
  popId: string,
  input: UpsertMesasFloorDecorInput,
): Promise<
  | { success: true; decor: MesasFloorDecorRow }
  | { success: false; error: string }
> {
  const body = {
    salonId: input.salonId,
    kind: input.kind,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    label: input.label,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  }
  const res = input.id
    ? await apiSend(popId, `decors/${input.id}`, "PATCH", body)
    : await apiSend(popId, "decors", "POST", body)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, decor: json.decor as MesasFloorDecorRow }
}

export async function deleteMesasFloorDecorApi(popId: string, decorId: string) {
  const res = await apiSend(popId, `decors/${decorId}`, "DELETE")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function reorderMesasDecorsApi(
  popId: string,
  salonId: string,
  updates: MesasSortOrderUpdate[],
) {
  const res = await apiSend(popId, "decors/reorder", "PATCH", {
    salonId,
    updates,
  })
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function saveMesasLayoutPositionsApi(
  popId: string,
  input: {
    tables?: { id: string; x: number; y: number; rotation?: number }[]
    decors?: { id: string; x: number; y: number; rotation?: number }[]
  },
) {
  const res = await apiSend(popId, "layout/positions", "PATCH", input)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function fetchTableSession(
  popId: string,
  sessionId: string,
): Promise<
  | { success: true; session: MesaSessionRow | null }
  | { success: false; error: string }
> {
  const res = await apiGet(popId, `sessions/${sessionId}`)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  const row = json.session as SessionApi | null
  return {
    success: true,
    session: row ? mapSession(row) : null,
  }
}

export async function fetchOpenTableSessions(
  popId: string,
): Promise<
  | { success: true; sessions: MesaSessionRow[] }
  | { success: false; error: string }
> {
  const res = await apiGet(popId, "sessions")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return {
    success: true,
    sessions: ((json.sessions as SessionApi[]) ?? []).map(mapSession),
  }
}

export async function openTableSessionApi(
  popId: string,
  input: TableSessionMutationInput,
): Promise<
  | { success: true; session: MesaSessionRow }
  | { success: false; error: string }
> {
  const res = await apiSend(popId, "sessions", "POST", input)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, session: mapSession(json.session as SessionApi) }
}

export async function updateTableSessionApi(
  popId: string,
  sessionId: string,
  input: TableSessionMutationInput,
): Promise<
  | { success: true; session: MesaSessionRow }
  | { success: false; error: string }
> {
  const res = await apiSend(popId, `sessions/${sessionId}`, "PATCH", input)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, session: mapSession(json.session as SessionApi) }
}

export async function closeTableSessionApi(popId: string, sessionId: string) {
  const res = await apiSend(popId, `sessions/${sessionId}/close`, "PATCH")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function closeTableSessionCheckoutApi(
  popId: string,
  sessionId: string,
  mode: "settle" | "release",
) {
  const res = await apiSend(popId, `sessions/${sessionId}/close-checkout`, "PATCH", {
    mode,
  })
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function saveTableSessionCheckoutApi(
  popId: string,
  sessionId: string,
  checkout: TableSessionCheckoutSnapshot,
): Promise<
  | { success: true; updatedAt: string }
  | { success: false; error: string }
> {
  const res = await apiSend(popId, `sessions/${sessionId}/checkout`, "PATCH", {
    checkout,
  })
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, updatedAt: json.updatedAt as string }
}

export async function setTableSessionFloorStatusApi(
  popId: string,
  sessionId: string,
  floorStatus: MesaSessionFloorStatus,
): Promise<
  | { success: true; floorStatus: MesaSessionFloorStatus; updatedAt: string }
  | { success: false; error: string }
> {
  const res = await apiSend(
    popId,
    `sessions/${sessionId}/floor-status`,
    "PATCH",
    { floorStatus },
  )
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return {
    success: true,
    floorStatus: json.floorStatus as MesaSessionFloorStatus,
    updatedAt: json.updatedAt as string,
  }
}

export async function fetchTableReservations(
  popId: string,
): Promise<
  | { success: true; reservations: MesaReservationRow[] }
  | { success: false; error: string }
> {
  const res = await apiGet(popId, "reservations")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return {
    success: true,
    reservations: json.reservations as MesaReservationRow[],
  }
}

export async function upsertTableReservationApi(
  popId: string,
  input: MesaReservationInput,
): Promise<
  | { success: true; reservation: MesaReservationRow }
  | { success: false; error: string }
> {
  const body = {
    tableId: input.tableId,
    tableIds: input.tableIds,
    clientId: input.clientId,
    clientName: input.clientName,
    guestCount: input.guestCount,
    arrivalAt: input.arrivalAt,
    status: input.status,
    note: input.note,
  }
  const res = input.reservationId
    ? await apiSend(popId, `reservations/${input.reservationId}`, "PATCH", body)
    : await apiSend(popId, "reservations", "POST", body)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, reservation: json.reservation as MesaReservationRow }
}

export async function cancelTableReservationApi(
  popId: string,
  reservationId: string,
) {
  const res = await apiSend(
    popId,
    `reservations/${reservationId}/cancel`,
    "PATCH",
  )
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export async function updateTableReservationStatusApi(
  popId: string,
  reservationId: string,
  status: MesaReservationStatus,
): Promise<
  | { success: true; reservation: MesaReservationRow }
  | { success: false; error: string }
> {
  const res = await apiSend(
    popId,
    `reservations/${reservationId}/status`,
    "PATCH",
    { status },
  )
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true, reservation: json.reservation as MesaReservationRow }
}

export async function fetchMesasReservationSettings(
  popId: string,
): Promise<
  | {
      success: true
      settings: MesasReservationSettings
      operationalDayCloseTime: string
    }
  | { success: false; error: string }
> {
  const res = await apiGet(popId, "reservation-settings")
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return {
    success: true,
    settings: json.settings as MesasReservationSettings,
    operationalDayCloseTime: json.operationalDayCloseTime as string,
  }
}

export async function updateMesasReservationSettingsApi(
  popId: string,
  input: MesasReservationSettingsInput,
) {
  const res = await apiSend(popId, "reservation-settings", "PATCH", input)
  const json = await readJson(res)
  if (!res.ok || !json || json.success !== true) return fail(json, res.status)
  return { success: true as const }
}

export type { ApiErr }
