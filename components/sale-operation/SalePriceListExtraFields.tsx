"use client"

import { RootsFormMoneyField } from "@/components/rootsy-form"
import { extraPriceLists, type SalePriceList } from "@/lib/salePriceLists"

type Props = {
  idPrefix: string
  lists: SalePriceList[]
  values: Record<string, string>
  onChange: (listId: string, value: string) => void
  disabled?: boolean
  loading?: boolean
}

export function SalePriceListExtraFields({
  idPrefix,
  lists,
  values,
  onChange,
  disabled,
  loading = false,
}: Props) {
  if (loading && lists.length === 0) {
    const pendingIds = Object.keys(values).filter((id) => values[id]?.trim())
    return (
      <div className="flex flex-col gap-3" role="status">
        {pendingIds.map((listId) => (
          <RootsFormMoneyField
            key={listId}
            label="Precio · …"
            id={`${idPrefix}-list-${listId}`}
            value={values[listId] ?? ""}
            onChange={() => {}}
            disabled
          />
        ))}
        <p className="text-xs leading-relaxed text-rootsy-bruma-500">
          Cargando listas de precios…
        </p>
      </div>
    )
  }

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
