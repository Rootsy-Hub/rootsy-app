export type PaginationItem = number | "ellipsis"

/**
 * Pocas entradas visibles: primera, última, ventana alrededor de la actual y elipsis.
 * Sirve para listados con muchas páginas sin renderizar un botón por página.
 */
export function buildPaginationItems(
  totalPages: number,
  currentPage: number,
  siblingCount = 1,
): PaginationItem[] {
  if (totalPages < 1) return []
  if (totalPages === 1) return [1]

  const showAllMax = 9
  if (totalPages <= showAllMax) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>()
  pages.add(1)
  pages.add(totalPages)
  for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const out: PaginationItem[] = []
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!
    if (i > 0) {
      const prev = sorted[i - 1]!
      if (cur - prev > 1) out.push("ellipsis")
    }
    out.push(cur)
  }
  return out
}
