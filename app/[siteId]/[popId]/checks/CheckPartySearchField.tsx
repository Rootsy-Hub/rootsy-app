"use client"

import { searchCheckParties } from "@/lib/rootsyApi/checksClient"
import {
  RootsFormSearchField,
  rootsFormColumnClass,
} from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
  rootsFormSelectContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import type { CheckDirection } from "@/lib/checkDocuments"
import type { CheckPartySearchItem } from "@/app/[siteId]/[popId]/checks/actions"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type Props = {
  popId: string
  direction: CheckDirection
  partyName: string
  partyId: string
  onChange: (next: { partyName: string; partyId: string }) => void
}

export function CheckPartySearchField({
  popId,
  direction,
  partyName,
  partyId,
  onChange,
}: Props) {
  const [query, setQuery] = useState(partyName)
  const [results, setResults] = useState<CheckPartySearchItem[]>([])
  const [open, setOpen] = useState(false)
  const isReceived = direction === "received"
  const label = isReceived ? "Cliente / librador" : "Proveedor / beneficiario"

  useEffect(() => {
    setQuery(partyName)
  }, [partyName])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || partyId) {
      setResults([])
      return
    }
    const timer = window.setTimeout(async () => {
      const res = await searchCheckParties(popId, direction, trimmed)
      if (res.success) setResults(res.parties)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [direction, partyId, popId, query])

  return (
    <div className={cn(rootsFormColumnClass, "relative")}>
      <RootsFormSearchField
        label={label}
        value={query}
        placeholder={isReceived ? "Nombre del cliente o librador" : "Nombre del proveedor"}
        onChange={(event) => {
          const next = event.target.value
          setQuery(next)
          setOpen(true)
          onChange({ partyName: next, partyId: "" })
        }}
        onClear={() => {
          setQuery("")
          setOpen(false)
          onChange({ partyName: "", partyId: "" })
        }}
      />
      {open && results.length > 0 ? (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-20 mt-1",
            rootsFormSelectContentClass,
          )}
        >
          <ul className={rootsFormDropdownListClass}>
            {results.map((party) => (
              <li key={party.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col items-start px-3 py-2.5 text-left text-sm",
                    rootsFormDropdownHighlightItemClassForTone("light", "default"),
                  )}
                  onClick={() => {
                    onChange({ partyName: party.name, partyId: party.id })
                    setQuery(party.name)
                    setOpen(false)
                    setResults([])
                  }}
                >
                  <span>{party.name}</span>
                  {party.taxId ? (
                    <span className="text-xs text-rootsy-bruma-500">
                      {party.taxId}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
