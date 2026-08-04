"use client"

import { searchCheckoutSuppliers } from "@/app/[siteId]/[popId]/checkout/partySearchActions"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { rootsFormTextFieldClass } from "@/components/rootsy-form/rootsFormStyles"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
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

function SearchClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Limpiar búsqueda"
    >
      <X className="size-4" aria-hidden />
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

      {selectedSuppliers.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {selectedSuppliers.map((supplier) => (
            <li key={supplier.id}>
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/70 bg-muted/20 py-1 pl-3 pr-1.5 text-sm text-foreground">
                <span className="max-w-[14rem] truncate">{supplier.name}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeSupplier(supplier.id)}
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
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
            rootsFormTextFieldClass,
            "pl-10",
            searchQuery.length > 0 && !disabled && "pr-10",
          )}
        />
        {searchQuery.length > 0 && !disabled ? (
          <SearchClearButton onClick={() => setSearchQuery("")} />
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
            <li className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Buscando…
            </li>
          ) : results.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
              Sin resultados
            </li>
          ) : (
            results.map((supplier) => (
              <li key={supplier.id}>
                <CheckoutOptionCard
                  title={supplier.name}
                  selected={false}
                  onClick={() => addSupplier(supplier)}
                  icon={Building2}
                />
              </li>
            ))
          )}
        </ul>
      ) : null}
    </RootsFormField>
  )
}
