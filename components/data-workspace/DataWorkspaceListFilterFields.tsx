"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { RootsFormPrefixedInput } from "@/components/rootsy-form/RootsFormPrefixedInput"
import {
  rootsFormAffixPrefixClass,
  rootsFormControlTypographyClass,
  rootsFormPrefixedSelectTriggerClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { dataWorkspaceListFiltersFieldClass } from "@/components/data-workspace/dataWorkspaceTablesLayout"
import { lightToolbarClearButtonClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { Filter, Search } from "lucide-react"
import type { ComponentProps, ReactNode, RefObject } from "react"

const rootsFormFilterTriggerActiveClass =
  "!border-[#16704a] ring-2 ring-[#16704a]/20"

function ToolbarClearSearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-3.5 shrink-0", className)}
      aria-hidden
    >
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  )
}

export function DataWorkspaceListFiltersDialogTrigger({
  id,
  label = "Filtros",
  placeholder = "Estado y tipo",
  activeLabel = "Refinar filtros",
  activeCount = 0,
  expanded = false,
  onClick,
  className,
}: {
  id: string
  label?: string
  placeholder?: string
  activeLabel?: string
  activeCount?: number
  expanded?: boolean
  onClick: () => void
  className?: string
}) {
  const active = activeCount > 0

  return (
    <RootsFormField
      label={label}
      htmlFor={id}
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
    >
      <button
        id={id}
        type="button"
        className={cn(
          rootsFormPrefixedSelectTriggerClass,
          "cursor-pointer text-left",
          active && rootsFormFilterTriggerActiveClass,
        )}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        onClick={onClick}
      >
        <span className={rootsFormAffixPrefixClass} aria-hidden>
          <Filter className="size-4" />
        </span>
        <span
          data-slot="select-value"
          className={cn(
            rootsFormControlTypographyClass,
            "flex min-w-0 flex-1 items-center gap-2",
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {active ? activeLabel : placeholder}
          </span>
          {active ? (
            <span
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-[#16704a]/12 text-[10px] font-semibold tabular-nums text-[#16704a]"
              aria-hidden
            >
              {activeCount}
            </span>
          ) : null}
        </span>
      </button>
    </RootsFormField>
  )
}

export function DataWorkspaceListSearchField({
  id,
  inputRef,
  value,
  onChange,
  onClear,
  placeholder = "Título o referencia…",
  resultsSummary,
  label = "Buscar",
  className,
  inputProps,
}: {
  id: string
  inputRef?: RefObject<HTMLInputElement | null>
  value: string
  onChange: ComponentProps<"input">["onChange"]
  onClear?: () => void
  placeholder?: string
  resultsSummary?: ReactNode
  label?: string
  className?: string
  inputProps?: Omit<
    ComponentProps<typeof RootsFormPrefixedInput>,
    "id" | "prefix" | "value" | "onChange" | "placeholder" | "ref"
  >
}) {
  const hasValue = value.length > 0

  return (
    <RootsFormField
      label={label}
      htmlFor={id}
      className={cn(dataWorkspaceListFiltersFieldClass(), className)}
    >
      {resultsSummary ? (
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {resultsSummary}
        </span>
      ) : null}
      <div className="relative min-w-0 w-full">
        <RootsFormPrefixedInput
          ref={inputRef}
          id={id}
          type="search"
          prefix={<Search className="size-4" aria-hidden />}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar en el listado"
          inputClassName={cn(hasValue && onClear && "pr-10")}
          {...inputProps}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            className={cn(lightToolbarClearButtonClass, "absolute right-1 top-1/2 -translate-y-1/2")}
            onClick={onClear}
          >
            <ToolbarClearSearchIcon />
          </button>
        ) : null}
      </div>
    </RootsFormField>
  )
}
