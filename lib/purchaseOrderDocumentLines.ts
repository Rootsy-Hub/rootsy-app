import type { PurchaseOrderLineSummary } from "@/lib/purchaseOrderTypes"

export function purchaseOrderLineSummariesItemCount(
  summaries: PurchaseOrderLineSummary[],
): number {
  return summaries.reduce((sum, line) => sum + line.quantity, 0)
}

export function resolvePurchaseOrderLineSummaries(metadata: {
  lineSummaries?: PurchaseOrderLineSummary[]
}): PurchaseOrderLineSummary[] {
  return metadata.lineSummaries ?? []
}

export type PurchaseOrderPdfTableRow =
  | { kind: "line"; cells: [string, string, string, string] }

export function buildPurchaseOrderPdfTableRows(
  summaries: PurchaseOrderLineSummary[],
  formatMoney: (n: number) => string,
): PurchaseOrderPdfTableRow[] {
  return summaries.map((line) => ({
    kind: "line" as const,
    cells: [
      line.name,
      String(line.quantity),
      formatMoney(line.unitPrice),
      formatMoney(line.lineTotal),
    ],
  }))
}
