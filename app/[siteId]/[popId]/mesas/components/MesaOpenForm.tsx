"use client"

import type {
  MesaOpenSessionInput,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaSeatsLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { ChannelDataFormActionsBar } from "@/components/sale-operation/ChannelOperationDataPanel"
import {
  ChannelDataFormCheckboxOption,
  ChannelDataFormGrid,
  ChannelDataFormIntegerField,
  ChannelDataFormSection,
  ChannelDataFormSelectField,
  ChannelDataFormSelectItem,
  ChannelDataFormTextareaField,
} from "@/components/sale-operation/ChannelDataFormFields"
import { ChannelDataPanel } from "@/components/sale-operation/ChannelOperationDataPanel"
import { Link2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const MESA_GUEST_MAX = 50

type Props = {
  primaryTable: MesaTable
  mergeCandidates: MesaTable[]
  waiters: MesaWaiter[]
  initial?: Partial<MesaOpenSessionInput>
  submitLabel?: string
  onSubmit: (input: MesaOpenSessionInput) => void | Promise<void>
  onCancel?: () => void
}

export function MesaOpenForm({
  primaryTable,
  mergeCandidates,
  waiters,
  initial,
  submitLabel = "Abrir mesa",
  onSubmit,
  onCancel,
}: Props) {
  const [waiterId, setWaiterId] = useState(initial?.waiterId ?? "")
  const [guestCountRaw, setGuestCountRaw] = useState(
    initial?.guestCount != null ? String(initial.guestCount) : "",
  )
  const [note, setNote] = useState(initial?.note ?? "")
  const [mergedIds, setMergedIds] = useState<string[]>(() => {
    const ids = initial?.tableIds ?? [primaryTable.id]
    return ids.filter((id) => id !== primaryTable.id)
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setWaiterId(initial?.waiterId ?? "")
    setGuestCountRaw(
      initial?.guestCount != null ? String(initial.guestCount) : "",
    )
    setNote(initial?.note ?? "")
    const ids = initial?.tableIds ?? [primaryTable.id]
    setMergedIds(ids.filter((id) => id !== primaryTable.id))
  }, [primaryTable.id, initial])

  const tableIds = useMemo(
    () => [primaryTable.id, ...mergedIds],
    [primaryTable.id, mergedIds],
  )

  const guestCount = guestCountRaw.trim()
    ? Number.parseInt(guestCountRaw, 10)
    : null

  const canSubmit =
    guestCount == null ||
    (Number.isFinite(guestCount) && guestCount > 0 && guestCount <= MESA_GUEST_MAX)

  const toggleMerge = (id: string) => {
    setMergedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit || submitting) return
        setSubmitting(true)
        void (async () => {
          try {
            await onSubmit({
              tableIds,
              waiterId,
              guestCount:
                guestCount != null && Number.isFinite(guestCount)
                  ? guestCount
                  : null,
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
          <ChannelDataFormGrid>
            <ChannelDataFormSelectField
              label="Mozo"
              id="mesa-waiter"
              value={waiterId}
              onValueChange={setWaiterId}
              disabled={waiters.length === 0}
              placeholder={waiters.length === 0 ? "Sin mozos" : "Seleccionar mozo"}
              labelInfo="Asigná usuarios al rol Mozo en RRHH para poder seleccionarlos."
            >
              {waiters.map((w) => (
                <ChannelDataFormSelectItem key={w.id} value={w.id}>
                  {w.name}
                </ChannelDataFormSelectItem>
              ))}
            </ChannelDataFormSelectField>

            <ChannelDataFormIntegerField
              label="Comensales"
              id="mesa-guests"
              value={guestCountRaw}
              onChange={setGuestCountRaw}
              min={0}
              max={MESA_GUEST_MAX}
              placeholder="—"
              hint="Opcional"
            />
          </ChannelDataFormGrid>

          <ChannelDataFormTextareaField
            label="Notas"
            id="mesa-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Alergias, celebración, preferencias…"
          />
        </ChannelDataFormSection>

        {mergeCandidates.length > 0 ? (
          <ChannelDataFormSection
            className="space-y-3"
            title={
              <span className="inline-flex items-center gap-1.5 font-canopy text-sm font-medium text-[var(--rootsy-bruma-700)]">
                <Link2 className="size-3.5 text-[var(--rootsy-savia-600)]" aria-hidden />
                Juntar mesas libres
              </span>
            }
            description="Podés unir otras mesas libres del mismo salón a esta cuenta."
          >
            <ul className="space-y-2">
              {mergeCandidates.map((t) => (
                <li key={t.id}>
                  <ChannelDataFormCheckboxOption
                    checked={mergedIds.includes(t.id)}
                    onCheckedChange={() => toggleMerge(t.id)}
                    label={`Mesa ${t.label}`}
                    meta={mesaSeatsLabel(t.seats)}
                    aria-label={`Juntar mesa ${t.label}`}
                  />
                </li>
              ))}
            </ul>
          </ChannelDataFormSection>
        ) : null}
      </ChannelDataPanel>

      <ChannelDataFormActionsBar
        onCancel={onCancel}
        primary={{
          type: "submit",
          label:
            mergedIds.length > 0
              ? `${submitLabel} (${tableIds.length} mesas)`
              : submitLabel,
          disabled: !canSubmit || submitting,
          loading: submitting,
          loadingLabel: "Guardando…",
        }}
      />
    </form>
  )
}
