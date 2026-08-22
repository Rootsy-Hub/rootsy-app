"use client"

import type { ChartAccountSearchRow } from "@/app/[siteId]/[popId]/reports/accountingActions"
import { searchAccountingChartAccounts } from "@/lib/rootsyApi/reportsClient"
import { RootsFormSearchField, rootsFormSelectContentClass } from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { cn } from "@/lib/utils"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react"
import { createPortal } from "react-dom"

type DropdownRect = {
  top: number
  left: number
  width: number
}

function useAnchoredDropdownRect(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
) {
  const [rect, setRect] = useState<DropdownRect | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setRect(null)
      return
    }

    const update = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const box = anchor.getBoundingClientRect()
      setRect({
        top: box.bottom + 4,
        left: box.left,
        width: Math.max(box.width, 480),
      })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [anchorRef, open])

  return rect
}

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
  const [searchPending, setSearchPending] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [highlightedAccountId, setHighlightedAccountId] = useState<string | null>(
    null,
  )
  const [isFocused, setIsFocused] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const searchGenRef = useRef(0)
  const selectedCodeRef = useRef(accountCode)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const searchTrim = searchQuery.trim()
  const isSearching = searchPending || searchLoading
  const showDropdown = isFocused && isEditing && searchTrim.length > 0
  const dropdownRect = useAnchoredDropdownRect(anchorRef, showDropdown)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    selectedCodeRef.current = accountCode
  }, [accountCode])

  useEffect(() => {
    if (isEditing) return
    if (selectedAccountLabel && accountCode) {
      setSearchQuery(selectedAccountLabel)
    }
  }, [accountCode, isEditing, selectedAccountLabel])

  useEffect(() => {
    if (!isEditing || !searchTrim) {
      if (!searchTrim) {
        setResults([])
        setSearchPending(false)
        setSearchLoading(false)
        setHighlightedAccountId(null)
      } else {
        setSearchPending(false)
        setSearchLoading(false)
      }
      return
    }

    setSearchPending(true)
    setResults([])

    const gen = ++searchGenRef.current
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearchPending(false)
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
  }, [popId, searchTrim, isEditing])

  const selectAccount = (account: ChartAccountSearchRow) => {
    setIsEditing(false)
    onAccountCodeChange(account.code)
    setSearchQuery(formatAccountOptionLabel(account))
    setResults([])
    setHighlightedAccountId(null)
    setIsFocused(true)
  }

  const handleClear = () => {
    setIsEditing(false)
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

  const dropdownContent = (
    <ul
      className={cn(rootsFormDropdownListClass, "w-full")}
      role="listbox"
      aria-label="Cuentas contables"
      aria-busy={isSearching}
    >
      {isSearching ? (
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
                <span className="min-w-0 flex-1 text-pretty text-[var(--rootsy-bruma-900)]">
                  {account.name}
                </span>
              </button>
            </li>
          )
        })
      )}
    </ul>
  )

  return (
    <div ref={anchorRef} className={cn("relative min-w-0", className)}>
      <RootsFormSearchField
        label="Buscar cuenta contable"
        hideLabel
        id="ledger-account-search"
        value={searchQuery}
        onChange={(event) => {
          setIsEditing(true)
          setIsFocused(true)
          setSearchQuery(event.target.value)
          if (selectedCodeRef.current) {
            onAccountCodeChange("")
          }
        }}
        onClear={handleClear}
        placeholder="Código o nombre de cuenta contable"
        resultsSummary={
          showDropdown
            ? isSearching
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

      {mounted && showDropdown && dropdownRect
        ? createPortal(
            <div
              className={cn(
                "fixed z-[600] max-h-60 overflow-x-hidden overflow-y-auto overscroll-contain",
                rootsFormSelectContentClass,
                "max-w-none",
              )}
              style={{
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
              }}
            >
              {dropdownContent}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
