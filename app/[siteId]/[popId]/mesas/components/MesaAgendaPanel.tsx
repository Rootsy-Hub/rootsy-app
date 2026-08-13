"use client"

import { MesaOpenForm } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenForm"
import {
  formatReservationArrival,
  MesaReservationForm,
  MESA_RESERVATION_UNASSIGNED_TABLE,
} from "@/app/[siteId]/[popId]/mesas/components/MesaReservationForm"
import {
  describeReservationFloorWindow,
  mesaReservationStatusLabel,
  type MesasReservationSettings,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesaReservationInput,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  ChannelDataEmptyState,
  ChannelDataErrorBanner,
  ChannelDataField,
  ChannelDataFields,
  ChannelDataHeader,
  ChannelDataHint,
  ChannelDataOperarFooterBar,
  ChannelDataPanel,
  ChannelDataSection,
  ChannelDataStatusBadge,
} from "@/components/sale-operation/ChannelOperationDataPanel"
import {
  ChannelDataFormSelectField,
  ChannelDataFormSelectItem,
} from "@/components/sale-operation/ChannelDataFormFields"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarDays, Clock3, Pencil, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type AgendaView = "list" | "create" | "detail" | "edit" | "checkin"

type Props = {
  agenda: MesaReservation[]
  tables: MesaTable[]
  popId: string
  canReadClients: boolean
  reservationSettings: MesasReservationSettings
  onSaveReservationSettings?: (
    settings: MesasReservationSettings,
  ) => Promise<boolean> | boolean
  waiters: MesaWaiter[]
  sessionError?: string | null
  onSaveReservation: (input: MesaReservationInput) => Promise<boolean> | boolean
  onCancelReservation: (reservationId: string) => Promise<boolean> | boolean
  onMarkReservationNoShow: (reservationId: string) => Promise<boolean> | boolean
  onCheckInReservation: (
    reservation: MesaReservation,
    input: MesaOpenSessionInput,
  ) => Promise<boolean> | boolean
  onSelectReservation?: (reservation: MesaReservation) => void
}

function tableLabel(tables: MesaTable[], tableId: string | null): string {
  if (!tableId) return "Sin mesa asignada"
  return tables.find((t) => t.id === tableId)?.label ?? "—"
}

function reservationTableMeta(tables: MesaTable[], tableId: string | null): string {
  if (!tableId) return tableLabel(tables, tableId)
  return `Mesa ${tableLabel(tables, tableId)}`
}

function agendaTimeLabel(iso: string): string {
  return format(new Date(iso), "HH:mm", { locale: es })
}

function statusBadgeClass(status: MesaReservation["status"]): string {
  switch (status) {
    case "pending":
      return "bg-[color-mix(in_srgb,#fef3c7_72%,white)] text-[#92400e] ring-[color-mix(in_srgb,#f59e0b_35%,transparent)]"
    case "confirmed":
      return "bg-[color-mix(in_srgb,#ede9fe_72%,white)] text-[#5b21b6] ring-[color-mix(in_srgb,#7c3aed_35%,transparent)]"
    case "seated":
      return "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,var(--rootsy-bruma-100))] text-[var(--rootsy-savia-800)] ring-[color-mix(in_srgb,var(--rootsy-savia-500)_28%,transparent)]"
    case "no_show":
      return "bg-[color-mix(in_srgb,#fee2e2_72%,white)] text-[#991b1b] ring-[color-mix(in_srgb,#ef4444_35%,transparent)]"
    default:
      return ""
  }
}

function isReservationEditable(status: MesaReservation["status"]): boolean {
  return status === "pending" || status === "confirmed"
}

export function MesaAgendaPanel({
  agenda,
  tables,
  popId,
  canReadClients,
  reservationSettings,
  onSaveReservationSettings,
  waiters,
  sessionError,
  onSaveReservation,
  onCancelReservation,
  onMarkReservationNoShow,
  onCheckInReservation,
  onSelectReservation,
}: Props) {
  const [view, setView] = useState<AgendaView>("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [checkInTablePick, setCheckInTablePick] = useState(
    MESA_RESERVATION_UNASSIGNED_TABLE,
  )

  const reservationTables = useMemo(
    () =>
      [...tables].sort((a, b) =>
        `${a.salonId}:${a.label}`.localeCompare(`${b.salonId}:${b.label}`, "es"),
      ),
    [tables],
  )

  const selectedReservation = useMemo(
    () => agenda.find((r) => r.id === selectedId) ?? null,
    [agenda, selectedId],
  )

  const checkInTable = useMemo(() => {
    if (!selectedReservation?.tableId) return null
    return tables.find((t) => t.id === selectedReservation.tableId) ?? null
  }, [selectedReservation, tables])

  const checkInPrimaryTable = useMemo(() => {
    if (checkInTable) return checkInTable
    if (checkInTablePick === MESA_RESERVATION_UNASSIGNED_TABLE) return null
    return tables.find((t) => t.id === checkInTablePick) ?? null
  }, [checkInTable, checkInTablePick, tables])

  useEffect(() => {
    if (selectedId && !agenda.some((r) => r.id === selectedId)) {
      setSelectedId(null)
      setView("list")
    }
  }, [agenda, selectedId])

  const openDetail = (reservation: MesaReservation) => {
    onSelectReservation?.(reservation)
    setSelectedId(reservation.id)
    setView("detail")
  }

  const cancelReservation = async () => {
    if (!selectedReservation || busy) return
    setBusy(true)
    try {
      const ok = await onCancelReservation(selectedReservation.id)
      if (ok) {
        setSelectedId(null)
        setView("list")
      }
    } finally {
      setBusy(false)
    }
  }

  const markNoShow = async () => {
    if (!selectedReservation || busy) return
    setBusy(true)
    try {
      const ok = await onMarkReservationNoShow(selectedReservation.id)
      if (ok) setView("detail")
    } finally {
      setBusy(false)
    }
  }

  if (view === "create") {
    return (
      <MesaReservationForm
        tables={reservationTables}
        popId={popId}
        canReadClients={canReadClients}
        reservationSettings={reservationSettings}
        onSaveReservationSettings={onSaveReservationSettings}
        submitLabel="Crear reserva"
        onSubmit={async (input) => {
          const ok = await onSaveReservation(input)
          if (ok) setView("list")
        }}
        onCancel={() => setView("list")}
      />
    )
  }

  if (view === "edit" && selectedReservation) {
    return (
      <MesaReservationForm
        tables={reservationTables}
        popId={popId}
        canReadClients={canReadClients}
        reservationSettings={reservationSettings}
        onSaveReservationSettings={onSaveReservationSettings}
        initial={selectedReservation}
        submitLabel="Guardar cambios"
        onSubmit={async (input) => {
          const ok = await onSaveReservation({
            ...input,
            reservationId: selectedReservation.id,
          })
          if (ok) setView("detail")
        }}
        onCancel={() => setView("detail")}
      />
    )
  }

  if (view === "checkin" && selectedReservation) {
    if (!checkInPrimaryTable) {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChannelDataPanel className="flex-1">
            <ChannelDataFormSelectField
              label="Mesa para sentar"
              id="mesa-checkin-table-pick"
              value={checkInTablePick}
              onValueChange={setCheckInTablePick}
              placeholder="Elegí una mesa"
              labelInfo="Esta reserva no tiene mesa asignada. Elegí dónde sentar al cliente."
            >
              {reservationTables.map((table) => (
                <ChannelDataFormSelectItem key={table.id} value={table.id}>
                  Mesa {table.label}
                </ChannelDataFormSelectItem>
              ))}
            </ChannelDataFormSelectField>
          </ChannelDataPanel>

          <ChannelDataOperarFooterBar
            actions={[
              {
                variant: "secondary",
                label: "Volver",
                onClick: () => setView("detail"),
              },
            ]}
          />
        </div>
      )
    }

    return (
      <MesaOpenForm
        primaryTable={checkInPrimaryTable}
        mergeCandidates={[]}
        waiters={waiters}
        initial={{
          tableIds: [checkInPrimaryTable.id],
          guestCount: selectedReservation.guestCount,
        }}
        submitLabel="Sentar / abrir"
        onSubmit={async (input) => {
          const ok = await onCheckInReservation(selectedReservation, input)
          if (ok) {
            setSelectedId(null)
            setView("list")
            setCheckInTablePick(MESA_RESERVATION_UNASSIGNED_TABLE)
          }
        }}
        onCancel={() => {
          if (selectedReservation.tableId) {
            setView("detail")
            return
          }
          setCheckInTablePick(MESA_RESERVATION_UNASSIGNED_TABLE)
          setView("detail")
        }}
      />
    )
  }

  if (view === "detail" && selectedReservation) {
    const editable = isReservationEditable(selectedReservation.status)
    const floorWindow = describeReservationFloorWindow(
      selectedReservation.arrivalAt,
      reservationSettings,
      { hasAssignedTable: selectedReservation.tableId != null },
    )

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChannelDataPanel className="flex-1">
          {sessionError ? (
            <ChannelDataErrorBanner>{sessionError}</ChannelDataErrorBanner>
          ) : null}

          <ChannelDataSection>
            <ChannelDataHeader
              title={selectedReservation.clientName.trim() || "Sin cliente"}
              meta={
                <>
                  {reservationTableMeta(tables, selectedReservation.tableId)}
                  {" · "}
                  {formatReservationArrival(selectedReservation.arrivalAt)}
                </>
              }
              badge={
                <ChannelDataStatusBadge>
                  {mesaReservationStatusLabel(selectedReservation.status)}
                </ChannelDataStatusBadge>
              }
              actions={
                editable ? (
                  <DataWorkspaceTableIconAction
                    label="Editar reserva"
                    icon={Pencil}
                    variant="edit"
                    onClick={() => setView("edit")}
                  />
                ) : undefined
              }
            />

            <ChannelDataFields>
              <ChannelDataField label="Mesa">
                {reservationTableMeta(tables, selectedReservation.tableId)}
              </ChannelDataField>
              <ChannelDataField label="Llegada">
                {formatReservationArrival(selectedReservation.arrivalAt)}
              </ChannelDataField>
              {selectedReservation.guestCount ? (
                <ChannelDataField label="Comensales">
                  {selectedReservation.guestCount}
                </ChannelDataField>
              ) : null}
              {selectedReservation.note ? (
                <ChannelDataField label="Notas">
                  {selectedReservation.note}
                </ChannelDataField>
              ) : null}
            </ChannelDataFields>

            <ChannelDataHint icon={Clock3}>{floorWindow.summary}</ChannelDataHint>
          </ChannelDataSection>
        </ChannelDataPanel>

        <ChannelDataOperarFooterBar
          actions={[
            {
              variant: "secondary",
              label: "Volver",
              disabled: busy,
              onClick: () => {
                setSelectedId(null)
                setView("list")
              },
            },
            ...(editable
              ? [
                  {
                    variant: "secondary" as const,
                    label: busy ? "Marcando…" : "No-show",
                    disabled: busy,
                    loading: busy,
                    loadingLabel: "Marcando…",
                    onClick: () => void markNoShow(),
                  },
                  {
                    variant: "secondary" as const,
                    label: busy ? "Cancelando…" : "Cancelar",
                    disabled: busy,
                    loading: busy,
                    loadingLabel: "Cancelando…",
                    onClick: () => void cancelReservation(),
                  },
                  {
                    variant: "primary" as const,
                    label: "Sentar / abrir",
                    disabled: busy,
                    onClick: () => setView("checkin"),
                  },
                ]
              : []),
          ]}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {agenda.length === 0 ? (
        <ChannelDataEmptyState icon={CalendarDays} title="Sin reservas hoy" />
      ) : (
        <ChannelDataPanel className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-[color-mix(in_srgb,var(--rootsy-bruma-300)_55%,transparent)]">
            {agenda.map((reservation) => (
              <li key={reservation.id}>
                <button
                  type="button"
                  onClick={() => openDetail(reservation)}
                  className={cn(
                    "flex w-full flex-col gap-2 px-3 py-3 text-left transition-colors sm:px-3.5",
                    "hover:bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_35%,white)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {reservation.clientName.trim() || "Sin cliente"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {reservationTableMeta(tables, reservation.tableId)}
                        {" · "}
                        {formatReservationArrival(reservation.arrivalAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                        statusBadgeClass(reservation.status),
                      )}
                    >
                      {mesaReservationStatusLabel(reservation.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--rootsy-bruma-700)]">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {agendaTimeLabel(reservation.arrivalAt)}
                    </span>
                    {reservation.guestCount ? (
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden />
                        {reservation.guestCount} comensales
                      </span>
                    ) : null}
                    {reservation.note ? (
                      <span className="truncate italic">{reservation.note}</span>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </ChannelDataPanel>
      )}

      <ChannelDataOperarFooterBar
        actions={[
          {
            variant: "primary",
            label: "Nueva reserva",
            onClick: () => setView("create"),
          },
        ]}
      />
    </div>
  )
}
