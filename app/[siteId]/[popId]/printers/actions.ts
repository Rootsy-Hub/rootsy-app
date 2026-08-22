export type PopPrinterTableRow = {
  id: string
  name: string
  isActive: boolean
  sortOrder: number
  integrationKind: string | null
  connectionHint: string | null
}

export type UpsertPopPrinterInput = {
  name: string
  isActive: boolean
  sortOrder: number
  integrationKind: string
  connectionHint: string
}
