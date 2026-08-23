"use client"

import {
  RootsFormSearchField,
  rootsFormSelectContentClass,
} from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { searchInventoryArticles } from "@/lib/rootsyApi/inventoryClient"
import { labelUnitOfMeasure } from "@/lib/articleItemKind"
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

type OutputOption = {
  id: string
  name: string
  unitOfMeasure: string
}

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
        width: box.width,
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

function optionItemClass(active: boolean, selected: boolean) {
  const state = selected ? "selected" : active ? "highlighted" : "default"
  return cn(
    "flex w-full cursor-pointer items-start justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors",
    rootsFormDropdownHighlightItemClassForTone("light", state),
  )
}

type Props = {
  id: string
  popId: string
  selectedId: string
  selectedName: string
  excludeIds?: string[]
  onSelect: (option: OutputOption) => void
  onClear: () => void
  disabled?: boolean
}

export function RecipeOutputArticleField({
  id,
  popId,
  selectedId,
  selectedName,
  excludeIds = [],
  onSelect,
  onClear,
  disabled = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<OutputOption[]>([])
  const [searchPending, setSearchPending] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const searchGenRef = useRef(0)
  const selectedIdRef = useRef(selectedId)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const searchTrim = searchQuery.trim()
  const excludeKey = excludeIds.join(",")
  const isSearching = searchPending || searchLoading
  const showDropdown = isFocused && isEditing && searchTrim.length > 0
  const dropdownRect = useAnchoredDropdownRect(anchorRef, showDropdown)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    if (isEditing) return
    setSearchQuery(selectedName)
  }, [isEditing, selectedName])

  useEffect(() => {
    if (!isEditing || !searchTrim) {
      setResults([])
      setSearchPending(false)
      setSearchLoading(false)
      setHighlightedId(null)
      return
    }

    setSearchPending(true)
    setResults([])

    const gen = ++searchGenRef.current
    const excluded = new Set(excludeKey ? excludeKey.split(",") : [])
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearchPending(false)
        setSearchLoading(true)
        const res = await searchInventoryArticles(popId, searchTrim)
        if (gen !== searchGenRef.current) return
        setSearchLoading(false)
        if (res.success) {
          const next = res.articles
            .filter((item) => !excluded.has(item.id))
            .map((item) => ({
              id: item.id,
              name: item.name,
              unitOfMeasure: item.unitOfMeasure,
            }))
          setResults(next)
          setHighlightedId(next[0]?.id ?? null)
          return
        }
        setResults([])
        setHighlightedId(null)
      })()
    }, 280)

    return () => {
      window.clearTimeout(timer)
    }
  }, [excludeKey, isEditing, popId, searchTrim])

  const selectOption = (option: OutputOption) => {
    setIsEditing(false)
    onSelect(option)
    setSearchQuery(option.name)
    setResults([])
    setHighlightedId(null)
    setIsFocused(true)
  }

  const handleClear = () => {
    setIsEditing(false)
    setSearchQuery("")
    setResults([])
    setHighlightedId(null)
    onClear()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const index = results.findIndex((item) => item.id === highlightedId)
      const next = results[(index + 1) % results.length]
      if (next) setHighlightedId(next.id)
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      const index = results.findIndex((item) => item.id === highlightedId)
      const next = results[(index - 1 + results.length) % results.length]
      if (next) setHighlightedId(next.id)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const highlighted =
        results.find((item) => item.id === highlightedId) ?? results[0]
      if (highlighted) selectOption(highlighted)
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
      aria-label="Artículo que produce"
      aria-busy={isSearching}
    >
      {isSearching ? (
        <li className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-[var(--rootsy-bruma-500)]">
          <RootsSpinner size="sm" aria-hidden />
          Buscando…
        </li>
      ) : results.length === 0 ? (
        <li className="px-3 py-4 text-center text-sm text-[var(--rootsy-bruma-500)]">
          Sin artículos para esa búsqueda
        </li>
      ) : (
        results.map((option) => {
          const isSelected = selectedId === option.id
          const isHighlighted = highlightedId === option.id || isSelected
          return (
            <li key={option.id}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={optionItemClass(isHighlighted, isSelected)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlightedId(option.id)}
                onMouseLeave={() =>
                  setHighlightedId((current) =>
                    current === option.id ? null : current,
                  )
                }
                onClick={() => selectOption(option)}
              >
                <span className="min-w-0 flex-1 text-pretty text-[var(--rootsy-bruma-900)]">
                  {option.name}
                </span>
                <span className="shrink-0 text-xs text-[var(--rootsy-bruma-500)]">
                  {labelUnitOfMeasure(option.unitOfMeasure)}
                </span>
              </button>
            </li>
          )
        })
      )}
    </ul>
  )

  return (
    <div ref={anchorRef} className="relative min-w-0">
      <RootsFormSearchField
        label="Artículo que produce"
        id={id}
        value={searchQuery}
        disabled={disabled}
        onChange={(event) => {
          setIsEditing(true)
          setIsFocused(true)
          setSearchQuery(event.target.value)
          if (selectedIdRef.current) onClear()
        }}
        onClear={handleClear}
        placeholder="Buscar artículo…"
        resultsSummary={
          showDropdown
            ? isSearching
              ? "Buscando artículos…"
              : results.length === 0
                ? "Sin artículos para esa búsqueda"
                : `${results.length} resultado${results.length === 1 ? "" : "s"}`
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
