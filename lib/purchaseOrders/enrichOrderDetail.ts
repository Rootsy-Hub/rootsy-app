import "server-only"

import { getPurchaseCatalog } from "@/app/[siteId]/[popId]/purchases/actions"
import { buildPurchaseOrderLineSummariesFromSnapshot } from "@/lib/purchaseOrderCheckout"
import { parsePurchaseCheckoutSnapshot } from "@/lib/purchaseOrderCheckoutState"
import { purchaseOrderLineSummariesItemCount } from "@/lib/purchaseOrderDocumentLines"
import type { PurchaseOrderDetail } from "@/lib/purchaseOrderTypes"

export async function enrichPurchaseOrderDetail(
  popId: string,
  order: PurchaseOrderDetail,
): Promise<PurchaseOrderDetail> {
  const snapshot = parsePurchaseCheckoutSnapshot(order.checkoutSnapshot)
  const next: PurchaseOrderDetail = snapshot
    ? { ...order, checkoutSnapshot: snapshot }
    : order
  if (!snapshot) return next
  if ((next.metadata.lineSummaries?.length ?? 0) > 0) return next

  const catalog = await getPurchaseCatalog(popId)
  if (!catalog.success) return next

  const rebuiltSummaries = buildPurchaseOrderLineSummariesFromSnapshot(
    snapshot,
    catalog.articles,
  )
  if (rebuiltSummaries.length === 0) return next

  return {
    ...next,
    itemCount: purchaseOrderLineSummariesItemCount(rebuiltSummaries),
    metadata: {
      ...next.metadata,
      lineSummaries: rebuiltSummaries,
    },
  }
}
