export function purchaseCartLineId(
  articleId: string,
  articleCostId: string,
): string {
  return `${articleId}:${articleCostId}`
}

export function parsePurchaseCartLineId(lineId: string): {
  articleId: string
  articleCostId: string
} | null {
  const sep = lineId.indexOf(":")
  if (sep <= 0 || sep >= lineId.length - 1) return null
  return {
    articleId: lineId.slice(0, sep),
    articleCostId: lineId.slice(sep + 1),
  }
}
