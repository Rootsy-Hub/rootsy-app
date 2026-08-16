"use client"

import type {
  StatisticsEvolutionDualSeries,
  StatisticsEvolutionPoint,
  StatisticsProductTrendOption,
} from "@/app/[siteId]/[popId]/statistics/actions"
import { StatisticsEvolutionChart } from "@/components/statistics/StatisticsEvolutionChart"
import {
  statisticsLosetaCardBodyClass,
  statisticsLosetaCardClass,
  statisticsSectionHeadingClassNames,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { RootsFormSearchField } from "@/components/rootsy-form"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react"

type Props = {
  panelId: string
  panelRef?: RefObject<HTMLElement | null>
  title: string
  description: string
  searchLabel: string
  searchPlaceholder: string
  options: StatisticsProductTrendOption[]
  trendByKey: Record<string, StatisticsEvolutionPoint[]>
  defaultKey: string | null
  loading?: boolean
  emptyMessage: string
  emptyNoSelectionMessage: string
  selectedKey?: string | null
  onSelectedKeyChange?: (key: string | null, label: string) => void
  dualSeries?: StatisticsEvolutionDualSeries
}

export function StatisticsTrendDetailPanel({
  panelId,
  panelRef,
  title,
  description,
  searchLabel,
  searchPlaceholder,
  options,
  trendByKey,
  defaultKey,
  loading,
  emptyMessage,
  emptyNoSelectionMessage,
  selectedKey: controlledKey,
  onSelectedKeyChange,
  dualSeries = {
    primaryLabel: "Importe vendido",
    secondaryLabel: "Cantidad vendida",
    secondaryFormat: "number",
    tertiaryLabel: "Ganancia",
  },
}: Props) {
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const [internalKey, setInternalKey] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeOptionIndex, setActiveOptionIndex] = useState(0)

  const selectedKey = controlledKey !== undefined ? controlledKey : internalKey

  useEffect(() => {
    if (controlledKey !== undefined) return
    setInternalKey(defaultKey)
    const defaultLabel =
      options.find((option) => option.key === defaultKey)?.label ?? ""
    setSearchQuery(defaultLabel)
  }, [controlledKey, defaultKey, options])

  useEffect(() => {
    if (controlledKey === undefined || controlledKey === null) return
    const label =
      options.find((option) => option.key === controlledKey)?.label ?? ""
    setSearchQuery(label)
  }, [controlledKey, options])

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return options.slice(0, 12)
    return options
      .filter((option) => option.label.toLowerCase().includes(query))
      .slice(0, 12)
  }, [options, searchQuery])

  const selectedOption = useMemo(
    () => options.find((option) => option.key === selectedKey) ?? null,
    [options, selectedKey],
  )

  const trendPoints = selectedKey ? trendByKey[selectedKey] ?? [] : []

  const selectItem = useCallback(
    (key: string, label: string, scroll = true) => {
      if (controlledKey === undefined) {
        setInternalKey(key)
      }
      setSearchQuery(label)
      setSearchOpen(false)
      onSelectedKeyChange?.(key, label)
      if (scroll) {
        requestAnimationFrame(() => {
          panelRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        })
      }
    },
    [controlledKey, onSelectedKeyChange, panelRef],
  )

  useEffect(() => {
    if (!searchOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!searchWrapRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [searchOpen])

  useEffect(() => {
    setActiveOptionIndex(0)
  }, [searchQuery, searchOpen])

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen && (event.key === "ArrowDown" || event.key === "Enter")) {
      setSearchOpen(true)
      return
    }
    if (!searchOpen || filteredOptions.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveOptionIndex((index) =>
        index + 1 >= filteredOptions.length ? 0 : index + 1,
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveOptionIndex((index) =>
        index - 1 < 0 ? filteredOptions.length - 1 : index - 1,
      )
    } else if (event.key === "Enter") {
      event.preventDefault()
      const option = filteredOptions[activeOptionIndex]
      if (option) selectItem(option.key, option.label, false)
    } else if (event.key === "Escape") {
      setSearchOpen(false)
    }
  }

  const { title: titleClass, description: descriptionClass } =
    statisticsSectionHeadingClassNames()
  const searchListId = `${panelId}-search-list`

  return (
    <section id={panelId} ref={panelRef} className="scroll-mt-6">
      <div
        className={cn(
          statisticsLosetaCardClass,
          statisticsLosetaCardBodyClass,
          "overflow-visible",
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className={titleClass}>{title}</h3>
            <p className={descriptionClass}>
              {selectedOption
                ? `Evolución diaria · ${selectedOption.label}`
                : description}
            </p>
          </div>
          <div
            ref={searchWrapRef}
            className="relative w-full shrink-0 lg:max-w-sm"
          >
            <RootsFormSearchField
              label={searchLabel}
              hideLabel
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => {
                const value = event.target.value
                setSearchQuery(value)
                setSearchOpen(true)
                if (!value.trim()) {
                  if (controlledKey === undefined) setInternalKey(null)
                  onSelectedKeyChange?.(null, "")
                }
              }}
              onClear={() => {
                setSearchQuery("")
                setSearchOpen(true)
                if (controlledKey === undefined) setInternalKey(null)
                onSelectedKeyChange?.(null, "")
              }}
              disabled={loading || options.length === 0}
              inputProps={{
                onFocus: () => setSearchOpen(true),
                onKeyDown: handleSearchKeyDown,
                role: "combobox",
                "aria-expanded": searchOpen,
                "aria-controls": searchListId,
                "aria-autocomplete": "list",
              }}
            />
            {searchOpen && filteredOptions.length > 0 ? (
              <ul
                id={searchListId}
                role="listbox"
                className={cn(
                  rootsFormDropdownListClass,
                  "absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-rootsy-bruma-200 bg-white py-1 shadow-lg",
                )}
              >
                {filteredOptions.map((option, index) => {
                  const isActive = index === activeOptionIndex
                  const isSelected = option.key === selectedKey
                  return (
                    <li key={option.key} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full px-3 py-2 text-left text-sm transition-colors",
                          rootsFormDropdownHighlightItemClassForTone(
                            "light",
                            isSelected
                              ? "selected"
                              : isActive
                                ? "highlighted"
                                : "default",
                          ),
                        )}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectItem(option.key, option.label, false)}
                      >
                        <span className="truncate">{option.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        </div>
        <StatisticsEvolutionChart
          points={trendPoints}
          loading={loading && Boolean(selectedOption)}
          valueFormat="money"
          dualSeries={dualSeries}
          hideHeader
          embedded
          emptyMessage={selectedOption ? emptyMessage : emptyNoSelectionMessage}
          axisLabelInterval={trendPoints.length > 14 ? 1 : 0}
        />
      </div>
    </section>
  )
}
