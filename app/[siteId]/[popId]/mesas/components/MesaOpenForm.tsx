"use client"

import type {
  MesaOpenSessionInput,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { Button } from "@/components/ui/button"
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

  const mesaDetailsCardClass =
    "grid gap-3 rounded-xl border border-slate-200/90 bg-white p-4 text-sm shadow-sm"

  const mesaFormFieldClass =
    "rounded-lg border border-solid !border-slate-200 bg-white !shadow-none ring-0 outline-none transition-colors hover:!border-slate-300 focus-visible:!border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-200/60 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-800"

  const mesaFormMergeRowClass = (checked: boolean) =>
    cn(
      "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
      checked
        ? "border-emerald-300 bg-emerald-50/80"
        : "border-slate-200 bg-white hover:border-slate-300",
    )

  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-5"
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
      <dl className={mesaDetailsCardClass}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mozo
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
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
            </dt>
            <dd className="mt-1.5">
              <Select
                value={waiterId || undefined}
                onValueChange={setWaiterId}
                disabled={waiters.length === 0}
              >
                <SelectTrigger
                  id="mesa-waiter"
                  className={cn(
                    mesaFormFieldClass,
                    "h-11 w-full font-normal data-placeholder:text-slate-400",
                  )}
                >
                  <SelectValue
                    placeholder={
                      waiters.length === 0
                        ? "Sin mozos"
                        : "Seleccionar mozo"
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
            </dd>
          </div>

          <div className="shrink-0">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Comensales
            </dt>
            <dd className="mt-1.5">
              <div
                className={cn(
                  mesaFormFieldClass,
                  "flex h-11 w-31 items-stretch overflow-hidden p-0",
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
                  className="inline-flex w-10 shrink-0 items-center justify-center border-r border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="min-w-0 flex-1 border-0 bg-transparent px-1 text-center text-sm font-medium tabular-nums text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label="Agregar un comensal"
                  disabled={guestCount != null && guestCount >= MESA_GUEST_MAX}
                  onClick={() => adjustGuestCount(1)}
                  className="inline-flex w-10 shrink-0 items-center justify-center border-l border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="size-3.5" aria-hidden />
                </button>
              </div>
            </dd>
          </div>
        </div>

        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Notas
          </dt>
          <dd className="mt-1.5">
            <Textarea
              id="mesa-note"
              rows={2}
              placeholder="Alergias, celebración, preferencias…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={cn(
                mesaFormFieldClass,
                "min-h-0 resize-none px-3 py-2.5",
              )}
            />
          </dd>
        </div>
      </dl>

      {mergeCandidates.length > 0 ? (
        <dl className={mesaDetailsCardClass}>
          <div>
            <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Link2 className="size-3.5 text-emerald-600" aria-hidden />
              Juntar mesas libres
            </dt>
            <dd className="mt-1.5">
              <p className="mb-3 text-xs leading-relaxed text-slate-500">
                Podés unir otras mesas libres del mismo salón a esta cuenta.
              </p>
              <ul className="space-y-2">
                {mergeCandidates.map((t) => {
                  const checked = mergedIds.includes(t.id)
                  return (
                    <li key={t.id}>
                      <label className={mesaFormMergeRowClass(checked)}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleMerge(t.id)}
                          aria-label={`Juntar mesa ${t.label}`}
                          className="border-slate-200 bg-white shadow-none data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                        />
                        <span className="text-sm font-medium text-slate-800">
                          Mesa {t.label}
                        </span>
                        <span className="ml-auto text-xs text-slate-400">
                          {t.seats} pax
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-200/80 pt-4">
        <Button
          type="submit"
          disabled={!canSubmit || submitting}
          className="h-11 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {submitting ? "Guardando…" : submitLabel}
          {mergedIds.length > 0
            ? ` (${tableIds.length} mesas)`
            : null}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            className="h-10 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
