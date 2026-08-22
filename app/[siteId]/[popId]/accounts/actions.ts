import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"

export type TreasuryAccountTableRow = {
  id: string
  name: string
  kind: TreasuryAccountKind
  brandKey: string | null
  isSystemDefault: boolean
  isActive: boolean
  sortOrder: number
  accountingAccountId: string
  accountingAccountLabel: string
  chartAccountCode: string
  toLiquidateBalance: number
  toPayBalance: number
  outstandingBalance: number
  settledTotal: number
  ledgerBalance: number | null
  isCardPayable: boolean
  hasPosIntegration: boolean
  hasCardIntegration: boolean
}

export type UpsertTreasuryAccountInput = {
  name: string
  kind: TreasuryAccountKind
  sortOrder: number
  brandKey?: string | null
}

export type TreasuryChildAccountKind = "pos" | "card_payable"

export type TreasuryFundingOption = {
  id: string
  name: string
  kind: TreasuryAccountKind
}

export type TreasuryChildAccountRow = {
  id: string
  name: string
  kind: TreasuryAccountKind
  chartAccountCode: string
  ledgerBalance: number | null
  childRole: "pos" | "card_payable"
  outstandingBalance: number
  settledTotal: number
}
