"use client"

import { MesaOpenForm } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenForm"
import { formatReservationArrival } from "@/app/[siteId]/[popId]/mesas/components/MesaReservationForm"
import type { MesaSessionFloorStatus } from "@/app/[siteId]/[popId]/mesas/mesasCheckoutState"
import type {
  MesaOpenSessionInput,
  MesaReservation,
  MesaSession,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import type { MesaReservationWarning } from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import {
  mesaOpenInitialFromReservation,
  reservationOccupiedOpenWarning,
  reservationOccupiedTablesForOpen,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import { RootsConfirmDialog } from "@/components/rootsy-dialog/RootsConfirmDialog"
import {
  mesaStatusBadgeClass,
  mesaStatusLabel,
} from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import {
  ChannelDataEmptyState,
  ChannelDataErrorBanner,
  ChannelDataField,
  ChannelDataFields,
  ChannelDataHeader,
  ChannelDataOperarFooterBar,
  ChannelDataPanel,
  ChannelDataSection,
  ChannelDataStatusBadge,
  ChannelDataWarningBanner,
} from "@/components/sale-operation/ChannelOperationDataPanel"
import { ChannelDataFormSegmentField } from "@/components/sale-operation/ChannelDataFormFields"
import { saleOpChannelStatusBadge } from "@/components/sale-operation/saleOperationStyles"
import type { ChannelCloseMode } from "@/lib/channelCheckoutClose"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronRight, Clock, Pencil, UtensilsCrossed } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Props = {
  table: MesaTable | null
  session: MesaSession | null
  floorReservation?: MesaReservation | null
  reservationWarning?: MesaReservationWarning | null
  sessionTables: MesaTable[]
  tables: MesaTable[]
  waiters: MesaWaiter[]
  mergeCandidates: MesaTable[]
  sessionError?: string | null
  onOpenSession: (input: MesaOpenSessionInput) => Promise<boolean> | boolean
  onUpdateSession: (
    sessionId: string,
    input: MesaOpenSessionInput,
  ) => Promise<boolean> | boolean
  onCloseSession: () => Promise<boolean> | boolean
  canCloseSession?: boolean
  closeSessionBlockReason?: string | null
  closeSessionMode?: ChannelCloseMode | null
  closeSessionLoading?: boolean
  clientLabel?: string | null
  onSetFloorStatus?: (
    floorStatus: MesaSessionFloorStatus,
  ) => Promise<boolean> | boolean
  floorStatusLoading?: boolean
  onOpenReservationDetail?: (reservation: MesaReservation) => void
}

function sessionTitle(table: MesaTable | null, sessionTables: MesaTable[]): string {
  if (sessionTables.length > 1) {
    return sessionTables.map((t) => t.label).join(" + ")
  }
  if (table) return table.label
  return "—"
}

export function MesaSessionPanel({
  table,
  session,
  floorReservation = null,
  reservationWarning = null,
  sessionTables,
  tables,
  waiters,
  mergeCandidates,
  sessionError,
  onOpenSession,
  onUpdateSession,
  onCloseSession,
  canCloseSession = false,
  closeSessionBlockReason = null,
  closeSessionMode = null,
  closeSessionLoading = false,
  clientLabel,
  onSetFloorStatus,
  floorStatusLoading = false,
  onOpenReservationDetail,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [closeBusy, setCloseBusy] = useState(false)
  const [floorStatusBusy, setFloorStatusBusy] = useState(false)

  useEffect(() => {
    setEditing(false)
  }, [table?.id])

  const closeDialogTitle = useMemo(() => {
    if (sessionTables.length > 1) {
      return `Mesas ${sessionTables.map((t) => t.label).join(" + ")}`
    }
    return table ? `Mesa ${table.label}` : "esta mesa"
  }, [sessionTables, table])

  const confirmCloseSession = async () => {
    if (closeBusy || !canCloseSession) return
    setCloseBusy(true)
    try {
      const ok = await onCloseSession()
      if (ok) setCloseDialogOpen(false)
    } finally {
      setCloseBusy(false)
    }
  }

  const waiter = useMemo(
    () => waiters.find((w) => w.id === session?.waiterId),
    [waiters, session?.waiterId],
  )

  const blockedMergeTables = useMemo(() => {
    if (!floorReservation || !table || table.status !== "reserved") return []
    return reservationOccupiedTablesForOpen(
      floorReservation,
      tables,
      table.id,
    )
  }, [floorReservation, table, tables])

  const blockedMergeWarning = useMemo(
    () => reservationOccupiedOpenWarning(blockedMergeTables),
    [blockedMergeTables],
  )

  const reservationWarningMessage = useMemo(() => {
    if (!reservationWarning) return null
    const client = reservationWarning.reservation.clientName.trim() || "Cliente"
    const time = formatReservationArrival(reservationWarning.reservation.arrivalAt)
    if (reservationWarning.kind === "overlap") {
      return `Hay una reserva de ${client} (${time}) y la mesa sigue abierta.`
    }
    return `Reserva de ${client} a las ${time.split(" · ").pop()} — entra en ventana en ${reservationWarning.minutesUntilBuffer} min.`
  }, [reservationWarning])

  if (!table) {
    return (
      <ChannelDataEmptyState
        icon={UtensilsCrossed}
        title="Seleccioná una mesa"
      />
    )
  }

  const isOpen =
    session != null && table.status !== "free" && table.status !== "reserved"
  const isReserved = table.status === "reserved"
  const isPaying = table.status === "paying"
  const title = sessionTitle(table, sessionTables)
  const closeButtonLabel = "Liberar mesa"

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {isOpen && !editing ? (
        <>
          <ChannelDataPanel className="flex-1">
            {sessionError ? (
              <ChannelDataErrorBanner>{sessionError}</ChannelDataErrorBanner>
            ) : null}

            {reservationWarningMessage ? (
              <ChannelDataWarningBanner>{reservationWarningMessage}</ChannelDataWarningBanner>
            ) : null}

            <ChannelDataSection>
              <ChannelDataHeader
                title={title}
                meta={
                  session ? (
                    <>
                      <Clock
                        className="mr-0.5 inline size-3 -translate-y-px"
                        aria-hidden
                      />
                      {formatDistanceToNow(new Date(session.openedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </>
                  ) : undefined
                }
                badge={
                  <ChannelDataStatusBadge
                    className={mesaStatusBadgeClass(table.status)}
                  >
                    {isPaying
                      ? "Cobrando"
                      : sessionTables.length > 1
                        ? "Mesas unidas"
                        : "Abierta"}
                  </ChannelDataStatusBadge>
                }
                actions={
                  <DataWorkspaceTableIconAction
                    label="Editar mesa"
                    icon={Pencil}
                    variant="edit"
                    onClick={() => setEditing(true)}
                  />
                }
              />

              <ChannelDataFields>
                <ChannelDataField label="Mozo">{waiter?.name ?? "—"}</ChannelDataField>
                <ChannelDataField label="Cliente">
                  {clientLabel?.trim() || "Sin asignar"}
                </ChannelDataField>
                <ChannelDataField label="Comensales">
                  {session?.guestCount ?? "Sin indicar"}
                </ChannelDataField>
                {sessionTables.length > 1 ? (
                  <ChannelDataField label="Mesas incluidas">
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {sessionTables.map((t) => (
                        <span key={t.id} className={saleOpChannelStatusBadge}>
                          {t.label}
                        </span>
                      ))}
                    </span>
                  </ChannelDataField>
                ) : null}
                {session?.note ? (
                  <ChannelDataField label="Notas">{session.note}</ChannelDataField>
                ) : null}
              </ChannelDataFields>

              {onSetFloorStatus ? (
                <div className="mt-4">
                  <ChannelDataFormSegmentField
                    label="Estado en plano"
                    value={isPaying ? "paying" : "open"}
                    disabled={floorStatusBusy || floorStatusLoading}
                    onValueChange={(value) => {
                      if (floorStatusBusy || floorStatusLoading || !onSetFloorStatus) return
                      setFloorStatusBusy(true)
                      void (async () => {
                        try {
                          await onSetFloorStatus(
                            value === "paying" ? "paying" : "open",
                          )
                        } finally {
                          setFloorStatusBusy(false)
                        }
                      })()
                    }}
                    options={[
                      { value: "open", label: "Abierta" },
                      { value: "paying", label: "Cobrando" },
                    ]}
                  />
                </div>
              ) : null}
            </ChannelDataSection>

            {!canCloseSession && closeSessionBlockReason ? (
              <ChannelDataWarningBanner>{closeSessionBlockReason}</ChannelDataWarningBanner>
            ) : null}
          </ChannelDataPanel>

          <ChannelDataOperarFooterBar
            actions={[
              {
                variant: "primary",
                label: closeSessionLoading ? "Liberando…" : closeButtonLabel,
                disabled: !canCloseSession || closeSessionLoading,
                loading: closeSessionLoading,
                loadingLabel: "Liberando…",
                title: closeSessionBlockReason ?? undefined,
                onClick: () => setCloseDialogOpen(true),
              },
            ]}
          />
        </>
      ) : null}

      <RootsConfirmDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        title="¿Liberar mesa?"
        description={
          <>
            {closeSessionMode === "release"
              ? "No hay ítems ni cobros pendientes. La mesa quedará libre."
              : "El pedido está completamente cobrado. La mesa quedará libre."}{" "}
            Vas a cerrar {closeDialogTitle}.
          </>
        }
        confirmLabel="Liberar mesa"
        busy={closeBusy || closeSessionLoading}
        busyConfirmLabel="Liberando…"
        onConfirm={() => void confirmCloseSession()}
      />

      {!isOpen ? (
        <>
          <div className="shrink-0 px-3 pt-3 sm:px-3.5">
            {sessionError ? (
              <div className="mb-3">
                <ChannelDataErrorBanner>{sessionError}</ChannelDataErrorBanner>
              </div>
            ) : null}
            <ChannelDataSection>
              <ChannelDataHeader
                title={title}
                meta={
                  isReserved && floorReservation
                    ? `${floorReservation.clientName.trim() || "Sin cliente"} · ${formatReservationArrival(floorReservation.arrivalAt)}`
                    : undefined
                }
                badge={
                  <ChannelDataStatusBadge
                    className={mesaStatusBadgeClass(table.status)}
                  >
                    {mesaStatusLabel(table.status)}
                  </ChannelDataStatusBadge>
                }
                actions={
                  isReserved && floorReservation && onOpenReservationDetail ? (
                    <DataWorkspaceTableIconAction
                      label="Ver reserva"
                      icon={ChevronRight}
                      variant="neutral"
                      onClick={() => onOpenReservationDetail(floorReservation)}
                    />
                  ) : undefined
                }
              />
            </ChannelDataSection>
          </div>

          <MesaOpenForm
            primaryTable={table}
            mergeCandidates={mergeCandidates}
            blockedMergeTables={blockedMergeTables}
            blockedMergeWarning={blockedMergeWarning}
            waiters={waiters}
            initial={
              floorReservation
                ? mesaOpenInitialFromReservation(
                    floorReservation,
                    table.id,
                    tables,
                  )
                : undefined
            }
            submitLabel={isReserved ? "Sentar / abrir" : "Abrir mesa"}
            onSubmit={async (input) => {
              await onOpenSession(input)
            }}
          />
        </>
      ) : null}

      {isOpen && editing && session ? (
        <MesaOpenForm
          primaryTable={table}
          mergeCandidates={mergeCandidates}
          waiters={waiters}
          initial={{
            tableIds: session.tableIds,
            waiterId: session.waiterId,
            guestCount: session.guestCount,
            note: session.note,
          }}
          submitLabel="Guardar cambios"
          onSubmit={async (input) => {
            const ok = await onUpdateSession(session.id, input)
            if (ok) setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : null}
    </div>
  )
}
