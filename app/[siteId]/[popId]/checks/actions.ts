import type { CheckDirection, CheckSourceKind, CheckStatus } from "@/lib/checkDocuments"

export type CheckTableRow = {
  id: string
  direction: CheckDirection
  checkNumber: string
  bankName: string
  amount: number
  issueDate: string
  dueDate: string
  status: CheckStatus
  partyName: string
  sourceKind: CheckSourceKind
}

export type CreatePopCheckInput = {
  direction: CheckDirection
  checkNumber: string
  bankName: string
  amount: string
  issueDate: string
  dueDate: string
  partyName: string
  partyId: string
  notes: string
}

export type GetPopChecksTableInput = {
  q?: string
  page?: number
  pageSize?: number
  direction?: CheckDirection | ""
  status?: CheckStatus | ""
  sort?: string | null
  ord?: "asc" | "desc"
}

export type DepositPopCheckInput = {
  treasuryAccountId: string
  depositedAt: string
}

export type ClearPopCheckInput = {
  clearedAt: string
}

export type RejectPopCheckInput = {
  rejectedAt: string
  reason: string
}

export type CheckPartySearchItem = {
  id: string
  name: string
  taxId: string | null
}

export type CheckDepositAccount = {
  id: string
  name: string
}
