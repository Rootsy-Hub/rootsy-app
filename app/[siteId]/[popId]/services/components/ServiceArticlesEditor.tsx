"use client"

import type { ServiceArticleOption } from "@/app/[siteId]/[popId]/services/actions"
import { searchServiceArticleOptions } from "@/lib/rootsyApi/servicesClient"
import { RootsSubtleButton } from "@/components/rootsy-button"
import { RootsFormPrefixedInput } from "@/components/rootsy-form/RootsFormPrefixedInput"
import { useRootsFormFieldControlProps, useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  getFormInlineIconSearchInputStyle,
  getFormInlineIconSearchShellStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import {
  rootsFormAffixClearButtonClassForTone,
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
  rootsFormFieldLabelClass,
  rootsFormSelectContentClass,
} from "@/components/rootsy-form/rootsFormStyles"
import {
  rootsFormUiControlTypographyClass,
  rootsFormUiFieldErrorClass,
  rootsFormUiInlineIconPrefixClass,
  rootsFormUiInlineIconShellClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { unitOfMeasureAffix } from "@/components/rootsy-form/RootsFormUnitOfMeasureAffix"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { cn } from "@/lib/utils"
import { Plus, Search, Trash2, X } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import {
  serviceDialogRepeatableListClass,
  serviceDialogRepeatableListItemClass,
} from "@/app/[siteId]/[popId]/services/serviceDialogShared"

export type ServiceArticleFormLine = {
  key: string
  articleId: string
  quantity: string
  articleName?: string
  unitOfMeasure?: string
}

function isArticleLineComplete(line: ServiceArticleFormLine): boolean {
  const qty = Number(line.quantity.replace(",", "."))
  return line.articleId.trim().length > 0 && Number.isFinite(qty) && qty > 0
}

type Props = {
  idPrefix: string
  popId: string
  lines: ServiceArticleFormLine[]
  onChange: (lines: ServiceArticleFormLine[]) => void
  disabled?: boolean
  error?: string
  addLabel?: string
  /** Sin bordes de listado — artículos dentro de un adicional. */
  embedded?: boolean
}

const MAX_SEARCH_RESULTS = 5
const SEARCH_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 1
const FIELD_REQUIRED_MESSAGE = "Requerido"

const searchInputWithoutNativeClearClass =
  "[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-moz-search-clear-button]:hidden"

function newLineKey(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyServiceArticleLine(): ServiceArticleFormLine {
  return {
    key: newLineKey(),
    articleId: "",
    quantity: "1",
  }
}

const articleSearchDropdownItemClass = (
  active: boolean,
  selected: boolean,
) => {
  const state = selected ? "selected" : active ? "highlighted" : "default"
  return cn(
    "flex w-full cursor-pointer flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm transition-colors",
    rootsFormDropdownHighlightItemClassForTone("light", state),
  )
}

function selectedFromLine(line: ServiceArticleFormLine): ServiceArticleOption | null {
  if (!line.articleId || !line.articleName) return null
  return {
    id: line.articleId,
    name: line.articleName,
    itemKind: "raw_material",
    unitOfMeasure: line.unitOfMeasure ?? "u",
  }
}

function ServiceArticleLineRow({
  popId,
  line,
  index,
  usedIds,
  disabled,
  showFieldErrors,
  onUpdate,
  onRemove,
}: {
  popId: string
  line: ServiceArticleFormLine
  index: number
  usedIds: Set<string>
  disabled: boolean
  showFieldErrors: boolean
  onUpdate: (patch: Partial<ServiceArticleFormLine>) => void
  onRemove: () => void
}) {
  const [selected, setSelected] = useState<ServiceArticleOption | null>(() =>
    selectedFromLine(line),
  )
  const [query, setQuery] = useState(line.articleName ?? "")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ServiceArticleOption[]>([])
  const [searching, setSearching] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedOptionId, setHighlightedOptionId] = useState<string | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const searchRequestRef = useRef(0)
  const searchInputId = useId()
  const quantityInputId = useId()
  const articleInvalid = showFieldErrors && !line.articleId.trim()
  const quantityInvalid =
    showFieldErrors &&
    (!line.articleId.trim() || !isArticleLineComplete(line))
  const { state, interactionHandlers } = useRootsFormControlInteraction({
    disabled,
    invalid: articleInvalid,
  })
  const tone = useRootsFormControlTone()
  const searchShellStyle = getFormInlineIconSearchShellStyle(state, { tone })
  const searchInputStyle = getFormInlineIconSearchInputStyle(state, { tone })
  const quantityControlProps = useRootsFormFieldControlProps({ invalid: quantityInvalid })
  const quantityAffix = unitOfMeasureAffix(selected?.unitOfMeasure)
  const hasQuery = query.length > 0

  useEffect(() => {
    const nextSelected = selectedFromLine(line)
    setSelected(nextSelected)
    if (nextSelected?.name) {
      setQuery(nextSelected.name)
    }
  }, [line.articleId, line.articleName, line.unitOfMeasure])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const q = debouncedQuery
    if (q.length < MIN_QUERY_LENGTH) {
      setSearchResults([])
      setSearching(false)
      return
    }

    if (selected && q === selected.name.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    const requestId = ++searchRequestRef.current
    setSearching(true)

    void searchServiceArticleOptions(popId, {
      query: q,
      limit: MAX_SEARCH_RESULTS,
      excludeIds: [...usedIds].filter((id) => id !== line.articleId),
    }).then((res) => {
      if (requestId !== searchRequestRef.current) return
      setSearching(false)
      setSearchResults(res.success ? res.articles : [])
    })
  }, [debouncedQuery, line.articleId, popId, selected, usedIds])

  const queryReady = debouncedQuery.length >= MIN_QUERY_LENGTH
  const matchesSelected = Boolean(selected && query.trim() === selected.name.trim())
  const showDropdownPanel =
    dropdownOpen && !disabled && queryReady && !matchesSelected

  useEffect(() => {
    if (!showDropdownPanel) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rowRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [showDropdownPanel])

  const selectOption = (option: ServiceArticleOption) => {
    setSelected(option)
    onUpdate({
      articleId: option.id,
      articleName: option.name,
      unitOfMeasure: option.unitOfMeasure,
    })
    setQuery(option.name)
    setDropdownOpen(false)
  }

  const clearSearch = () => {
    setQuery("")
    setDebouncedQuery("")
    setSearchResults([])
    setDropdownOpen(false)
    setSelected(null)
    onUpdate({
      articleId: "",
      articleName: undefined,
      unitOfMeasure: undefined,
    })
  }

  return (
    <div ref={rowRef} className="flex flex-col gap-1.5">
      <label htmlFor={searchInputId} className={rootsFormFieldLabelClass}>
        Artículo {index + 1}
      </label>

      <div className="flex items-start gap-2">
        <div className="relative min-w-0 flex flex-1 flex-col gap-1">
          <div
            className={cn(rootsFormUiInlineIconShellClass, "min-h-11")}
            style={searchShellStyle}
            aria-invalid={articleInvalid || undefined}
            {...interactionHandlers}
          >
            <Search
              className={cn("size-4 shrink-0", rootsFormUiInlineIconPrefixClass)}
              aria-hidden
            />
            <input
              id={searchInputId}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={query}
              onChange={(event) => {
                const next = event.target.value
                setQuery(next)
                setDropdownOpen(next.trim().length >= MIN_QUERY_LENGTH)
                if (selected && next.trim() !== selected.name.trim()) {
                  setSelected(null)
                  onUpdate({
                    articleId: "",
                    articleName: undefined,
                    unitOfMeasure: undefined,
                  })
                }
              }}
              onFocus={() => {
                if (query.trim().length >= MIN_QUERY_LENGTH && !matchesSelected) {
                  setDropdownOpen(true)
                }
              }}
              disabled={disabled}
              placeholder="Buscar artículo…"
              autoComplete="off"
              spellCheck={false}
              className={cn(
                "min-w-0 flex-1 bg-transparent outline-none",
                rootsFormUiControlTypographyClass,
                searchInputWithoutNativeClearClass,
                hasQuery && "pr-8",
              )}
              style={searchInputStyle}
            />
          </div>
          {hasQuery && !disabled ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              className={cn(
                rootsFormAffixClearButtonClassForTone(tone),
                "absolute right-1 top-1/2 -translate-y-1/2",
              )}
              onClick={clearSearch}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}

          {showDropdownPanel ? (
            <div className="absolute inset-x-0 top-[calc(100%+4px)] z-20">
              <div
                className={cn(
                  rootsFormSelectContentClass,
                  "w-full min-w-0 max-w-none overflow-x-hidden overflow-y-auto",
                )}
              >
                <ul
                  className={rootsFormDropdownListClass}
                  role="listbox"
                  aria-label="Artículos"
                  aria-busy={searching}
                >
                  {searching ? (
                    <li className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-[var(--rootsy-bruma-500)]">
                      <RootsSpinner size="sm" tone="light" aria-hidden />
                      Buscando…
                    </li>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((option) => {
                      const isSelected = option.id === line.articleId
                      const isHighlighted =
                        highlightedOptionId === option.id || isSelected

                      return (
                        <li key={option.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={articleSearchDropdownItemClass(
                              isHighlighted,
                              isSelected,
                            )}
                            onMouseEnter={() => setHighlightedOptionId(option.id)}
                            onMouseLeave={() =>
                              setHighlightedOptionId((current) =>
                                current === option.id ? null : current,
                              )
                            }
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectOption(option)}
                          >
                            <span className="w-full truncate font-medium">{option.name}</span>
                          </button>
                        </li>
                      )
                    })
                  ) : (
                    <li className="px-3 py-4 text-center text-sm text-[var(--rootsy-bruma-500)]">
                      Sin resultados
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : null}
          {articleInvalid ? (
            <p className={rootsFormUiFieldErrorClass}>{FIELD_REQUIRED_MESSAGE}</p>
          ) : null}
        </div>

        <div className="flex w-28 shrink-0 flex-col gap-1">
          <label htmlFor={quantityInputId} className="sr-only">
            Cantidad
          </label>
          <RootsFormPrefixedInput
            id={quantityInputId}
            value={line.quantity}
            onChange={(event) => onUpdate({ quantity: event.target.value })}
            disabled={disabled || !line.articleId}
            placeholder="1"
            inputMode="decimal"
            prefix={quantityAffix.prefix}
            prefixClassName={quantityAffix.prefixClassName}
            className="min-h-11"
            invalid={quantityControlProps.isInvalid}
            aria-describedby={quantityControlProps.describedBy}
          />
          {quantityInvalid ? (
            <p className={rootsFormUiFieldErrorClass}>{FIELD_REQUIRED_MESSAGE}</p>
          ) : null}
        </div>

        <RootsSubtleButton
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Quitar artículo ${index + 1}`}
          className="mt-0 shrink-0 self-center"
        >
          <Trash2 className="size-4" />
        </RootsSubtleButton>
      </div>
    </div>
  )
}

export function ServiceArticlesEditor({
  idPrefix,
  popId,
  lines,
  onChange,
  disabled = false,
  error,
  addLabel = "Agregar artículo",
  embedded = false,
}: Props) {
  const usedIds = new Set(lines.map((line) => line.articleId).filter(Boolean))

  const updateLine = (key: string, patch: Partial<ServiceArticleFormLine>) => {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  const removeLine = (key: string) => {
    onChange(lines.filter((line) => line.key !== key))
  }

  const addLine = () => {
    onChange([...lines, createEmptyServiceArticleLine()])
  }

  return (
    <div className="flex flex-col gap-3">
      {lines.length > 0 ? (
        embedded ? (
          <div className="flex flex-col gap-4">
            {lines.map((line, index) => (
              <ServiceArticleLineRow
                key={line.key}
                popId={popId}
                line={line}
                index={index}
                usedIds={usedIds}
                disabled={disabled}
                showFieldErrors={Boolean(error) && !isArticleLineComplete(line)}
                onUpdate={(patch) => updateLine(line.key, patch)}
                onRemove={() => removeLine(line.key)}
              />
            ))}
          </div>
        ) : (
          <div className={serviceDialogRepeatableListClass}>
            {lines.map((line, index) => (
              <div key={line.key} className={serviceDialogRepeatableListItemClass}>
                <ServiceArticleLineRow
                  popId={popId}
                  line={line}
                  index={index}
                  usedIds={usedIds}
                  disabled={disabled}
                  showFieldErrors={Boolean(error) && !isArticleLineComplete(line)}
                  onUpdate={(patch) => updateLine(line.key, patch)}
                  onRemove={() => removeLine(line.key)}
                />
              </div>
            ))}
          </div>
        )
      ) : null}

      <RootsSubtleButton
        type="button"
        className="self-end"
        disabled={disabled}
        onClick={addLine}
      >
        <Plus className="size-4" aria-hidden />
        {addLabel}
      </RootsSubtleButton>
    </div>
  )
}
