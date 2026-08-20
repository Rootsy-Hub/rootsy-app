"use client"

import { CurrentAccountTermsFields } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountTermsFields"
import { setPopCurrentAccountEnrollment } from "@/app/[siteId]/[popId]/current-accounts/actions"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import {
  normalizeCurrentAccountCreditLimit,
  normalizeCurrentAccountTermDays,
} from "@/lib/currentAccountEnrollment"
import { CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS } from "@/lib/currentAccounts"
import { type CurrentAccountDirection } from "@/lib/currentAccounts"
import { formatMoneyInputForField, parseMoneyInput } from "@/lib/moneyInput"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  direction: CurrentAccountDirection
  partyId: string
  partyName: string
  creditLimit: number | null
  termDays: number
  onSaved: () => void
}

export function CurrentAccountTermsDialog({
  open,
  onOpenChange,
  popId,
  direction,
  partyId,
  partyName,
  creditLimit,
  termDays,
  onSaved,
}: Props) {
  const [limit, setLimit] = useState("")
  const [days, setDays] = useState(String(CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS))
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLimit(creditLimit != null ? formatMoneyInputForField(creditLimit) : "")
    setDays(String(termDays || CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS))
    setBanner(null)
    setSaving(false)
  }, [creditLimit, open, termDays])

  const save = async () => {
    if (saving) return
    setSaving(true)
    setBanner(null)
    const result = await setPopCurrentAccountEnrollment(popId, {
      direction,
      partyId,
      enabled: true,
      creditLimit: limit.trim()
        ? normalizeCurrentAccountCreditLimit(parseMoneyInput(limit, 0))
        : null,
      termDays: normalizeCurrentAccountTermDays(days),
    })
    setSaving(false)
    if (!result.success) {
      setBanner(result.error)
      return
    }
    onOpenChange(false)
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent>
        <RootsDialogHeader
          open={open}
          title="Condiciones de cuenta"
          description={partyName}
        />
        <RootsDialogBody className="flex flex-col gap-3">
          {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
          <CurrentAccountTermsFields
            idPrefix="ca-terms"
            creditLimit={limit}
            termDays={days}
            onCreditLimitChange={setLimit}
            onTermDaysChange={setDays}
            disabled={saving}
          />
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Cancelar"
          confirmLabel="Guardar"
          confirmDisabled={saving}
          confirmLoading={saving}
          onCancel={() => onOpenChange(false)}
          onConfirm={() => void save()}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
