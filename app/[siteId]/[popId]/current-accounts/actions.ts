import type {
  CurrentAccountAgingBucket,
  CurrentAccountAgingFilter,
  CurrentAccountAgingTotals,
  CurrentAccountDirection,
} from "@/lib/currentAccounts"

export type CurrentAccountPartyRow = {
  partyId: string
  partyName: string
  enrolled: boolean
  openCount: number
  overdueAmount: number
  aging: CurrentAccountAgingTotals
  balance: number
  unappliedCredit: number
  creditLimit: number | null
  termDays: number
}

export type CurrentAccountLedgerLine = {
  id: string
  date: string
  occurredAt: string | null
  documentLabel: string
  description: string
  paymentKindLabel: string | null
  debit: number
  credit: number
  balance: number
}

export type CurrentAccountOpenDocument = {
  id: string
  date: string
  occurredAt: string | null
  dueDate: string
  documentLabel: string
  remaining: number
  daysOverdue: number
  agingBucket: CurrentAccountAgingBucket
}

export type SettleCurrentAccountApplicationInput = {
  documentId: string
  amount: number
}

export type SettleCurrentAccountInput = {
  direction: CurrentAccountDirection
  partyId: string
  paidAt: string
  paymentKind: string
  treasuryAccountId: string
  checkDetails?: unknown
  applications: SettleCurrentAccountApplicationInput[]
  extraAmount?: number
  notes?: string
}

export type CurrentAccountEnrollmentCandidate = {
  id: string
  name: string
  taxId: string | null
}

export type GetPopCurrentAccountPartiesInput = {
  q?: string
  page?: number
  pageSize?: number
  direction?: CurrentAccountDirection | ""
  aging?: CurrentAccountAgingFilter | ""
  sort?: string | null
  ord?: "asc" | "desc"
}

export type SetPopCurrentAccountEnrollmentInput = {
  direction: CurrentAccountDirection
  partyId: string
  enabled: boolean
  creditLimit?: number | null
  termDays?: number
}

export type ApplyPopCurrentAccountCreditInput = {
  direction: CurrentAccountDirection
  partyId: string
  applications: SettleCurrentAccountApplicationInput[]
}
