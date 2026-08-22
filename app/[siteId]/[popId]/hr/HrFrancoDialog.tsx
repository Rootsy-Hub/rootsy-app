"use client"

import type { DayMarkKind } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormDateField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { useEffect, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  kind: DayMarkKind
  defaultDay: string
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (day: string) => void | Promise<void>
}

const COPY: Record<
  DayMarkKind,
  { title: string; description: string; confirm: string }
> = {
  franco: {
    title: "Marcar franco",
    description: "Un día libre previsto. No descuenta sueldo: eso va aparte, cuando le pagues.",
    confirm: "Marcar franco",
  },
  falta: {
    title: "Marcar falta",
    description: "Tenía que venir y no vino. No descuenta sueldo: eso va aparte, cuando le pagues.",
    confirm: "Marcar falta",
  },
}

export function HrFrancoDialog({
  open,
  kind,
  defaultDay,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [day, setDay] = useState(defaultDay)
  const copy = COPY[kind]

  useEffect(() => {
    if (!open) return
    setDay(defaultDay)
  }, [open, defaultDay])

  const canSubmit = /^\d{4}-\d{2}-\d{2}$/.test(day.trim())

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    void onSubmit(day.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent showCloseButton={!saving}>
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogHeader
            open={open}
            title={copy.title}
            description={copy.description}
          />
          <RootsDialogBody className="space-y-4">
            <RootsFormDateField
              label="Día"
              id="hr-day-mark-day"
              value={day}
              onChange={setDay}
            />
            {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={copy.confirm}
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={!canSubmit}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}
