"use client"

import type { TreasuryAccountKind } from "@/lib/treasuryAccountKinds"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import {
  isSystemManagedTreasuryKind,
  TREASURY_ACCOUNT_KINDS,
} from "@/lib/treasuryAccountKinds"
import type { Dispatch, SetStateAction } from "react"

const KIND_OPTIONS = TREASURY_ACCOUNT_KINDS.filter(
  (k) => !isSystemManagedTreasuryKind(k.value),
).map((k) => ({
  value: k.value,
  label: k.label,
}))

export type TreasuryAccountEditFormState = {
  name: string
  kind: TreasuryAccountKind
}

type Props = {
  form: TreasuryAccountEditFormState
  setForm: Dispatch<SetStateAction<TreasuryAccountEditFormState>>
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
        readOnly
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
