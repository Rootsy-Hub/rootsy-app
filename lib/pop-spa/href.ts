export type PopHrefInput =
  | string
  | {
      pathname?: string
      query?: Record<string, string | number | boolean | null | undefined>
      search?: string
      hash?: string
    }

export type ResolvedPopHref = {
  pathname: string
  search: string
  hash: string
}

function searchFromQuery(
  query: Record<string, string | number | boolean | null | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue
    params.set(key, String(value))
  }
  return params.toString()
}

export function hrefToString(href: PopHrefInput): string {
  if (typeof href === "string") return href
  const search =
    href.search?.replace(/^\?/, "") ??
    (href.query ? searchFromQuery(href.query) : "")
  const pathname = href.pathname ?? ""
  const hash = href.hash?.replace(/^#/, "") ?? ""
  return `${pathname}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`
}

export function resolvePopHref(
  href: PopHrefInput,
  currentPathname: string,
  currentSearch: string,
): ResolvedPopHref {
  const raw = hrefToString(href).trim()
  if (!raw || raw === "?") {
    return { pathname: currentPathname, search: "", hash: "" }
  }

  if (raw.startsWith("?")) {
    const hashIndex = raw.indexOf("#")
    const searchPart = hashIndex >= 0 ? raw.slice(1, hashIndex) : raw.slice(1)
    const hash = hashIndex >= 0 ? raw.slice(hashIndex + 1) : ""
    return { pathname: currentPathname, search: searchPart, hash }
  }

  if (raw.startsWith("#")) {
    return { pathname: currentPathname, search: currentSearch, hash: raw.slice(1) }
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://local.invalid"
  const basePath = currentSearch
    ? `${currentPathname}?${currentSearch}`
    : currentPathname
  const url = new URL(raw, `${origin}${basePath}`)
  return {
    pathname: url.pathname,
    search: url.search.replace(/^\?/, ""),
    hash: url.hash.replace(/^#/, ""),
  }
}

export function resolvedHrefToString(resolved: ResolvedPopHref): string {
  return `${resolved.pathname}${resolved.search ? `?${resolved.search}` : ""}${
    resolved.hash ? `#${resolved.hash}` : ""
  }`
}

export function popIdsFromPathname(pathname: string): {
  siteId: string
  popId: string
} {
  const parts = pathname.split("/").filter(Boolean)
  return {
    siteId: parts[0] ?? "",
    popId: parts[1] ?? "",
  }
}

export function isPopInternalPath(pathname: string, siteId: string, popId: string): boolean {
  if (!siteId || !popId) return false
  const parts = pathname.split("/").filter(Boolean)
  return parts[0] === siteId && parts[1] === popId
}

export function isModifiedClick(
  event: Pick<
    MouseEvent,
    "metaKey" | "ctrlKey" | "shiftKey" | "altKey" | "button"
  >,
): boolean {
  return Boolean(
    event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0,
  )
}
