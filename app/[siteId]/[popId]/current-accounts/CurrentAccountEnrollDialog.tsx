"use client"

import {
  searchPopCurrentAccountEnrollmentCandidates,
  setPopCurrentAccountEnrollment,
  type CurrentAccountEnrollmentCandidate,
} from "@/app/[siteId]/[popId]/current-accounts/actions"
import { CurrentAccountTermsFields } from "@/app/[siteId]/[popId]/current-accounts/CurrentAccountTermsFields"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormSearchField } from "@/components/rootsy-form"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { Dialog } from "@/components/ui/dialog"
import {
  normalizeCurrentAccountCreditLimit,
  normalizeCurrentAccountTermDays,
} from "@/lib/currentAccountEnrollment"
import { parseMoneyInput } from "@/lib/moneyInput"
import {
  CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS,
  type CurrentAccountDirection,
} from "@/lib/currentAccounts"
import { cn } from "@/lib/utils"
import { useEffect, useId, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  direction: CurrentAccountDirection
  onEnrolled: (partyId: string) => void
}

export function CurrentAccountEnrollDialog({
  open,
  onOpenChange,
  popId,
  direction,
  onEnrolled,
}: Props) {
  const searchId = useId()
  const [query, setQuery] = useState("")
  const [parties, setParties] = useState<CurrentAccountEnrollmentCandidate[]>(
    [],
  )
  const [selected, setSelected] =
    useState<CurrentAccountEnrollmentCandidate | null>(null)
  const [creditLimit, setCreditLimit] = useState("")
  const [termDays, setTermDays] = useState(
    String(CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS),
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)

  const partyNoun = direction === "payable" ? "proveedor" : "cliente"
  const title = selected
    ? `Alta de ${partyNoun}`
    : direction === "payable"
      ? "Dar de alta un proveedor"
      : "Dar de alta un cliente"

  useEffect(() => {
    if (!open) return
    setQuery("")
    setParties([])
    setSelected(null)
    setCreditLimit("")
    setTermDays(String(CURRENT_ACCOUNT_SALE_DEFAULT_DUE_DAYS))
    setBanner(null)
    setSaving(false)
    setLoading(false)
  }, [open, direction])

  useEffect(() => {
    if (!open || !popId || selected) return
    const q = query.trim()
    if (!q) {
      setParties([])
      setLoading(false)
      return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        const result = await searchPopCurrentAccountEnrollmentCandidates(popId, {
          direction,
          q,
        })
        if (cancelled) return
        setLoading(false)
        if (!result.success) {
          setBanner(result.error)
          setParties([])
          return
        }
        setBanner(null)
        setParties(result.parties)
      })()
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [direction, open, popId, query, selected])

  const enroll = async () => {
    if (!selected || saving) return
    setSaving(true)
    setBanner(null)
    const result = await setPopCurrentAccountEnrollment(popId, {
      direction,
      partyId: selected.id,
      enabled: true,
      creditLimit: creditLimit.trim()
        ? normalizeCurrentAccountCreditLimit(parseMoneyInput(creditLimit, 0))
        : null,
      termDays: normalizeCurrentAccountTermDays(termDays),
    })
    setSaving(false)
    if (!result.success) {
      setBanner(result.error)
      return
    }
    onOpenChange(false)
    onEnrolled(selected.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent>
        <RootsDialogHeader
          open={open}
          title={title}
          description={
            selected
              ? `${selected.name}${selected.taxId ? ` · ${selected.taxId}` : ""}`
              : `Solo ${partyNoun}s dados de alta pueden operar a cuenta. El catálogo no cambia.`
          }
        />
        <RootsDialogBody className="flex flex-col gap-3">
          {banner ? <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner> : null}
          {selected ? (
            <CurrentAccountTermsFields
              idPrefix="ca-enroll"
              creditLimit={creditLimit}
              termDays={termDays}
              onCreditLimitChange={setCreditLimit}
              onTermDaysChange={setTermDays}
              disabled={saving}
            />
          ) : (
            <>
              <RootsFormSearchField
                id={searchId}
                hideLabel
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClear={() => setQuery("")}
                placeholder={`Buscar ${partyNoun}…`}
              />
              <div className="min-h-48">
                {loading && parties.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <RootsSpinner className="size-6" />
                  </div>
                ) : parties.length === 0 ? (
                  <p className="px-1 py-6 text-sm leading-relaxed text-rootsy-bruma-500">
                    {query.trim()
                      ? `No hay ${partyNoun}s activos para dar de alta con esa búsqueda.`
                      : `Escribí el nombre o el CUIT del ${partyNoun} para darlo de alta.`}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {parties.map((party) => (
                      <li key={party.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(party)
                            setBanner(null)
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border border-rootsy-bruma-200 bg-white px-3 py-2.5 text-left transition-colors",
                            "hover:border-rootsy-savia-400 hover:bg-[color-mix(in_srgb,var(--rootsy-savia-400)_6%,white)]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rootsy-savia-500",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-canopy text-sm font-medium text-rootsy-bruma-800">
                              {party.name}
                            </span>
                            {party.taxId ? (
                              <span className="mt-0.5 block truncate text-xs text-rootsy-bruma-500">
                                {party.taxId}
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 pl-3 text-xs font-medium text-rootsy-savia-700">
                            Elegir
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </RootsDialogBody>
        {selected ? (
          <RootsDialogDualActionFooter
            cancelLabel="Volver"
            confirmLabel="Dar de alta"
            confirmType="button"
            confirmDisabled={saving}
            confirmLoading={saving}
            onCancel={() => {
              setSelected(null)
              setBanner(null)
            }}
            onConfirm={() => void enroll()}
          />
        ) : null}
      </RootsDialogContent>
    </Dialog>
  )
}
