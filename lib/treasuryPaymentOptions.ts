import {
  operationPaymentKindLabel,
  type OperationPaymentKind,
} from "@/lib/operationPaymentKinds"

export type TreasuryPaymentPickOption = {
  id: string
  name: string
}

export type TreasuryPaymentContext = {
  defaultCashTreasuryAccountId: string | null
  bankTreasuryAccounts: TreasuryPaymentPickOption[]
  posTreasuryAccounts: TreasuryPaymentPickOption[]
  payTreasuryAccounts: TreasuryPaymentPickOption[]
}

export type TreasuryPaymentOption = {
  kind: OperationPaymentKind
  treasuryAccountId: string
  label: string
}

export function treasuryPaymentOptionKey(
  o: Pick<TreasuryPaymentOption, "kind" | "treasuryAccountId">,
): string {
  return `${o.kind}:${o.treasuryAccountId}`
}

export function buildSalePaymentOptions(
  context: TreasuryPaymentContext,
): TreasuryPaymentOption[] {
  const options: TreasuryPaymentOption[] = []
  if (context.defaultCashTreasuryAccountId) {
    options.push({
      kind: "cash",
      treasuryAccountId: context.defaultCashTreasuryAccountId,
      label: operationPaymentKindLabel("cash"),
    })
  }
  for (const bank of context.bankTreasuryAccounts) {
    options.push({
      kind: "transfer",
      treasuryAccountId: bank.id,
      label: bank.name,
    })
  }
  for (const pos of context.posTreasuryAccounts) {
    options.push({
      kind: "card_debit",
      treasuryAccountId: pos.id,
      label: `${pos.name} (débito)`,
    })
    options.push({
      kind: "card_credit",
      treasuryAccountId: pos.id,
      label: `${pos.name} (crédito)`,
    })
  }
  return options
}

export function buildPayPaymentOptions(
  context: TreasuryPaymentContext,
): TreasuryPaymentOption[] {
  const options: TreasuryPaymentOption[] = []
  if (context.defaultCashTreasuryAccountId) {
    options.push({
      kind: "cash",
      treasuryAccountId: context.defaultCashTreasuryAccountId,
      label: operationPaymentKindLabel("cash"),
    })
  }
  for (const bank of context.bankTreasuryAccounts) {
    options.push({
      kind: "transfer",
      treasuryAccountId: bank.id,
      label: bank.name,
    })
  }
  for (const card of context.payTreasuryAccounts) {
    options.push({
      kind: "card_debit",
      treasuryAccountId: card.id,
      label: card.name,
    })
    options.push({
      kind: "card_credit",
      treasuryAccountId: card.id,
      label: `${card.name} (crédito)`,
    })
  }
  return options
}
