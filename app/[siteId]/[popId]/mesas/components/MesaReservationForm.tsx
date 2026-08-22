"use client"

import type {
  MesaReservation,
  MesaReservationInput,
  MesaTable,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  describeReservationFloorWindow,
  findReservationTableConflict,
  mesasReservationSettingsFromDraft,
  reservationTableIds,
  type MesasReservationSettings,
} from "@/app/[siteId]/[popId]/mesas/mesasReservationLogic"
import { mesaSeatsLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { ChannelDataPanel } from "@/components/sale-operation/ChannelOperationDataPanel"
import { ChannelDataFormActionsBar } from "@/components/sale-operation/ChannelOperationDataPanel"
import { ChannelDataHint, ChannelDataWarningBanner } from "@/components/sale-operation/ChannelOperationDataPanel"
import { saleOpChannelPanelSection } from "@/components/sale-operation/saleOperationStyles"
import {
  ChannelDataFormCheckboxOption,
  ChannelDataFormDateField,
  ChannelDataFormGrid,
  ChannelDataFormIntegerField,
  ChannelDataFormPartyField,
  ChannelDataFormQuantityField,
  ChannelDataFormSection,
  ChannelDataFormSelectField,
  ChannelDataFormSelectItem,
  ChannelDataFormTextField,
  ChannelDataFormTextareaField,
} from "@/components/sale-operation/ChannelDataFormFields"
import { OperationPartyPickerDialog } from "@/components/checkout/OperationPartyPickerDialog"
import { rootsFormColumnClass, rootsFormTwoColRowClass } from "@/components/rootsy-form"
import type {
  OperationPartyManualConfirmOptions,
  OperationPartyManualConfirmPayload,
} from "@/lib/operationPartyPicker"
import { buildOperationPartyManualSelection } from "@/lib/operationPartyPicker"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { OperationPartySelection } from "@/lib/operationPartyPicker"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarClock, ChevronDown, Clock3, Link2, Settings2, UserRound } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

/** Valor del select cuando la reserva no tiene mesa asignada todavía. */
export const MESA_RESERVATION_UNASSIGNED_TABLE = "__unassigned__"

function defaultArrivalParts(): { date: string; time: string } {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  const minutes = now.getMinutes()
  now.setMinutes(minutes - (minutes % 15))
  return {
    date: format(now, "yyyy-MM-dd"),
    time: format(now, "HH:mm"),
  }
}

function combineLocalDateTime(date: string, time: string): string | null {
  if (!date || !time) return null
  const [year, month, day] = date.split("-").map(Number)
  const [hours, minutes] = time.split(":").map(Number)
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null
  }
  const local = new Date(year, month - 1, day, hours, minutes, 0, 0)
  if (Number.isNaN(local.getTime())) return null
  return local.toISOString()
}

function splitArrivalAt(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: format(d, "yyyy-MM-dd"),
    time: format(d, "HH:mm"),
  }
}

type Props = {
  tables: MesaTable[]
  defaultTableId?: string | null
  popId: string
  canReadClients: boolean
  canCreateClient?: boolean
  reservationSettings: MesasReservationSettings
  reservations?: MesaReservation[]
  onSaveReservationSettings?: (
    settings: MesasReservationSettings,
  ) => Promise<boolean> | boolean
  initial?: MesaReservation | null
  submitLabel?: string
  onSubmit: (input: MesaReservationInput) => void | Promise<void>
  onCancel?: () => void
}

export function MesaReservationForm({
  tables,
  defaultTableId = null,
  popId,
  canReadClients,
  canCreateClient = false,
  reservationSettings,
  reservations = [],
  onSaveReservationSettings,
  initial = null,
  submitLabel = "Guardar reserva",
  onSubmit,
  onCancel,
}: Props) {
  const arrivalDefaults = useMemo(
    () =>
      initial?.arrivalAt
        ? splitArrivalAt(initial.arrivalAt)
        : defaultArrivalParts(),
    [initial?.arrivalAt],
  )
  const minArrivalDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), [])
  const isCreating = initial == null

  const [tableId, setTableId] = useState(() => {
    const assigned =
      reservationTableIds(initial ?? { tableId: defaultTableId ?? null, tableIds: [] })[0] ??
      defaultTableId
    return assigned ?? MESA_RESERVATION_UNASSIGNED_TABLE
  })
  const [mergedIds, setMergedIds] = useState<string[]>(() => {
    const ids = reservationTableIds(
      initial ?? { tableId: defaultTableId ?? null, tableIds: [] },
    )
    const primary = ids[0] ?? defaultTableId
    return ids.filter((id) => id !== primary)
  })
  const [client, setClient] = useState<OperationPartySelection | null>(() =>
    initial
      ? {
          id: initial.clientId,
          manual: initial.clientId == null,
          name: initial.clientName,
          taxId: null,
          ivaCondition: null,
          defaultInvoiceTypeLabel: null,
        }
      : null,
  )
  const [manualName, setManualName] = useState(initial?.clientName ?? "")
  const [manualTaxId, setManualTaxId] = useState("")
  const [manualEmail, setManualEmail] = useState("")
  const [manualIvaCondition, setManualIvaCondition] = useState("")
  const [arrivalDate, setArrivalDate] = useState(arrivalDefaults.date)
  const [arrivalTime, setArrivalTime] = useState(arrivalDefaults.time)
  const [note, setNote] = useState(initial?.note ?? "")
  const [guestCountRaw, setGuestCountRaw] = useState(
    initial?.guestCount != null ? String(initial.guestCount) : "",
  )
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [localSettingsOpen, setLocalSettingsOpen] = useState(false)
  const [floorBufferRaw, setFloorBufferRaw] = useState(() =>
    String(reservationSettings.floorBufferMinutes),
  )
  const [graceMinutesRaw, setGraceMinutesRaw] = useState(() =>
    String(reservationSettings.graceMinutes),
  )

  useEffect(() => {
    setFloorBufferRaw(String(reservationSettings.floorBufferMinutes))
    setGraceMinutesRaw(String(reservationSettings.graceMinutes))
  }, [
    reservationSettings.floorBufferMinutes,
    reservationSettings.graceMinutes,
  ])

  const draftSettings = useMemo(
    () =>
      mesasReservationSettingsFromDraft({
        floorBufferMinutes: floorBufferRaw,
        graceMinutes: graceMinutesRaw,
      }),
    [floorBufferRaw, graceMinutesRaw],
  )

  const activeSettings = localSettingsOpen ? draftSettings : reservationSettings

  const floorWindow = useMemo(() => {
    const arrivalAt = combineLocalDateTime(arrivalDate, arrivalTime)
    if (!arrivalAt) return null
    const hasAssignedTable = tableId !== MESA_RESERVATION_UNASSIGNED_TABLE
    return describeReservationFloorWindow(arrivalAt, activeSettings, {
      hasAssignedTable,
      tableCount: hasAssignedTable ? 1 + mergedIds.length : 0,
    })
  }, [arrivalDate, arrivalTime, activeSettings, tableId, mergedIds.length])

  const resolvedTableId =
    tableId === MESA_RESERVATION_UNASSIGNED_TABLE ? null : tableId
  const resolvedTableIds = resolvedTableId
    ? [resolvedTableId, ...mergedIds.filter((id) => id !== resolvedTableId)]
    : []

  const primaryTable = useMemo(
    () => tables.find((table) => table.id === resolvedTableId) ?? null,
    [tables, resolvedTableId],
  )

  const mergeCandidates = useMemo(() => {
    if (!primaryTable) return []
    return tables.filter(
      (table) =>
        table.salonId === primaryTable.salonId &&
        table.id !== primaryTable.id,
    )
  }, [tables, primaryTable])

  const setPrimaryTable = (nextId: string) => {
    setTableId(nextId)
    if (nextId === MESA_RESERVATION_UNASSIGNED_TABLE) {
      setMergedIds([])
      return
    }
    const nextPrimary = tables.find((table) => table.id === nextId)
    setMergedIds((prev) =>
      prev.filter((id) => {
        const table = tables.find((item) => item.id === id)
        return (
          table != null &&
          table.id !== nextId &&
          table.salonId === nextPrimary?.salonId
        )
      }),
    )
  }

  const toggleMerge = (id: string) => {
    setMergedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const settingsChanged =
    draftSettings.floorBufferMinutes !==
      reservationSettings.floorBufferMinutes ||
    draftSettings.graceMinutes !== reservationSettings.graceMinutes

  const clientLabel = client?.name?.trim() || manualName.trim()
  const arrivalAt = combineLocalDateTime(arrivalDate, arrivalTime)
  const guestCount = guestCountRaw.trim()
    ? Number.parseInt(guestCountRaw, 10)
    : null
  const arrivalDateAllowed =
    !isCreating || arrivalDate >= minArrivalDate
  const tableConflict = useMemo(() => {
    if (!arrivalAt || resolvedTableIds.length === 0) return null
    return findReservationTableConflict({
      tableIds: resolvedTableIds,
      arrivalAt,
      settings: activeSettings,
      reservations,
      excludeReservationId: initial?.id ?? null,
    })
  }, [arrivalAt, resolvedTableIds, activeSettings, reservations, initial?.id])
  const tableConflictMessage = useMemo(() => {
    if (!tableConflict) return null
    const labels = tableConflict.tableIds.map(
      (id) => tables.find((table) => table.id === id)?.label ?? "—",
    )
    const mesaLabel =
      labels.length > 1
        ? `Las mesas ${labels.join(" + ")}`
        : `La mesa ${labels[0] ?? "—"}`
    const who = tableConflict.reservation.clientName.trim() || "otro cliente"
    const verb = labels.length > 1 ? "están reservadas" : "está reservada"
    return `${mesaLabel} ya ${verb} para ${who} (${formatReservationArrival(tableConflict.reservation.arrivalAt)}). Cambiá la hora o la mesa.`
  }, [tableConflict, tables])
  const canSubmit =
    Boolean(clientLabel) &&
    arrivalAt != null &&
    arrivalDateAllowed &&
    !tableConflict &&
    (guestCountRaw.trim() === "" ||
      (Number.isFinite(guestCount) && guestCount! > 0 && guestCount! <= 50))

  return (
    <>
      <form
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={(e) => {
          e.preventDefault()
          if (!canSubmit || submitting || !arrivalAt) return
          setSubmitting(true)
          void (async () => {
            try {
              if (settingsChanged && localSettingsOpen && onSaveReservationSettings) {
                const settingsOk = await onSaveReservationSettings(draftSettings)
                if (!settingsOk) return
              }
              await onSubmit({
                tableId: resolvedTableId,
                tableIds: resolvedTableIds,
                clientId: client?.manual ? null : client?.id ?? null,
                clientName: (client?.name ?? manualName).trim(),
                guestCount:
                  guestCount != null && Number.isFinite(guestCount)
                    ? guestCount
                    : null,
                arrivalAt,
                note,
              })
            } finally {
              setSubmitting(false)
            }
          })()
        }}
      >
        <ChannelDataPanel className="flex-1">
          <ChannelDataFormSection>
            <div className={rootsFormColumnClass}>
              <ChannelDataFormSelectField
                label="Mesa"
                id={`mesa-reservation-table-${tableId || "new"}`}
                value={tableId}
                onValueChange={setPrimaryTable}
                placeholder="Elegí una mesa"
                labelInfo="Podés dejar la reserva sin mesa y asignarla al sentar al cliente."
              >
                <ChannelDataFormSelectItem value={MESA_RESERVATION_UNASSIGNED_TABLE}>
                  Sin mesa asignada
                </ChannelDataFormSelectItem>
                {tables.map((table) => (
                  <ChannelDataFormSelectItem key={table.id} value={table.id}>
                    Mesa {table.label}
                  </ChannelDataFormSelectItem>
                ))}
              </ChannelDataFormSelectField>

              <ChannelDataFormPartyField
                label="Cliente"
                valueLabel={clientLabel}
                placeholder="Elegir cliente"
                icon={UserRound}
                onClick={() => setClientModalOpen(true)}
              />

              <ChannelDataFormGrid>
                <ChannelDataFormDateField
                  label="Fecha de llegada"
                  id={`mesa-reservation-date-${tableId || "new"}`}
                  value={arrivalDate}
                  onChange={setArrivalDate}
                  placeholder="Elegí una fecha"
                  displayFormat="compact"
                  minDate={isCreating ? minArrivalDate : undefined}
                />

                <ChannelDataFormTextField
                  label="Hora de llegada"
                  id={`mesa-reservation-time-${tableId || "new"}`}
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                />
              </ChannelDataFormGrid>

              {floorWindow ? (
                <ChannelDataHint icon={Clock3}>{floorWindow.summary}</ChannelDataHint>
              ) : null}

              {tableConflictMessage ? (
                <ChannelDataWarningBanner>
                  {tableConflictMessage}
                </ChannelDataWarningBanner>
              ) : null}
            </div>
          </ChannelDataFormSection>

          {mergeCandidates.length > 0 ? (
            <ChannelDataFormSection
              className="space-y-3"
              title={
                <span className="inline-flex items-center gap-1.5 font-canopy text-sm font-medium text-[var(--rootsy-bruma-700)]">
                  <Link2 className="size-3.5 text-[var(--rootsy-savia-600)]" aria-hidden />
                  Juntar mesas
                </span>
              }
              description="Podés unir otras mesas del mismo salón a esta reserva."
            >
              <ul className="space-y-2">
                {mergeCandidates.map((table) => (
                  <li key={table.id}>
                    <ChannelDataFormCheckboxOption
                      checked={mergedIds.includes(table.id)}
                      onCheckedChange={() => toggleMerge(table.id)}
                      label={`Mesa ${table.label}`}
                      meta={mesaSeatsLabel(table.seats)}
                      aria-label={`Juntar mesa ${table.label}`}
                    />
                  </li>
                ))}
              </ul>
            </ChannelDataFormSection>
          ) : null}

          <ChannelDataFormSection>
            <div className={rootsFormColumnClass}>
              <ChannelDataFormIntegerField
                label="Comensales"
                id={`mesa-reservation-guests-${tableId || "new"}`}
                value={guestCountRaw}
                onChange={setGuestCountRaw}
                min={1}
                max={50}
                placeholder="—"
                hint="Opcional"
              />

              <ChannelDataFormTextareaField
                label="Notas"
                id={`mesa-reservation-note-${tableId || "new"}`}
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Pedidos especiales, preferencias de ubicación…"
              />
            </div>
          </ChannelDataFormSection>

          {onSaveReservationSettings ? (
            <Collapsible
              open={localSettingsOpen}
              onOpenChange={(open) => {
                setLocalSettingsOpen(open)
                if (!open) {
                  setFloorBufferRaw(String(reservationSettings.floorBufferMinutes))
                  setGraceMinutesRaw(String(reservationSettings.graceMinutes))
                }
              }}
              className={cn(
                saleOpChannelPanelSection,
                "p-0",
                !localSettingsOpen && "overflow-hidden",
              )}
            >
              <CollapsibleTrigger
                type="button"
                aria-expanded={localSettingsOpen}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3.5 py-3.5 text-left",
                  "outline-none focus:outline-none focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_35%,transparent)]",
                  localSettingsOpen &&
                    "border-b border-[var(--rootsy-bruma-200)]",
                )}
              >
                <Settings2
                  className="size-4 shrink-0 text-[var(--rootsy-bruma-700)]"
                  aria-hidden
                />
                <span className="min-w-0 flex-1 text-sm font-medium text-[var(--rootsy-bruma-900)]">
                  Ventana en plano del local
                </span>
                <span className="shrink-0 text-xs tabular-nums text-[var(--rootsy-bruma-700)]">
                  {reservationSettings.floorBufferMinutes} /{" "}
                  {reservationSettings.graceMinutes} min
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-[var(--rootsy-bruma-700)] transition-transform duration-200",
                    localSettingsOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="min-w-0 overflow-hidden px-3.5 pb-3.5 pt-3">
                <div className={rootsFormTwoColRowClass}>
                  <ChannelDataFormQuantityField
                    label="Anticipación"
                    id={`mesa-reservation-buffer-${tableId || "new"}`}
                    value={floorBufferRaw}
                    onChange={setFloorBufferRaw}
                    max={240}
                    prefix="min"
                    labelInfo="Minutos antes de la hora de llegada en que la mesa se pinta reservada en el plano. Aplica a todas las reservas del local."
                  />

                  <ChannelDataFormQuantityField
                    label="Gracia"
                    id={`mesa-reservation-grace-${tableId || "new"}`}
                    value={graceMinutesRaw}
                    onChange={setGraceMinutesRaw}
                    max={120}
                    prefix="min"
                    labelInfo="Minutos después de la hora de llegada que sigue reservada si el cliente no llegó. Aplica a todas las reservas del local."
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </ChannelDataPanel>

        <ChannelDataFormActionsBar
          onCancel={onCancel}
          cancelDisabled={submitting}
          primary={{
            type: "submit",
            label:
              mergedIds.length > 0
                ? `${submitLabel} (${resolvedTableIds.length} mesas)`
                : submitLabel,
            disabled: !canSubmit || submitting,
            loading: submitting,
            loadingLabel: "Guardando…",
          }}
        />
      </form>

      <OperationPartyPickerDialog
        popId={popId}
        flow="sale"
        context="mesa"
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        canSearchCatalog={canReadClients}
        canCreateClient={canCreateClient}
        manualName={manualName}
        onManualNameChange={setManualName}
        taxId={manualTaxId}
        onTaxIdChange={setManualTaxId}
        email={manualEmail}
        onEmailChange={setManualEmail}
        ivaCondition={manualIvaCondition}
        onIvaConditionChange={setManualIvaCondition}
        selected={client}
        catalogBlocked={false}
        onSelectCatalogParty={(party) => {
          setClient({
            id: party.id,
            manual: false,
            name: party.name,
            taxId: party.taxId ?? null,
            ivaCondition: party.ivaCondition ?? null,
            defaultInvoiceTypeLabel: party.defaultInvoiceTypeLabel ?? null,
          })
          setManualName(party.name)
          setManualTaxId(party.taxId ?? "")
          setManualEmail(party.email ?? "")
          setManualIvaCondition(party.ivaCondition ?? "")
          setClientModalOpen(false)
        }}
        onConfirmManual={(
          payload: OperationPartyManualConfirmPayload,
          _options: OperationPartyManualConfirmOptions,
        ) => {
          setManualName(payload.name)
          setManualTaxId(payload.taxId)
          setManualEmail(payload.email)
          setManualIvaCondition(payload.ivaCondition)
          setClient(buildOperationPartyManualSelection(payload))
        }}
        onClearSelection={() => {
          setClient(null)
          setManualName("")
          setManualTaxId("")
          setManualEmail("")
          setManualIvaCondition("")
        }}
      />
    </>
  )
}

export function formatReservationArrival(iso: string): string {
  const d = new Date(iso)
  return format(d, "EEEE d MMM · HH:mm", { locale: es })
}

export { CalendarClock as MesaReservationIcon }
