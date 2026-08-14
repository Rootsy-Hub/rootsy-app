"use client"

import {
  searchAccountingChartAccounts,
  type ChartAccountSearchRow,
} from "@/app/[siteId]/[popId]/accounting/actions"
import { RootsFormSearchField, rootsFormSelectContentClass } from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

function accountSearchDropdownItemClass(active: boolean, selected: boolean) {
  const state = selected ? "selected" : active ? "highlighted" : "default"
  return cn(
    "flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors",
    rootsFormDropdownHighlightItemClassForTone("light", state),
  )
}

function formatAccountOptionLabel(account: ChartAccountSearchRow): string {
  return `${account.code} · ${account.name}`
}

type Props = {
  popId: string
  accountCode: string
  onAccountCodeChange: (code: string) => void
  selectedAccountLabel?: string | null
  className?: string
}

export function LedgerAccountSearchField({
  popId,
  accountCode,
  onAccountCodeChange,
  selectedAccountLabel = null,
  className,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<ChartAccountSearchRow[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [highlightedAccountId, setHighlightedAccountId] = useState<string | null>(
    null,
  )
  const [isFocused, setIsFocused] = useState(false)
  const searchGenRef = useRef(0)
  const selectedCodeRef = useRef(accountCode)

  const searchTrim = searchQuery.trim()
  const showDropdown = isFocused && searchTrim.length > 0

  useEffect(() => {
    selectedCodeRef.current = accountCode
  }, [accountCode])

  useEffect(() => {
    if (selectedAccountLabel && accountCode) {
      setSearchQuery(selectedAccountLabel)
    }
  }, [accountCode, selectedAccountLabel])

  useEffect(() => {
    if (!searchTrim) {
      setResults([])
      setSearchLoading(false)
      setHighlightedAccountId(null)
      return
    }

    const gen = ++searchGenRef.current
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearchLoading(true)
        const res = await searchAccountingChartAccounts(popId, searchTrim)
        if (gen !== searchGenRef.current) return
        setSearchLoading(false)
        if (res.success) {
          setResults(res.accounts)
          setHighlightedAccountId(res.accounts[0]?.id ?? null)
          return
        }
        setResults([])
        setHighlightedAccountId(null)
      })()
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [popId, searchTrim])

  const selectAccount = (account: ChartAccountSearchRow) => {
    onAccountCodeChange(account.code)
    setSearchQuery(formatAccountOptionLabel(account))
    setResults([])
    setHighlightedAccountId(null)
    setIsFocused(false)
  }

  const handleClear = () => {
    setSearchQuery("")
    setResults([])
    setHighlightedAccountId(null)
    onAccountCodeChange("")
  }

  const commitSearch = () => {
    if (results.length === 0) {
      onAccountCodeChange(searchTrim)
      setIsFocused(false)
      return
    }

    const highlighted =
      results.find((account) => account.id === highlightedAccountId) ?? results[0]
    const exact = results.find((account) => account.code === searchTrim)

    if (exact) {
      selectAccount(exact)
      return
    }

    if (highlighted) {
      selectAccount(highlighted)
      return
    }

    onAccountCodeChange(searchTrim)
    setIsFocused(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault()
        commitSearch()
      }
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const index = results.findIndex((account) => account.id === highlightedAccountId)
      const next = results[(index + 1) % results.length]
      if (next) setHighlightedAccountId(next.id)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      const index = results.findIndex((account) => account.id === highlightedAccountId)
      const next = results[(index - 1 + results.length) % results.length]
      if (next) setHighlightedAccountId(next.id)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      commitSearch()
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      setIsFocused(false)
      setResults([])
    }
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      <RootsFormSearchField
        label="Buscar cuenta"
        id="ledger-account-search"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value)
          if (selectedCodeRef.current) {
            onAccountCodeChange("")
          }
        }}
        onClear={handleClear}
        placeholder="Código o nombre de cuenta"
        resultsSummary={
          showDropdown
            ? searchLoading
              ? "Buscando cuentas…"
              : results.length === 0
                ? "Sin cuentas para esa búsqueda"
                : `${results.length} cuenta${results.length === 1 ? "" : "s"}`
            : undefined
        }
        inputProps={{
          onFocus: () => setIsFocused(true),
          onBlur: () => {
            window.setTimeout(() => {
              setIsFocused(false)
            }, 120)
          },
          onKeyDown: handleKeyDown,
        }}
      />

      {showDropdown ? (
        <div
          className={cn(
            "absolute inset-x-0 top-[calc(100%+0.25rem)] z-[520] max-h-60 overflow-x-hidden overflow-y-auto overscroll-contain",
            rootsFormSelectContentClass,
            "w-full min-w-0 max-w-none",
          )}
        >
          <ul
            className={cn(rootsFormDropdownListClass, "w-full")}
            role="listbox"
            aria-label="Cuentas contables"
            aria-busy={searchLoading}
          >
            {searchLoading ? (
              <li className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-[var(--rootsy-bruma-500)]">
                <RootsSpinner size="sm" aria-hidden />
                Buscando…
              </li>
            ) : results.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-[var(--rootsy-bruma-500)]">
                Sin cuentas para esa búsqueda
              </li>
            ) : (
              results.map((account) => {
                const isSelected = accountCode === account.code
                const isHighlighted =
                  highlightedAccountId === account.id || isSelected

                return (
                  <li key={account.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={accountSearchDropdownItemClass(
                        isHighlighted,
                        isSelected,
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setHighlightedAccountId(account.id)}
                      onMouseLeave={() =>
                        setHighlightedAccountId((current) =>
                          current === account.id ? null : current,
                        )
                      }
                      onClick={() => selectAccount(account)}
                    >
                      <span className="shrink-0 font-mono text-xs tabular-nums text-[var(--rootsy-bruma-500)]">
                        {account.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[var(--rootsy-bruma-900)]">
                        {account.name}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
