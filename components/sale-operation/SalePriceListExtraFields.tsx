"use client"

import { RootsFormMoneyField } from "@/components/rootsy-form"
import { extraPriceLists, type SalePriceList } from "@/lib/salePriceLists"

type Props = {
  idPrefix: string
  lists: SalePriceList[]
  values: Record<string, string>
  onChange: (listId: string, value: string) => void
  disabled?: boolean
}

export function SalePriceListExtraFields({
  idPrefix,
  lists,
  values,
  onChange,
  disabled,
}: Props) {
  const extras = extraPriceLists(lists)
  if (extras.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {extras.map((list) => (
        <RootsFormMoneyField
          key={list.id}
          label={`Precio · ${list.name}`}
          id={`${idPrefix}-list-${list.id}`}
          value={values[list.id] ?? ""}
          onChange={(value) => onChange(list.id, value)}
          disabled={disabled}
        />
      ))}
      <p className="text-xs leading-relaxed text-[var(--rootsy-bruma-500)]">
        Vacío usa el precio de la lista principal.
      </p>
    </div>
  )
}
