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

type SupplierOption = {
  id: string
  name: string
}

type Props = {
  popId: string
  value: string[]
  onChange: (supplierIds: string[]) => void
  knownSuppliers?: SupplierOption[]
  disabled?: boolean
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

function ArticleSupplierSearchOption({
  supplier,
  onSelect,
}: {
  supplier: SupplierOption
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={false}
      onClick={onSelect}
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
  )
}

export function ArticleSupplierPickerField({
  popId,
  value,
  onChange,
  knownSuppliers = [],
  disabled = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SupplierOption[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchGenRef = useRef(0)
  const searchInputId = useId()
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

  const selectedSuppliers = useMemo(() => {
    return value.map((id) => ({
      id,
      name: nameById.get(id) ?? "Proveedor",
    }))
  }, [value, nameById])

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
        setResults(mapped.filter((row) => !value.includes(row.id)))
      })()
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [popId, searchTrim, value])

  const addSupplier = (supplier: SupplierOption) => {
    if (value.includes(supplier.id)) return
    onChange([...value, supplier.id])
    setSearchQuery("")
    setResults([])
  }

  const removeSupplier = (supplierId: string) => {
    onChange(value.filter((id) => id !== supplierId))
  }

  return (
    <RootsFormField
      label="Proveedores"
      htmlFor={searchInputId}
      hint={
        searchTrim
          ? undefined
          : "Buscá y seleccioná uno o más proveedores habituales para este ítem."
      }
    >
      <div className="flex w-full min-w-0 flex-col gap-2">
        {selectedSuppliers.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {selectedSuppliers.map((supplier) => (
              <li key={supplier.id}>
                <span
                  className={cn(
                    "inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] py-1 pl-3 pr-1.5 text-sm text-[var(--rootsy-bruma-900)]",
                  )}
                >
                  <span className="max-w-56 truncate">{supplier.name}</span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeSupplier(supplier.id)}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[var(--rootsy-bruma-500)] transition-colors duration-150",
                      "hover:bg-[var(--rootsy-bruma-100)] hover:text-[var(--rootsy-bruma-900)]",
                      "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
                    )}
                    aria-label={`Quitar ${supplier.name}`}
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
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
                  <ArticleSupplierSearchOption
                    supplier={supplier}
                    onSelect={() => addSupplier(supplier)}
                  />
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </RootsFormField>
  )
}
