export function escapeCsvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function buildCsv(
  headers: readonly string[],
  rows: readonly (string | number | null | undefined)[][],
): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ]
  return lines.join("\r\n")
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
