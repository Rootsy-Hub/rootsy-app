/** Spec de consultas (Vender) y traza del chat. En cliente hace falta NEXT_PUBLIC_. */
export function isDevModeEnabled(): boolean {
  const flag =
    process.env.NEXT_PUBLIC_DEVMODE ??
    process.env.DEVMODE ??
    process.env.devmode
  return flag === "1" || flag === "true"
}

export function downloadDevmodeJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  })
  const href = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = href
  a.download = filename
  a.click()
  URL.revokeObjectURL(href)
}
