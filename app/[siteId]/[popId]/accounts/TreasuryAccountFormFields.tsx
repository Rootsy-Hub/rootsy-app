"use client"

import type { UpsertTreasuryAccountInput } from "@/app/[siteId]/[popId]/accounts/actions"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import {
  TREASURY_ACCOUNT_KINDS,
} from "@/lib/treasuryAccountKinds"
import type { Dispatch, SetStateAction } from "react"

const KIND_OPTIONS = TREASURY_ACCOUNT_KINDS.filter(
  (k) => k.value !== "card_payable",
).map((k) => ({
  value: k.value,
  label: k.label,
}))

type Props = {
  form: UpsertTreasuryAccountInput
  setForm: Dispatch<SetStateAction<UpsertTreasuryAccountInput>>
  idPrefix: string
}

export function TreasuryAccountFormFields({
  form,
  setForm,
  idPrefix,
}: Props) {
  return (
    <>
      <RootsFormTextField
        label="Nombre"
        id={`${idPrefix}-name`}
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
        placeholder="Ej. Banco Galicia, Caja chica, Mercado Pago"
      />

      <RootsFormSelectField
        label="Tipo de cuenta"
        id={`${idPrefix}-kind`}
        value={form.kind}
        onValueChange={() => {}}
        disabled
      >
        {KIND_OPTIONS.map((o) => (
          <RootsFormSelectItem key={o.value} value={o.value}>
            {o.label}
          </RootsFormSelectItem>
        ))}
      </RootsFormSelectField>
    </>
  )
}
