"use client"

import type { PermissionCatalogRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogForm,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import {
  RootsFormCheckbox,
  RootsFormCheckboxChoiceRow,
  RootsFormTextField,
  rootsFormCheckboxChoiceListClass,
} from "@/components/rootsy-form"
import { Dialog } from "@/components/ui/dialog"
import {
  buildHrPermissionCatalogRows,
  buildHrPermissionSections,
  sectionGrantKeys,
  type HrPermissionSection,
} from "@/lib/hrPermissionCatalog"
import { cn } from "@/lib/utils"
import { useMemo, type FormEvent } from "react"

type Props = {
  open: boolean
  mode: "create" | "edit"
  displayName: string
  permissions: PermissionCatalogRow[]
  selectedKeys: string[]
  loading: boolean
  saving: boolean
  error?: string | null
  onOpenChange: (open: boolean) => void
  onDisplayNameChange: (value: string) => void
  onToggleKey: (key: string) => void
  onToggleSection: (keys: string[], enabled: boolean) => void
  onSave: () => void
}

function mergeSections(
  catalog: PermissionCatalogRow[],
  mode: "create" | "edit",
): HrPermissionSection[] {
  const canonical = buildHrPermissionSections()

  if (catalog.length === 0 && mode === "create") {
    return canonical
  }

  if (catalog.length === 0) return canonical

  const catalogKeys = new Set(catalog.map((c) => c.key))
  return canonical
    .map((section) => ({
      ...section,
      permissions: section.permissions.filter((p) => catalogKeys.has(p.key)),
    }))
    .filter((s) => s.permissions.length > 0)
}

export function HrRolePermissionsDialog({
  open,
  mode,
  displayName,
  permissions,
  selectedKeys,
  loading,
  saving,
  error,
  onOpenChange,
  onDisplayNameChange,
  onToggleKey,
  onToggleSection,
  onSave,
}: Props) {
  const sections = useMemo(
    () => mergeSections(permissions, mode),
    [permissions, mode],
  )

  const selectedCount = selectedKeys.length
  const totalCount = useMemo(
    () => sections.reduce((n, s) => n + s.permissions.length, 0),
    [sections],
  )

  const canSave =
    !loading &&
    !saving &&
    (mode === "edit" || displayName.trim().length > 0)

  const description = loading
    ? "Cargando permisos disponibles…"
    : mode === "create"
      ? `Definí el nombre y qué secciones puede usar este rol. ${selectedCount} de ${totalCount} permisos seleccionados.`
      : `${displayName || "—"}. ${selectedCount} de ${totalCount} permisos activos.`

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" showCloseButton={!saving}>
        <RootsDialogHeader
          open={open}
          title={mode === "create" ? "Nuevo rol" : "Permisos del rol"}
          description={description}
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody className="space-y-4">
            {mode === "create" ? (
              <RootsFormTextField
                label="Nombre del rol"
                id="hr-role-display-name"
                value={displayName}
                onChange={(event) => onDisplayNameChange(event.target.value)}
                placeholder="Ej. Mozos, Encargado, Cocina…"
                autoFocus
                required
              />
            ) : null}

            {loading ? (
              <RootsDialogLoadingState message="Obteniendo catálogo de permisos…" />
            ) : sections.length === 0 ? (
              <p className="py-6 font-canopy text-sm leading-relaxed text-rootsy-bruma-500">
                No hay permisos configurados en la app.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
                  Marcá qué pantallas y acciones puede usar una persona con este
                  rol. El checkbox del encabezado activa la sección completa.
                </p>
                {sections.map((section) => {
                  const keys = sectionGrantKeys(section)
                  const allOn = keys.every((k) => selectedKeys.includes(k))
                  const someOn =
                    !allOn && keys.some((k) => selectedKeys.includes(k))
                  const sectionId = `hr-sec-${section.pageKey}`

                  return (
                    <section
                      key={section.pageKey}
                      className="overflow-hidden rounded-xl border border-rootsy-bruma-200 bg-white"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-rootsy-bruma-200 bg-rootsy-bruma-50 px-4 py-2.5">
                        <label
                          htmlFor={sectionId}
                          className="flex min-w-0 cursor-pointer items-center gap-2.5"
                        >
                          <RootsFormCheckbox
                            id={sectionId}
                            checked={
                              allOn ? true : someOn ? "indeterminate" : false
                            }
                            onCheckedChange={(checked) =>
                              onToggleSection(keys, checked === true)
                            }
                            aria-label={`Todos los permisos de ${section.label}`}
                          />
                          <span className="font-canopy text-sm font-semibold text-rootsy-bruma-900">
                            {section.label}
                          </span>
                        </label>
                        <span className="shrink-0 font-canopy text-[11px] tabular-nums text-rootsy-bruma-500">
                          {keys.filter((k) => selectedKeys.includes(k)).length}/
                          {keys.length}
                        </span>
                      </div>
                      <div className={cn(rootsFormCheckboxChoiceListClass, "gap-0 px-2 py-1")}>
                        {section.permissions.map((permission) => {
                          const row =
                            permissions.find((item) => item.key === permission.key) ??
                            permission
                          return (
                            <RootsFormCheckboxChoiceRow
                              key={permission.key}
                              id={`perm-${permission.key.replace(/:/g, "-")}`}
                              label={row.actionLabel ?? permission.actionLabel}
                              description={
                                row.description ?? permission.description ?? undefined
                              }
                              checked={selectedKeys.includes(permission.key)}
                              onCheckedChange={() => onToggleKey(permission.key)}
                            />
                          )
                        })}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}

            {error ? <RootsDialogErrorBanner>{error}</RootsDialogErrorBanner> : null}
          </RootsDialogBody>
          <RootsDialogDualActionFooter
            onCancel={() => onOpenChange(false)}
            confirmLabel={mode === "create" ? "Crear rol" : "Guardar permisos"}
            confirmLoadingLabel="Guardando…"
            confirmType="submit"
            confirmDisabled={!canSave}
            confirmLoading={saving}
          />
        </RootsDialogForm>
      </RootsDialogContent>
    </Dialog>
  )
}

/** Catálogo completo para abrir el modal de creación sin round-trip al servidor. */
export function hrCreateRolePermissionCatalog(): PermissionCatalogRow[] {
  return buildHrPermissionCatalogRows()
}
