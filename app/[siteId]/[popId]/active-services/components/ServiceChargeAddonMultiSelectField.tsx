"use client"

import type { ServiceTypeChargeAddonOption } from "@/app/[siteId]/[popId]/active-services/actions"
import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  getFormSelectChevronWrapStyle,
  getFormSelectTriggerStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import {
  rootsFormDropdownHighlightItemClassForTone,
  rootsFormDropdownListClass,
  rootsFormSelectContentClassForTone,
  rootsFormSelectTriggerClassForTone,
  type RootsFormSelectTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { layoutsOperarFormDarkIconClass } from "@/app/library/layouts/layoutsOperarStyles"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  formatAddonMultiSelectLabel,
  SERVICE_CHARGE_ADDON_NONE_LABEL,
} from "@/lib/serviceChargeAddonSelection"
import { cn } from "@/lib/utils"
import { Check, ChevronDownIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  label: string
  id?: string
  addons: ServiceTypeChargeAddonOption[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  disabled?: boolean
  noneLabel?: string
  emptySelectionLabel?: string
  showNoneOption?: boolean
}

function dropdownItemClass(
  tone: RootsFormSelectTone,
  active: boolean,
  selected: boolean,
) {
  const state = selected ? "selected" : active ? "highlighted" : "default"
  return cn(
    "flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
    rootsFormDropdownHighlightItemClassForTone(tone, state),
  )
}

export function ServiceChargeAddonMultiSelectField({
  label,
  id,
  addons,
  selectedIds,
  onSelectedIdsChange,
  disabled = false,
  noneLabel = SERVICE_CHARGE_ADDON_NONE_LABEL,
  emptySelectionLabel = "Ninguno",
  showNoneOption = true,
}: Props) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const tone = useRootsFormControlTone()
  const isDark = tone === "dark"
  const useSpecStyles = !isDark
  const [open, setOpen] = useState(false)
  const { state, interactionHandlers } = useRootsFormControlInteraction({ disabled })
  const triggerStyle = useSpecStyles ? getFormSelectTriggerStyle(state) : undefined
  const chevronStyle = useSpecStyles ? getFormSelectChevronWrapStyle(state) : undefined

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const triggerLabel =
    showNoneOption && selectedIds.length === 0
      ? noneLabel
      : formatAddonMultiSelectLabel(
          addons,
          selectedIds,
          showNoneOption ? noneLabel : emptySelectionLabel,
        )

  const isPlaceholder =
    (showNoneOption && selectedIds.length === 0) ||
    (!showNoneOption && selectedIds.length === 0)

  const toggleAddon = (addonId: string) => {
    if (selectedSet.has(addonId)) {
      onSelectedIdsChange(selectedIds.filter((itemId) => itemId !== addonId))
      return
    }
    onSelectedIdsChange([...selectedIds, addonId])
  }

  return (
    <RootsFormField label={label} htmlFor={fieldId} tone={tone}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={fieldId}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            data-state={open ? "open" : "closed"}
            className={cn(
              "w-full min-w-0",
              useSpecStyles &&
                "flex h-10 items-center justify-between gap-2 px-3 text-left",
              rootsFormSelectTriggerClassForTone(tone),
            )}
            style={triggerStyle}
            {...(useSpecStyles ? interactionHandlers : {})}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-left",
                isDark &&
                  isPlaceholder &&
                  "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]",
              )}
            >
              {triggerLabel}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 shrink-0 opacity-60",
                isDark ? layoutsOperarFormDarkIconClass : "text-[var(--rootsy-bruma-500)]",
              )}
              style={chevronStyle}
              aria-hidden
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className={cn(
            rootsFormSelectContentClassForTone(tone),
            "w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) max-w-(--radix-popover-trigger-width) p-0",
          )}
        >
          <ul className={rootsFormDropdownListClass} role="listbox" aria-label={label}>
            {showNoneOption ? (
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedIds.length === 0}
                  className={dropdownItemClass(
                    tone,
                    false,
                    selectedIds.length === 0,
                  )}
                  onClick={() => {
                    onSelectedIdsChange([])
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      selectedIds.length === 0 ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{noneLabel}</span>
                </button>
              </li>
            ) : null}

            {addons.map((addon) => {
              const isSelected = selectedSet.has(addon.id)
              return (
                <li key={addon.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={dropdownItemClass(tone, false, isSelected)}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{addon.name}</span>
                    <span
                      className={cn(
                        "shrink-0 tabular-nums",
                        isDark ? "opacity-70" : "opacity-80",
                      )}
                    >
                      {fmt.format(addon.price)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </RootsFormField>
  )
}
