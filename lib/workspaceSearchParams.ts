export type PopPageParams = Promise<{ siteId: string; popId: string }>

export type PopPageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>

export function workspaceUrlSearchParamsFromRecord(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const n = new URLSearchParams()
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      const last = value[value.length - 1]
      if (last !== undefined) n.set(key, last)
    } else {
      n.set(key, value)
    }
  }
  return n
}
