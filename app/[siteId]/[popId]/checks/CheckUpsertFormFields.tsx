"use client"

import { CheckPartySearchField } from "@/app/[siteId]/[popId]/checks/CheckPartySearchField"
import type { CheckCreateFormState } from "@/app/[siteId]/[popId]/checks/checkFormState"
import {
  RootsFormDateField,
  RootsFormGrid,
  RootsFormMoneyField,
  RootsFormTextField,
  RootsFormTextareaField,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import type { Dispatch, SetStateAction } from "react"

type Props = {
  popId: string
  idPrefix: string
  form: CheckCreateFormState
  setForm: Dispatch<SetStateAction<CheckCreateFormState>>
  hideAmount?: boolean
}

export function CheckUpsertFormFields({
  popId,
  idPrefix,
  form,
  setForm,
  hideAmount = false,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <RootsFormGrid>
        <div className={rootsFormColumnClass}>
          <RootsFormTextField
            id={`${idPrefix}-number`}
            label="Número"
            value={form.checkNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                checkNumber: event.target.value,
              }))
            }
            placeholder="00012345"
            autoFocus
          />
        </div>
        <div className={rootsFormColumnClass}>
          <RootsFormTextField
            id={`${idPrefix}-bank`}
            label="Banco"
            value={form.bankName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                bankName: event.target.value,
              }))
            }
            placeholder="Banco Galicia"
          />
        </div>
      </RootsFormGrid>

      {hideAmount ? null : (
        <RootsFormMoneyField
          id={`${idPrefix}-amount`}
          label="Importe"
          value={form.amount}
          onChange={(value) =>
            setForm((current) => ({ ...current, amount: value }))
          }
        />
      )}

      <RootsFormGrid>
        <RootsFormDateField
          id={`${idPrefix}-issue`}
          label="Emisión"
          value={form.issueDate}
          onChange={(value) =>
            setForm((current) => ({ ...current, issueDate: value }))
          }
        />
        <RootsFormDateField
          id={`${idPrefix}-due`}
          label="Fecha de cobro"
          value={form.dueDate}
          onChange={(value) =>
            setForm((current) => ({ ...current, dueDate: value }))
          }
        />
      </RootsFormGrid>

      <CheckPartySearchField
        popId={popId}
        direction={form.direction}
        partyName={form.partyName}
        partyId={form.partyId}
        onChange={(next) =>
          setForm((current) => ({
            ...current,
            partyName: next.partyName,
            partyId: next.partyId,
          }))
        }
      />

      <RootsFormTextareaField
        id={`${idPrefix}-notes`}
        label="Notas"
        value={form.notes}
        onChange={(event) =>
          setForm((current) => ({ ...current, notes: event.target.value }))
        }
        placeholder="Opcional"
      />
    </div>
  )
}
