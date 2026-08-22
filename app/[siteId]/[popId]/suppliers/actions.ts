export type SupplierTableRow = {
  id: string
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string | null
  addressLine: string
  isActive: boolean
  currentAccountEnabled: boolean
  currentAccountCreditLimit: number | null
  currentAccountTermDays: number
}

export type UpsertPopSupplierInput = {
  name: string
  email: string
  phone: string
  taxId: string
  notes: string
  ivaCondition: string
  addressLine: string
  isActive: boolean
  currentAccountEnabled: boolean
  currentAccountCreditLimit: string
  currentAccountTermDays: string
}

export type GetPopSuppliersTableInput = {
  page: number
  pageSize: number
  search: string
  soloActivos: boolean
  withEmail: boolean
  withTaxId: boolean
  sort?: string | null
  ord?: "asc" | "desc"
}
