"use client"

import { RootsFormField } from "@/components/rootsy-form/RootsFormField"
import { RootsFormSelectField } from "@/components/rootsy-form/RootsFormSelectField"
import { RootsFormSelectItem } from "@/components/rootsy-form/RootsFormSelectItem"
import {
  getFormInlineIconSearchInputStyle,
  getFormInlineIconSearchShellStyle,
} from "@/components/rootsy-form/rootsFormSpecRuntime"
import { useRootsFormControlInteraction } from "@/components/rootsy-form/useRootsFormControlInteraction"
import { rootsFormControlSelectionClass } from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import { CalendarRange, Filter, Search } from "lucide-react"
import { useId, useState } from "react"

type Props = {
  hideLabels?: boolean
  className?: string
}

export function RootsFormToolbarListFilters({ hideLabels = false, className }: Props) {
  const [period, setPeriod] = useState("")
  const [filters, setFilters] = useState("")
  const searchId = useId()
  const [search, setSearch] = useState("")
  const { state, interactionHandlers } = useRootsFormControlInteraction()
  const searchShellStyle = getFormInlineIconSearchShellStyle(state)
  const searchInputStyle = getFormInlineIconSearchInputStyle(state)

  return (
    <div className={cn("grid h-full w-full grid-cols-3", className)}>
      <div className="flex items-center border-r border-[var(--rootsy-bruma-200)] px-4 py-4">
        <RootsFormSelectField
          label="Período"
          className={hideLabels ? "[&_label]:sr-only" : undefined}
          value={period}
          onValueChange={setPeriod}
          placeholder="Todas las fechas"
          prefix={<CalendarRange aria-hidden />}
          prefixVariant="inline"
        >
          <RootsFormSelectItem value="all">Todas las fechas</RootsFormSelectItem>
          <RootsFormSelectItem value="month">Este mes</RootsFormSelectItem>
          <RootsFormSelectItem value="week">Esta semana</RootsFormSelectItem>
        </RootsFormSelectField>
      </div>
      <div className="flex items-center border-r border-[var(--rootsy-bruma-200)] px-4 py-4">
        <RootsFormSelectField
          label="Filtros"
          className={hideLabels ? "[&_label]:sr-only" : undefined}
          value={filters}
          onValueChange={setFilters}
          placeholder="Estado y tipo"
          prefix={<Filter aria-hidden />}
          prefixVariant="inline"
        >
          <RootsFormSelectItem value="activo">Activo</RootsFormSelectItem>
          <RootsFormSelectItem value="pendiente">Pendiente</RootsFormSelectItem>
          <RootsFormSelectItem value="vencido">Vencido</RootsFormSelectItem>
        </RootsFormSelectField>
      </div>
      <div className="flex items-center px-4 py-4">
        <RootsFormField
          label="Buscar"
          htmlFor={searchId}
          className={hideLabels ? "[&_label]:sr-only" : undefined}
        >
          <div
            style={searchShellStyle}
            onMouseEnter={interactionHandlers.onMouseEnter}
            onMouseLeave={interactionHandlers.onMouseLeave}
          >
            <span className="inline-flex shrink-0 items-center text-[var(--rootsy-bruma-500)]">
              <Search className="size-4" aria-hidden />
            </span>
            <input
              id={searchId}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Título o referencia…"
              className={cn("font-canopy placeholder:text-[var(--rootsy-bruma-500)]", rootsFormControlSelectionClass)}
              style={searchInputStyle}
              onFocus={interactionHandlers.onFocus}
              onBlur={interactionHandlers.onBlur}
            />
          </div>
        </RootsFormField>
      </div>
    </div>
  )
}
