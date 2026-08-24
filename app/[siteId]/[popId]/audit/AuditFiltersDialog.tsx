"use client"

import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormCheckboxField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"

export type AuditActionFilter = "create" | "update" | "delete"
export type AuditSourceFilter = "user" | "rootsy_ai" | "system"

export type AuditModalFilters = {
  actions: AuditActionFilter[]
  sources: AuditSourceFilter[]
}

export const defaultAuditModalFilters = (): AuditModalFilters => ({
  actions: [],
  sources: [],
})

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: AuditModalFilters
  onDraftChange: (next: AuditModalFilters) => void
  onApply: () => void
}

const ACTION_OPTIONS: { value: AuditActionFilter; label: string }[] = [
  { value: "create", label: "Altas" },
  { value: "update", label: "Ediciones" },
  { value: "delete", label: "Bajas" },
]

const SOURCE_OPTIONS: { value: AuditSourceFilter; label: string }[] = [
  { value: "user", label: "Persona" },
  { value: "rootsy_ai", label: "Rootsy IA" },
  { value: "system", label: "Sistema" },
]

function toggleValue<T extends string>(list: T[], value: T, checked: boolean): T[] {
  if (checked) return list.includes(value) ? list : [...list, value]
  return list.filter((item) => item !== value)
}

export function AuditFiltersDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" className="sm:max-w-md">
        <RootsDialogHeader
          title="Filtros"
          description="Refiná el rastro por tipo de movimiento y origen. Se combinan con el período y la búsqueda."
        />
        <RootsDialogBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-canopy text-xs font-medium text-[var(--rootsy-bruma-600)]">
                Acción
              </p>
              {ACTION_OPTIONS.map((option) => (
                <RootsFormCheckboxField
                  key={option.value}
                  label={option.label}
                  checked={draft.actions.includes(option.value)}
                  onCheckedChange={(checked) =>
                    onDraftChange({
                      ...draft,
                      actions: toggleValue(draft.actions, option.value, checked),
                    })
                  }
                />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-canopy text-xs font-medium text-[var(--rootsy-bruma-600)]">
                Origen
              </p>
              {SOURCE_OPTIONS.map((option) => (
                <RootsFormCheckboxField
                  key={option.value}
                  label={option.label}
                  checked={draft.sources.includes(option.value)}
                  onCheckedChange={(checked) =>
                    onDraftChange({
                      ...draft,
                      sources: toggleValue(draft.sources, option.value, checked),
                    })
                  }
                />
              ))}
            </div>
          </div>
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Restablecer"
          confirmLabel="Aplicar"
          onCancel={() => onDraftChange(defaultAuditModalFilters())}
          onConfirm={onApply}
        />
      </RootsDialogContent>
    </Dialog>
  )
}
