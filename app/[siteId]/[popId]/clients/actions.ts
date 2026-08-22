export type ClientTableRow = {
  id: string
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string | null
  addressLine: string
  defaultInvoiceTypeLabel: string | null
  isActive: boolean
  currentAccountEnabled: boolean
  currentAccountCreditLimit: number | null
  currentAccountTermDays: number
  lastSaleAt: string | null
  completedSalesCount: number
  totalSpentArs: number
}

export type UpsertPopClientInput = {
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string
  addressLine: string
  defaultInvoiceTypeLabel: string
  isActive: boolean
  currentAccountEnabled: boolean
  currentAccountCreditLimit: string
  currentAccountTermDays: string
}

export type GetPopClientsTableInput = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  withEmail: boolean
  withTaxId: boolean
  sort?: string | null
  ord?: "asc" | "desc"
}
