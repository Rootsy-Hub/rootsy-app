"use client"

import { searchCheckoutSuppliers } from "@/app/[siteId]/[popId]/checkout/partySearchActions"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import {
  getFormInlineIconSearchInputStyle,
  getFormInlineIconSearchShellStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import {
  rootsFormControlSelectionClass,
  rootsFormUiAffixClearButtonClass,
  rootsFormUiControlRadiusClass,
  rootsFormUiControlTypographyClass,
  rootsFormUiInlineIconPrefixClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { cn } from "@/lib/utils"
import { Building2, Loader2, Search, X } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

export type ArticleSupplierOption = {
  id: string
  name: string
}

type Props = {
  popId: string
  value: string
  onChange: (supplier: ArticleSupplierOption | null) => void
  knownSuppliers?: ArticleSupplierOption[]
  disabled?: boolean
  id?: string
}

const supplierOptionButtonClass = cn(
  "group flex w-full min-w-0 items-center gap-3 border px-3 py-2.5 text-left transition-[background-color,border-color,box-shadow] duration-150",
  rootsFormUiControlRadiusClass,
  "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)]",
  "hover:border-[var(--rootsy-bruma-300)] hover:bg-[var(--rootsy-bruma-50)]",
  "focus-visible:outline-none focus-visible:border-[var(--rootsy-savia-400)] focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

const supplierOptionIconClass = cn(
  "flex size-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]",
  rootsFormUiInlineIconPrefixClass,
)

const supplierEmptyStateClass = cn(
  rootsFormUiControlRadiusClass,
  "border border-dashed border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] text-sm text-[var(--rootsy-bruma-500)]",
)

export function ArticleSupplierPickerField({
  popId,
  value,
  onChange,
  knownSuppliers = [],
  disabled = false,
  id,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<ArticleSupplierOption[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchGenRef = useRef(0)
  const autoId = useId()
  const searchInputId = id ?? autoId
  const { state, interactionHandlers } = useRootsFormControlInteraction({ disabled })
  const searchShellStyle = getFormInlineIconSearchShellStyle(state)
  const searchInputStyle = getFormInlineIconSearchInputStyle(state)

  const nameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const supplier of knownSuppliers) {
      map.set(supplier.id, supplier.name)
    }
    for (const supplier of results) {
      map.set(supplier.id, supplier.name)
    }
    return map
  }, [knownSuppliers, results])

  const selected = value
    ? { id: value, name: nameById.get(value) ?? "Proveedor" }
    : null

  const searchTrim = searchQuery.trim()

  useEffect(() => {
    if (!searchTrim) {
      setResults([])
      setSearchLoading(false)
      return
    }

    const gen = ++searchGenRef.current
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearchLoading(true)
        const res = await searchCheckoutSuppliers(popId, searchTrim)
        if (gen !== searchGenRef.current) return
        setSearchLoading(false)
        if (!res.success) {
          setResults([])
          return
        }
        const mapped = res.parties.map((party) => ({
          id: party.id,
          name: party.name,
        }))
        setResults(mapped.filter((row) => row.id !== value))
      })()
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [popId, searchTrim, value])

  const selectSupplier = (supplier: ArticleSupplierOption) => {
    onChange(supplier)
    setSearchQuery("")
    setResults([])
  }

  return (
    <RootsFormField
      label="Proveedor"
      htmlFor={searchInputId}
      hint={
        searchTrim
          ? undefined
          : "Opcional. De quién es esta forma de compra."
      }
    >
      <div className="flex w-full min-w-0 flex-col gap-2">
        {selected ? (
          <span
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 self-start rounded-full border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] py-1 pl-3 pr-1.5 text-sm text-[var(--rootsy-bruma-900)]",
            )}
          >
            <span className="max-w-56 truncate">{selected.name}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(null)}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-[var(--rootsy-bruma-500)] transition-colors duration-150",
                "hover:bg-[var(--rootsy-bruma-100)] hover:text-[var(--rootsy-bruma-900)]",
                "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
              )}
              aria-label={`Quitar ${selected.name}`}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ) : null}

        <div className="relative w-full min-w-0">
          <div
            style={searchShellStyle}
            onMouseEnter={interactionHandlers.onMouseEnter}
            onMouseLeave={interactionHandlers.onMouseLeave}
          >
            <span className={rootsFormUiInlineIconPrefixClass}>
              <Search className="size-4" aria-hidden />
            </span>
            <input
              id={searchInputId}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proveedor por nombre o CUIT…"
              disabled={disabled}
              autoComplete="off"
              className={cn(
                rootsFormUiControlTypographyClass,
                "placeholder:text-[var(--rootsy-bruma-500)] disabled:pointer-events-none disabled:cursor-not-allowed",
                rootsFormControlSelectionClass,
                searchQuery.length > 0 && !disabled && "pr-8",
              )}
              style={searchInputStyle}
              onFocus={interactionHandlers.onFocus}
              onBlur={interactionHandlers.onBlur}
            />
          </div>
          {searchQuery.length > 0 && !disabled ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={rootsFormUiAffixClearButtonClass}
              aria-label="Limpiar búsqueda"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>

        {searchTrim ? (
          <ul
            className="flex max-h-48 flex-col gap-2 overflow-y-auto overscroll-contain"
            role="listbox"
            aria-label="Resultados de proveedores"
            aria-busy={searchLoading}
          >
            {searchLoading ? (
              <li
                className={cn(
                  supplierEmptyStateClass,
                  "flex items-center justify-center gap-2 px-4 py-6",
                )}
              >
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Buscando…
              </li>
            ) : results.length === 0 ? (
              <li className={cn(supplierEmptyStateClass, "px-4 py-6 text-center")}>
                Sin resultados
              </li>
            ) : (
              results.map((supplier) => (
                <li key={supplier.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => selectSupplier(supplier)}
                    className={supplierOptionButtonClass}
                  >
                    <span className={supplierOptionIconClass}>
                      <Building2 className="size-4" aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm font-medium leading-5 text-[var(--rootsy-bruma-900)]",
                      )}
                      title={supplier.name}
                    >
                      {supplier.name}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </RootsFormField>
  )
}
