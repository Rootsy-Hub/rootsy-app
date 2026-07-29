"use client"

import type {
  MesaOpenSessionInput,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import {
  CheckoutSectionLabel,
} from "@/components/checkout/CheckoutFormFields"
import {
  ChannelDataFormActionsBar,
  ChannelDataPanel,
  ChannelDataSection,
} from "@/components/sale-operation/ChannelOperationDataPanel"
import {
  saleOpChannelFormField,
  saleOpChannelSelectableRow,
} from "@/components/sale-operation/saleOperationStyles"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { CircleHelp, Link2, Minus, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const MESA_GUEST_MAX = 50

function sanitizeGuestCountInput(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  const n = Number.parseInt(digits, 10)
  if (!Number.isFinite(n) || n <= 0) return ""
  return String(Math.min(MESA_GUEST_MAX, n))
}

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

  const adjustGuestCount = (delta: number) => {
    const current = guestCount ?? 0
    if (delta > 0) {
      const next = current <= 0 ? 1 : Math.min(MESA_GUEST_MAX, current + 1)
      setGuestCountRaw(String(next))
      return
    }
    if (current <= 1) {
      setGuestCountRaw("")
      return
    }
    setGuestCountRaw(String(current - 1))
  }

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
        <ChannelDataSection className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <CheckoutSectionLabel>
                <span className="inline-flex items-center gap-1.5">
                  Mozo
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Información sobre mozos"
                      >
                        <CircleHelp className="size-3.5" aria-hidden />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      variant="dark"
                      side="top"
                      sideOffset={6}
                      className="max-w-[240px] text-center"
                    >
                      Asigná usuarios al rol Mozo en RRHH para poder
                      seleccionarlos.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </CheckoutSectionLabel>
              <Select
                value={waiterId || undefined}
                onValueChange={setWaiterId}
                disabled={waiters.length === 0}
              >
                <SelectTrigger
                  id="mesa-waiter"
                  className={cn(
                    saleOpChannelFormField,
                    "mt-2 h-11 w-full font-normal data-placeholder:text-muted-foreground/70",
                  )}
                >
                  <SelectValue
                    placeholder={
                      waiters.length === 0 ? "Sin mozos" : "Seleccionar mozo"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {waiters.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="shrink-0">
              <CheckoutSectionLabel>Comensales</CheckoutSectionLabel>
              <div
                className={cn(
                  saleOpChannelFormField,
                  "mt-2 flex h-11 w-31 items-stretch overflow-hidden p-0",
                )}
                role="group"
                aria-label="Cantidad de comensales"
              >
                <button
                  type="button"
                  aria-label="Quitar un comensal"
                  disabled={
                    guestCountRaw === "" ||
                    (guestCount != null && guestCount <= 1)
                  }
                  onClick={() => adjustGuestCount(-1)}
                  className="inline-flex w-10 shrink-0 items-center justify-center border-r border-border/70 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="size-3.5" aria-hidden />
                </button>
                <input
                  id="mesa-guests"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder="—"
                  value={guestCountRaw}
                  onChange={(e) =>
                    setGuestCountRaw(sanitizeGuestCountInput(e.target.value))
                  }
                  className="min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground/70"
                />
                <button
                  type="button"
                  aria-label="Agregar un comensal"
                  disabled={guestCount != null && guestCount >= MESA_GUEST_MAX}
                  onClick={() => adjustGuestCount(1)}
                  className="inline-flex w-10 shrink-0 items-center justify-center border-l border-border/70 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-3.5" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div>
            <CheckoutSectionLabel>Notas</CheckoutSectionLabel>
            <Textarea
              id="mesa-note"
              rows={2}
              placeholder="Alergias, celebración, preferencias…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={cn(
                saleOpChannelFormField,
                "mt-2 min-h-0 resize-none px-3 py-2.5",
              )}
            />
          </div>
        </ChannelDataSection>

        {mergeCandidates.length > 0 ? (
          <ChannelDataSection className="space-y-3">
            <div>
              <CheckoutSectionLabel>
                <span className="inline-flex items-center gap-1.5">
                  <Link2 className="size-3.5 text-primary" aria-hidden />
                  Juntar mesas libres
                </span>
              </CheckoutSectionLabel>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Podés unir otras mesas libres del mismo salón a esta cuenta.
              </p>
            </div>
            <ul className="space-y-2">
              {mergeCandidates.map((t) => {
                const checked = mergedIds.includes(t.id)
                return (
                  <li key={t.id}>
                    <label className={saleOpChannelSelectableRow(checked)}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleMerge(t.id)}
                        aria-label={`Juntar mesa ${t.label}`}
                        className="border-border/70 bg-background shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Mesa {t.label}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {t.seats} pax
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </ChannelDataSection>
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
