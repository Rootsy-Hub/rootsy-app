"use client"

import { formatReservationArrival } from "@/app/[siteId]/[popId]/mesas/components/MesaReservationForm"
import {
  reservationStatusBadgeClass,
  reservationTableMeta,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationUi"
import {
  mesaReservationStatusLabel,
  reservationsForHistory,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import type {
  MesaReservation,
  MesaTable,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogHeader,
  RootsDialogSingleActionFooter,
} from "@/components/rootsy-dialog"
import { RootsFormSearchField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import {
  computeDataWorkspaceDateBounds,
  RESERVATION_HISTORY_DATE_PRESETS,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservations: MesaReservation[]
  tables: MesaTable[]
  onSelectReservation: (reservation: MesaReservation) => void
}

export function MesaReservationHistoryDialog({
  open,
  onOpenChange,
  reservations,
  tables,
  onSelectReservation,
}: Props) {
  const [preset, setPreset] = useState<DataWorkspaceDatePreset>("this_month")
  const [customRange, setCustomRange] = useState<DateRange | undefined>()
  const [clientQuery, setClientQuery] = useState("")

  const bounds = useMemo(
    () => computeDataWorkspaceDateBounds(preset, customRange),
    [preset, customRange],
  )

  const rows = useMemo(
    () =>
      reservationsForHistory({
        reservations,
        from: bounds.from,
        to: bounds.to,
        clientQuery,
      }),
    [reservations, bounds.from, bounds.to, clientQuery],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" className="flex flex-col">
        <RootsDialogHeader
          open={open}
          title="Historial de reservas"
          description="Filtrá por período y cliente para ver reservas anteriores."
        />

        <RootsDialogBody className="flex min-h-0 flex-col gap-[var(--rootsy-space-300)]">
          <div className="flex shrink-0 flex-col gap-[var(--rootsy-space-200)]">
            <DataWorkspacePeriodFilter
              variant="panel"
              className="border-0 bg-transparent p-0"
              preset={preset}
              customRange={customRange}
              onPresetChange={setPreset}
              onCustomRangeChange={setCustomRange}
              bounds={bounds}
              presets={RESERVATION_HISTORY_DATE_PRESETS}
              showActiveState={false}
            />
            <RootsFormSearchField
              label="Cliente"
              value={clientQuery}
              onChange={(event) => setClientQuery(event.target.value)}
              onClear={() => setClientQuery("")}
              placeholder="Buscar por nombre…"
            />
          </div>

          {rows.length === 0 ? (
            <p className="py-[var(--rootsy-space-400)] text-center font-canopy text-sm text-[var(--rootsy-bruma-500)]">
              No hay reservas en este período
              {clientQuery.trim() ? " con ese cliente" : ""}.
            </p>
          ) : (
            <ul className="-mx-[var(--rootsy-space-400)] divide-y divide-[color-mix(in_srgb,var(--rootsy-bruma-300)_55%,transparent)]">
              {rows.map((reservation) => (
                <li key={reservation.id}>
                  <button
                    type="button"
                    onClick={() => onSelectReservation(reservation)}
                    className={cn(
                      "flex w-full flex-col gap-2 px-[var(--rootsy-space-400)] py-3 text-left transition-colors",
                      "hover:bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_35%,white)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
                          {reservation.clientName.trim() || "Sin cliente"}
                        </p>
                        <p className="mt-0.5 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                          {reservationTableMeta(
                            tables,
                            reservation.tableIds.length > 0
                              ? reservation.tableIds
                              : reservation.tableId,
                          )}
                          {" · "}
                          {formatReservationArrival(reservation.arrivalAt)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                          reservationStatusBadgeClass(reservation.status),
                        )}
                      >
                        {mesaReservationStatusLabel(reservation.status)}
                      </span>
                    </div>
                    {reservation.guestCount ? (
                      <div className="flex flex-wrap items-center gap-2 font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-3.5" aria-hidden />
                          {reservation.guestCount} comensales
                        </span>
                      </div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </RootsDialogBody>

        <RootsDialogSingleActionFooter
          label="Cerrar"
          onAction={() => onOpenChange(false)}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
