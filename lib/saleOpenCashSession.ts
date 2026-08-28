import type { SaleOpenCashSession } from "@/app/[siteId]/[popId]/sale/actions"
import type { OperateOpenCashSession } from "@/lib/rootsyApi/cashRegistersClient"

export function saleOpenCashFromOperate(
  session: OperateOpenCashSession | null | undefined,
  cashTreasuryAccountId: string | null | undefined,
): SaleOpenCashSession | null {
  if (!session) return null
  return {
    sessionId: session.sessionId,
    cashRegisterId: session.cashRegisterId,
    registerName: "",
    cashTreasuryAccountId: cashTreasuryAccountId?.trim() ?? "",
  }
}

/** El GET operate es la fuente de verdad una vez que resolvió. */
export function resolveOperateOpenCashSession(
  operateSuccess: boolean,
  operateSession: OperateOpenCashSession | null | undefined,
  catalogSession: SaleOpenCashSession | null,
  cashTreasuryAccountId: string | null | undefined,
): SaleOpenCashSession | null {
  if (operateSuccess) {
    return saleOpenCashFromOperate(operateSession, cashTreasuryAccountId)
  }
  return catalogSession
}
