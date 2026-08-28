import { cashRegisterOpenSessionQueryKey } from "@/lib/queryKeys"
import type { OperateOpenCashSession } from "@/lib/rootsyApi/cashRegistersClient"
import type { DomainEvent } from "@/lib/realtime/protocol"
import type { QueryClient } from "@tanstack/react-query"

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function parseOperateSession(payload: Record<string, unknown>): OperateOpenCashSession | null {
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : ""
  const cashRegisterId =
    typeof payload.cashRegisterId === "string" ? payload.cashRegisterId : ""
  const openedAt = typeof payload.openedAt === "string" ? payload.openedAt : ""
  if (!sessionId || !cashRegisterId || !openedAt) return null
  let salePoint: OperateOpenCashSession["salePoint"] = null
  if (isRecord(payload.salePoint)) {
    const id = typeof payload.salePoint.id === "string" ? payload.salePoint.id : ""
    const ptoVta = Number(payload.salePoint.ptoVta)
    if (id && Number.isFinite(ptoVta)) salePoint = { id, ptoVta }
  }
  return { sessionId, cashRegisterId, openedAt, salePoint }
}

export function applyCajasRealtimeEvent(
  queryClient: QueryClient,
  popId: string,
  event: DomainEvent,
): void {
  if (event.popId !== popId) return
  if (event.type === "cajas.session_closed") {
    queryClient.setQueryData(cashRegisterOpenSessionQueryKey(popId), null)
    return
  }
  if (event.type !== "cajas.session_opened") return
  const session = parseOperateSession(event.payload)
  if (session) {
    queryClient.setQueryData(cashRegisterOpenSessionQueryKey(popId), session)
    return
  }
  void queryClient.invalidateQueries({
    queryKey: cashRegisterOpenSessionQueryKey(popId),
    refetchType: "all",
  })
}

export function invalidateCajasRealtimeQueries(
  queryClient: QueryClient,
  popId: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: cashRegisterOpenSessionQueryKey(popId),
    refetchType: "all",
  })
}
