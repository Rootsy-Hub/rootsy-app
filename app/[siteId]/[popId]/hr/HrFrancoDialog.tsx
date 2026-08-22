"use client"

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
  defaultDay: string
  saving: boolean
  error: string | null
  onOpenChange: (open: boolean) => void
  onSubmit: (day: string) => void | Promise<void>
}

export function HrFrancoDialog({
  open,
  defaultDay,
  saving,
  error,
  onOpenChange,
  onSubmit,
}: Props) {
  const [day, setDay] = useState(defaultDay)

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
            title="Marcar franco"
            description="Un día libre. No descuenta sueldo: eso va aparte, cuando le pagues."
          />
          <RootsDialogBody className="space-y-4">
            <RootsFormDateField
              label="Día"
              id="hr-franco-day"
              value={day}
              onChange={setDay}
            />
            {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel="Marcar franco"
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
