"use client"

import type {
  ExpenseCategoryFamily,
  ExpenseCategoryKind,
  ExpenseCategoryRow,
} from "@/app/[siteId]/[popId]/expenses/actions"
import { EXPENSE_WORLD_ORDER } from "@/app/[siteId]/[popId]/expenses/expenseWorlds"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsDangerSubtleButton, RootsProgressButton } from "@/components/rootsy-button"
import { RootsSpinner } from "@/components/rootsy-spinner"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogErrorBanner,
  RootsDialogHeader,
} from "@/components/rootsy-dialog"
import { RootsFormSegmentField, RootsFormTextField } from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import { EXPENSE_CHART_FAMILY_LABEL } from "@/lib/expenseCategoryChart"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import type { FormEvent } from "react"

const KIND_LABEL: Record<ExpenseCategoryKind, string> = {
  fijo: "Fijos",
  variable: "Variables",
  otro: "Otros",
}

type OperableKind = "fijo" | "variable"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: ExpenseCategoryRow[]
  name: string
  kind: OperableKind
  family: ExpenseCategoryFamily
  saving: boolean
  pendingCreate: { name: string; kind: OperableKind } | null
  pendingDeleteId: string | null
  banner: string | null
  canDelete: boolean
  onNameChange: (value: string) => void
  onKindChange: (kind: OperableKind) => void
  onFamilyChange: (family: ExpenseCategoryFamily) => void
  onSubmit: () => void
  onDelete: (category: ExpenseCategoryRow) => void
}

export function ExpenseCategoriesDialog({
  open,
  onOpenChange,
  categories,
  name,
  kind,
  family,
  saving,
  pendingCreate,
  pendingDeleteId,
  banner,
  canDelete,
  onNameChange,
  onKindChange,
  onFamilyChange,
  onSubmit,
  onDelete,
}: Props) {
  const active = categories.filter(
    (category) => category.deletedAt == null && category.kind !== "otro",
  )
  const canAdd = name.trim().length > 0 && !saving

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canAdd) return
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="default" showCloseButton={!saving}>
        <RootsDialogHeader
          open={open}
          title="Categorías"
          description="Cada categoría es una cuenta de gastos. Fijo o variable, y si es de administración, comercialización o financieros."
        />
        <RootsDialogBody className="space-y-5">
          {banner ? (
            <RootsDialogErrorBanner>{banner}</RootsDialogErrorBanner>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <RootsFormTextField
              label="Nombre"
              id="expense-new-category"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Alquiler, luz, insumos…"
              disabled={saving}
              autoComplete="off"
            />
            <RootsFormSegmentField
              label="Tipo"
              value={kind}
              disabled={saving}
              onValueChange={(value) => onKindChange(value as OperableKind)}
              options={[
                { value: "fijo", label: "Fijo" },
                { value: "variable", label: "Variable" },
              ]}
            />
            <RootsFormSegmentField
              label="Familia"
              value={family}
              disabled={saving}
              onValueChange={(value) =>
                onFamilyChange(value as ExpenseCategoryFamily)
              }
              hint="Administración, comercialización o financieros."
              options={[
                {
                  value: "administracion",
                  label: EXPENSE_CHART_FAMILY_LABEL.administracion,
                },
                {
                  value: "comercializacion",
                  label: "Comercial",
                },
                {
                  value: "financiera",
                  label: EXPENSE_CHART_FAMILY_LABEL.financiera,
                },
              ]}
            />
            <RootsProgressButton
              type="submit"
              disabled={!canAdd}
            >
              Agregar
            </RootsProgressButton>
          </form>

          {active.length === 0 && !pendingCreate ? (
            <p className={dataWorkspaceBlocksEmptyStateClass}>
              Todavía no hay. El primero vive acá.
            </p>
          ) : (
            <div
              className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}
            >
              {EXPENSE_WORLD_ORDER.map((world, index) => {
                const ofKind = active.filter((category) => category.kind === world)
                const pendingHere =
                  pendingCreate?.kind === world ? pendingCreate : null
                return (
                  <div
                    key={world}
                    className={
                      index > 0 ? "border-t border-rootsy-bruma-200" : undefined
                    }
                  >
                    <p
                      className={cn(
                        dataWorkspaceEntityCardEyebrowClass,
                        "px-4 pt-3.5 pb-1",
                      )}
                    >
                      {KIND_LABEL[world]}
                    </p>
                    {ofKind.length === 0 && !pendingHere ? (
                      <p className="px-4 pb-3.5 font-canopy text-xs text-rootsy-bruma-500">
                        Ninguna todavía
                      </p>
                    ) : (
                      <ul>
                        {ofKind.map((category) => {
                          const isDeleting = pendingDeleteId === category.id
                          return (
                          <li
                            key={category.id}
                            className={cn(
                              "flex items-center justify-between gap-3 px-4 py-2.5",
                              isDeleting && "pointer-events-none opacity-50",
                            )}
                            aria-busy={isDeleting || undefined}
                            aria-disabled={isDeleting || undefined}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
                                {category.name}
                              </p>
                              {category.readOnly ? (
                                <p className="font-canopy text-[11px] text-rootsy-bruma-500">
                                  Solo se mira
                                </p>
                              ) : null}
                            </div>
                            {isDeleting ? (
                              <RootsSpinner
                                size="sm"
                                className="shrink-0"
                                label={`Eliminando ${category.name}`}
                              />
                            ) : canDelete && category.canDelete ? (
                              <RootsDangerSubtleButton
                                type="button"
                                size="compact"
                                aria-label={`Eliminar ${category.name}`}
                                disabled={saving}
                                onClick={() => onDelete(category)}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                              </RootsDangerSubtleButton>
                            ) : null}
                          </li>
                          )
                        })}
                        {pendingHere ? (
                          <li
                            className="flex items-center justify-between gap-3 px-4 py-2.5 opacity-50"
                            aria-busy="true"
                            aria-disabled="true"
                          >
                            <p className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
                              {pendingHere.name}
                            </p>
                            <RootsSpinner
                              size="sm"
                              className="shrink-0"
                              label={`Creando ${pendingHere.name}`}
                            />
                          </li>
                        ) : null}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </RootsDialogBody>
      </RootsDialogContent>
    </Dialog>
  )
}
