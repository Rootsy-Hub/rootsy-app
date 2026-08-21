"use client"

import { MesaOpenForm } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenForm"
import { MesaReservationHistoryDialog } from "@/app/[siteId]/[popId]/mesas/components/MesaReservationHistoryDialog"
import {
  formatReservationArrival,
  MesaReservationForm,
  MESA_RESERVATION_UNASSIGNED_TABLE,
} from "@/app/[siteId]/[popId]/mesas/components/MesaReservationForm"
import {
  describeReservationFloorWindow,
  isMesaOccupiedNow,
  mesaOpenInitialFromReservation,
  mesaReservationStatusLabel,
  reservationOccupiedOpenWarning,
  reservationOccupiedTablesForOpen,
  reservationTableIds,
  type MesasReservationSettings,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import {
  reservationStatusBadgeClass,
  reservationTableMeta,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationUi"
import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesaReservationInput,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
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
  ChannelDataWarningBanner,
} from "@/components/sale-operation/ChannelOperationDataPanel"
import {
  ChannelDataFormSelectField,
  ChannelDataFormSelectItem,
} from "@/components/sale-operation/ChannelDataFormFields"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, CalendarDays, Clock3, Pencil, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type AgendaView = "list" | "create" | "detail" | "edit" | "checkin"

type Props = {
  agenda: MesaReservation[]
  reservations: MesaReservation[]
  tables: MesaTable[]
  popId: string
  canReadClients: boolean
  canCreateClient?: boolean
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
  openReservationId?: string | null
}

function agendaTimeLabel(iso: string): string {
  return format(new Date(iso), "HH:mm", { locale: es })
}

function isReservationEditable(status: MesaReservation["status"]): boolean {
  return status === "pending" || status === "confirmed"
}

export function MesaAgendaPanel({
  agenda,
  reservations,
  tables,
  popId,
  canReadClients,
  canCreateClient = false,
  reservationSettings,
  onSaveReservationSettings,
  waiters,
  sessionError,
  onSaveReservation,
  onCancelReservation,
  onMarkReservationNoShow,
  onCheckInReservation,
  onSelectReservation,
  openReservationId = null,
}: Props) {
  const [view, setView] = useState<AgendaView>(
    openReservationId ? "detail" : "list",
  )
  const [selectedId, setSelectedId] = useState<string | null>(openReservationId)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [confirmNoShowOpen, setConfirmNoShowOpen] = useState(false)
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
    () => reservations.find((r) => r.id === selectedId) ?? null,
    [reservations, selectedId],
  )

  const reservedTableIds = useMemo(
    () =>
      selectedReservation ? reservationTableIds(selectedReservation) : [],
    [selectedReservation],
  )

  const checkInTable = useMemo(() => {
    for (const tableId of reservedTableIds) {
      const table = tables.find((item) => item.id === tableId)
      if (table && !isMesaOccupiedNow(table.status)) return table
    }
    return null
  }, [reservedTableIds, tables])

  const assignedTablesOccupied =
    reservedTableIds.length > 0 && checkInTable == null

  const checkInPrimaryTable = useMemo(() => {
    if (checkInTable) return checkInTable
    if (checkInTablePick === MESA_RESERVATION_UNASSIGNED_TABLE) return null
    const picked = tables.find((t) => t.id === checkInTablePick) ?? null
    if (!picked || isMesaOccupiedNow(picked.status)) return null
    return picked
  }, [checkInTable, checkInTablePick, tables])

  useEffect(() => {
    if (selectedId && !reservations.some((r) => r.id === selectedId)) {
      setSelectedId(null)
      setView("list")
    }
  }, [reservations, selectedId])

  useEffect(() => {
    if (!openReservationId) return
    setSelectedId(openReservationId)
    setView("detail")
  }, [openReservationId])

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
        setConfirmCancelOpen(false)
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
      if (ok) {
        setConfirmNoShowOpen(false)
        setView("detail")
      }
    } finally {
      setBusy(false)
    }
  }

  const goBackToList = () => {
    setConfirmCancelOpen(false)
    setConfirmNoShowOpen(false)
    setSelectedId(null)
    setView("list")
  }

  if (view === "create") {
    return (
      <MesaReservationForm
        tables={reservationTables}
        popId={popId}
        canReadClients={canReadClients}
        canCreateClient={canCreateClient}
        reservationSettings={reservationSettings}
        reservations={reservations}
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
        canCreateClient={canCreateClient}
        reservationSettings={reservationSettings}
        reservations={reservations}
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
    if (assignedTablesOccupied) {
      const occupiedLabels = reservedTableIds
        .map((id) => tables.find((table) => table.id === id)?.label)
        .filter((label): label is string => Boolean(label))
        .join(", ")
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChannelDataPanel className="flex-1">
            <ChannelDataWarningBanner>
              {occupiedLabels
                ? `Las mesas ${occupiedLabels} están ocupadas. Liberá una para sentar esta reserva.`
                : "Las mesas de esta reserva están ocupadas. Liberá una para sentar."}
            </ChannelDataWarningBanner>
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

    if (!checkInPrimaryTable) {
      const freeTables = reservationTables.filter(
        (table) => table.status === "free",
      )
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChannelDataPanel className="flex-1">
            {freeTables.length === 0 ? (
              <ChannelDataWarningBanner>
                No hay mesas libres para sentar esta reserva.
              </ChannelDataWarningBanner>
            ) : (
              <ChannelDataFormSelectField
                label="Mesa para sentar"
                id="mesa-checkin-table-pick"
                value={checkInTablePick}
                onValueChange={setCheckInTablePick}
                placeholder="Elegí una mesa"
                labelInfo="Esta reserva no tiene mesa asignada. Elegí una mesa libre."
              >
                {freeTables.map((table) => (
                  <ChannelDataFormSelectItem key={table.id} value={table.id}>
                    Mesa {table.label}
                  </ChannelDataFormSelectItem>
                ))}
              </ChannelDataFormSelectField>
            )}
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

    const reservedIds = reservationTableIds(selectedReservation)
    const mergeCandidates = reservationTables.filter(
      (table) =>
        table.salonId === checkInPrimaryTable.salonId &&
        table.id !== checkInPrimaryTable.id &&
        (table.status === "free" || reservedIds.includes(table.id)) &&
        !isMesaOccupiedNow(table.status),
    )
    const blockedMergeTables = reservationOccupiedTablesForOpen(
      selectedReservation,
      tables,
      checkInPrimaryTable.id,
    )

    return (
      <MesaOpenForm
        primaryTable={checkInPrimaryTable}
        mergeCandidates={mergeCandidates}
        blockedMergeTables={blockedMergeTables}
        blockedMergeWarning={reservationOccupiedOpenWarning(blockedMergeTables)}
        waiters={waiters}
        initial={mesaOpenInitialFromReservation(
          selectedReservation,
          checkInPrimaryTable.id,
          tables,
        )}
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
          if (reservationTableIds(selectedReservation).length > 0) {
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
      {
        hasAssignedTable: reservationTableIds(selectedReservation).length > 0,
        tableCount: reservationTableIds(selectedReservation).length,
      },
    )

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChannelDataPanel className="flex-1">
          <button
            type="button"
            disabled={busy}
            onClick={goBackToList}
            className={cn(
              "inline-flex w-fit items-center gap-1 self-start",
              "font-canopy text-xs font-medium text-[var(--rootsy-bruma-500)]",
              "transition-colors hover:text-[var(--rootsy-bruma-700)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_45%,transparent)]",
              "disabled:pointer-events-none disabled:opacity-45",
            )}
          >
            <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
            Volver
          </button>

          {sessionError ? (
            <ChannelDataErrorBanner>{sessionError}</ChannelDataErrorBanner>
          ) : null}

          <ChannelDataSection>
            <ChannelDataHeader
              title={selectedReservation.clientName.trim() || "Sin cliente"}
              meta={
                <>
                  {reservationTableMeta(tables, reservationTableIds(selectedReservation))}
                  {" · "}
                  {formatReservationArrival(selectedReservation.arrivalAt)}
                </>
              }
              badge={
                <ChannelDataStatusBadge
                  className={reservationStatusBadgeClass(
                    selectedReservation.status,
                  )}
                >
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
              <ChannelDataField
                label={
                  reservationTableIds(selectedReservation).length > 1
                    ? "Mesas"
                    : "Mesa"
                }
              >
                {reservationTableMeta(
                  tables,
                  reservationTableIds(selectedReservation),
                )}
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

            <ChannelDataHint icon={Clock3} className="mt-5">
              {floorWindow.summary}
            </ChannelDataHint>
          </ChannelDataSection>
        </ChannelDataPanel>

        <ChannelDataOperarFooterBar
          actions={
            editable
              ? [
                  {
                    variant: "secondary",
                    label: "No vino",
                    disabled: busy,
                    onClick: () => setConfirmNoShowOpen(true),
                  },
                  {
                    variant: "destructive",
                    label: "Cancelar",
                    disabled: busy,
                    onClick: () => setConfirmCancelOpen(true),
                  },
                  {
                    variant: "primary",
                    label: "Sentar / abrir",
                    disabled: busy,
                    onClick: () => setView("checkin"),
                  },
                ]
              : []
          }
        />

        <RootsConfirmDialog
          open={confirmNoShowOpen}
          onOpenChange={setConfirmNoShowOpen}
          title="¿El cliente no vino?"
          description={
            selectedReservation.clientName.trim()
              ? `Vas a marcar la reserva de ${selectedReservation.clientName.trim()} como no vino.`
              : "Vas a marcar esta reserva como no vino."
          }
          confirmLabel="No vino"
          cancelLabel="Volver"
          busy={busy}
          busyConfirmLabel="Marcando…"
          onConfirm={() => void markNoShow()}
        />

        <RootsConfirmDialog
          open={confirmCancelOpen}
          onOpenChange={setConfirmCancelOpen}
          title="¿Cancelar la reserva?"
          description={
            selectedReservation.clientName.trim()
              ? `La reserva de ${selectedReservation.clientName.trim()} se cancela.`
              : "Esta reserva se cancela."
          }
          confirmLabel="Cancelar reserva"
          cancelLabel="Volver"
          destructive
          busy={busy}
          busyConfirmLabel="Cancelando…"
          onConfirm={() => void cancelReservation()}
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
                        {reservationTableMeta(tables, reservationTableIds(reservation))}
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
            variant: "secondary",
            label: "Ver historial",
            onClick: () => setHistoryOpen(true),
          },
          {
            variant: "primary",
            label: "Nueva reserva",
            onClick: () => setView("create"),
          },
        ]}
      />

      <MesaReservationHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        reservations={reservations}
        tables={tables}
        onSelectReservation={(reservation) => {
          setHistoryOpen(false)
          openDetail(reservation)
        }}
      />
    </div>
  )
}
