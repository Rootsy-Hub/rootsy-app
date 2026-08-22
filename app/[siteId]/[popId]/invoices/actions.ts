export type InvoiceArcaTableRow = {
  id: string
  saleId: string | null
  arcaCbteTipo: number
  tipoLabel: string
  arcaRegimen: string
  ptoVta: number
  cbteNro: string
  cbteFch: string
  docTipo: number | null
  docNro: string
  receptorRazonSocial: string
  impTotal: number
  impNeto: number
  impIva: number
  impTrib: number
  monId: string
  monCotiz: number
  cae: string | null
  caeFchVto: string | null
  status: string
  arcaResultado: string | null
  arcaObservaciones: string | null
  payloadRequest: unknown
  payloadResponse: unknown
}

export type GetPopInvoicesArcaTableInput = {
  q?: string
  page?: number
  pageSize?: number
  status?: string
  cbteTipo?: number | "recibo_x" | ""
  dateFrom?: string | null
  dateTo?: string | null
  sort?: string | null
  ord?: "asc" | "desc"
}

export type InvoiceFormSalePoint = {
  id: string
  ptoVta: number
  configured: boolean
}

export type InvoiceFormCashSession = {
  cashRegisterId: string
  cashRegisterName: string
  sessionId: string
  salePoint: InvoiceFormSalePoint | null
}

export type InvoiceFormContextSuccess = {
  success: true
  fiscalCuit: string | null
  fiscalRazonSocial: string | null
  cashSession: InvoiceFormCashSession | null
  canCreateInvoice: boolean
}

export type InvoiceFormContextResult =
  | InvoiceFormContextSuccess
  | { success: false; error: string; redirect?: string }

export type InvoiceEmitSuccess = {
  success: true
  invoiceId: string
  cae: string
  caeFchVto: string
  cbteNro: number
  ptoVta: number
  impTotal: number
}

export type InvoiceHomologacionSuccess = {
  success: true
  cae: string
  caeFchVto: string
  cbteNro: number
  ptoVta: number
  impTotal: number
  impNeto: number
  impIva: number
  cbteFch: string
  payloadRequest: Record<string, unknown>
  payloadResponse: Record<string, unknown>
}

export type InvoiceEmitFailure = {
  success: false
  error: string
  debugFecaeSoap?: string
}
