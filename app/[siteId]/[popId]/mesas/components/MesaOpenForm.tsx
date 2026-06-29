"use client"

import type {
  MesaOpenSessionInput,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Link2, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type Props = {
  primaryTable: MesaTable
  mergeCandidates: MesaTable[]
  waiters: MesaWaiter[]
  initial?: Partial<MesaOpenSessionInput>
  submitLabel?: string
  onSubmit: (input: MesaOpenSessionInput) => void
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
    waiterId.length > 0 &&
    (guestCount == null || (Number.isFinite(guestCount) && guestCount > 0))

  const toggleMerge = (id: string) => {
    setMergedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSubmit({
          tableIds,
          waiterId,
          guestCount:
            guestCount != null && Number.isFinite(guestCount)
              ? guestCount
              : null,
          note,
        })
      }}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="mesa-waiter" className="text-slate-600">
            Mozo <span className="text-rose-500">*</span>
          </Label>
          <Select value={waiterId || undefined} onValueChange={setWaiterId}>
            <SelectTrigger id="mesa-waiter" className="h-11 bg-white">
              <SelectValue placeholder="Seleccionar mozo" />
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

        <div className="grid gap-2">
          <Label htmlFor="mesa-guests" className="text-slate-600">
            Comensales{" "}
            <span className="font-normal text-slate-400">(opcional)</span>
          </Label>
          <div className="relative">
            <Users
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id="mesa-guests"
              type="number"
              min={1}
              max={99}
              inputMode="numeric"
              placeholder="Ej. 4"
              value={guestCountRaw}
              onChange={(e) => setGuestCountRaw(e.target.value)}
              className="h-11 bg-white pl-9"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mesa-note" className="text-slate-600">
            Notas{" "}
            <span className="font-normal text-slate-400">(opcional)</span>
          </Label>
          <Textarea
            id="mesa-note"
            rows={2}
            placeholder="Alergias, celebración, preferencias…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none bg-white"
          />
        </div>
      </div>

      {mergeCandidates.length > 0 ? (
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Link2 className="size-4 text-emerald-600" aria-hidden />
            Juntar mesas libres
          </div>
          <p className="mb-3 text-xs leading-relaxed text-slate-500">
            Podés unir otras mesas libres del mismo salón a esta cuenta.
          </p>
          <ul className="space-y-2">
            {mergeCandidates.map((t) => {
              const checked = mergedIds.includes(t.id)
              return (
                <li key={t.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                      checked
                        ? "border-emerald-300 bg-emerald-50/80"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleMerge(t.id)}
                      aria-label={`Juntar mesa ${t.label}`}
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
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-200/80 pt-4">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-11 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {submitLabel}
          {mergedIds.length > 0
            ? ` (${tableIds.length} mesas)`
            : null}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" className="h-10" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
