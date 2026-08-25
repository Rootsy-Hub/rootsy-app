const warmed = new Set<string>()

export function isCatalogProductPhotoUrl(url: string | null | undefined): boolean {
  const src = typeof url === "string" ? url.trim() : ""
  if (!src) return false
  if (src.includes("api.dicebear.com")) return false
  return true
}

/** Calienta el cache HTTP/memoria del browser. No persiste blobs. */
export function prefetchCatalogProductImage(url: string | null | undefined) {
  if (typeof window === "undefined") return
  if (!isCatalogProductPhotoUrl(url)) return
  const src = url!.trim()
  if (warmed.has(src)) return
  warmed.add(src)
  const img = new Image()
  img.decoding = "async"
  img.src = src
}

export function prefetchCatalogProductImages(
  urls: Array<string | null | undefined>,
) {
  for (const url of urls) prefetchCatalogProductImage(url)
}
