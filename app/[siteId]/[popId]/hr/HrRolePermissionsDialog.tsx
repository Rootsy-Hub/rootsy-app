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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Dialog } from "@/components/ui/dialog"
import {
  buildHrPermissionCatalogRows,
  buildHrPermissionSections,
  grantVerbApproval,
  grantVerbExecute,
  revokeVerb,
  sectionClearChanges,
  sectionSelectAllChanges,
  verbIsApprovalOnly,
  verbIsGranted,
  type GrantKeyChanges,
  type HrPermissionSection,
  type HrPermissionVerb,
} from "@/lib/hrPermissionCatalog"
import type { PopPageKey } from "@/lib/popPageCrudConstants"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"

type Props = {
  open: boolean
  mode: "create" | "edit"
  displayName: string
  permissions: PermissionCatalogRow[]
  sections?: HrPermissionSection[]
  selectedKeys: string[]
  loading: boolean
  saving: boolean
  error?: string | null
  onOpenChange: (open: boolean) => void
  onDisplayNameChange: (value: string) => void
  onApplyGrantKeys: (grant: string[], revoke: string[]) => void
  onSave: () => void
  canApprove: boolean
  onCanApproveChange: (value: boolean) => void
}

function resolveSections(
  sections: HrPermissionSection[] | undefined,
): HrPermissionSection[] {
  return sections?.length ? sections : buildHrPermissionSections()
}

function applyChanges(
  onApplyGrantKeys: (grant: string[], revoke: string[]) => void,
  changes: GrantKeyChanges,
) {
  onApplyGrantKeys(changes.grant, changes.revoke)
}

function HrPermissionVerbRow({
  verb,
  selectedKeys,
  onApplyGrantKeys,
}: {
  verb: HrPermissionVerb
  selectedKeys: string[]
  onApplyGrantKeys: (grant: string[], revoke: string[]) => void
}) {
  const granted = verbIsGranted(verb, selectedKeys)
  const approvalOnly = verbIsApprovalOnly(verb, selectedKeys)
  const executeId = `perm-${verb.executeKey.replace(/:/g, "-")}`
  const approvalId = verb.approvalKey
    ? `perm-${verb.approvalKey.replace(/:/g, "-")}`
    : undefined

  return (
    <div className="relative">
      <RootsFormCheckboxChoiceRow
        id={executeId}
        label={verb.actionLabel}
        description={
          approvalOnly
            ? "Este rol pide confirmación; no ejecuta la acción."
            : (verb.description ?? undefined)
        }
        checked={granted}
        onCheckedChange={(checked) =>
          applyChanges(
            onApplyGrantKeys,
            checked ? grantVerbExecute(verb) : revokeVerb(verb),
          )
        }
      />
      {granted && verb.approvalKey && approvalId ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-7 bottom-5 w-5 rounded-bl-[6px] border-b border-l border-rootsy-bruma-300"
          />
          <div className="flex min-h-10 items-center pl-8">
            <label
              htmlFor={approvalId}
              className="flex min-h-10 cursor-pointer items-center gap-3"
            >
              <RootsFormCheckbox
                id={approvalId}
                checked={approvalOnly}
                onCheckedChange={(value) => {
                  const next = grantVerbApproval(verb)
                  if (!next) return
                  applyChanges(
                    onApplyGrantKeys,
                    value === true ? next : grantVerbExecute(verb),
                  )
                }}
                aria-label={`Pedir aprobación: ${verb.actionLabel}`}
              />
              <span className="font-canopy text-sm font-medium leading-5 text-rootsy-bruma-800">
                Pedir aprobación
              </span>
            </label>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function HrRolePermissionsDialog({
  open,
  mode,
  displayName,
  sections: sectionsProp,
  selectedKeys,
  loading,
  saving,
  error,
  onOpenChange,
  onDisplayNameChange,
  onApplyGrantKeys,
  onSave,
  canApprove,
  onCanApproveChange,
}: Props) {
  const sections = useMemo(
    () => resolveSections(sectionsProp),
    [sectionsProp],
  )
  const [expandedPages, setExpandedPages] = useState<Set<PopPageKey>>(
    () => new Set(),
  )

  useEffect(() => {
    if (open) setExpandedPages(new Set())
  }, [open])

  const totalCount = useMemo(
    () => sections.reduce((n, section) => n + section.verbs.length, 0),
    [sections],
  )
  const selectedCount = useMemo(
    () =>
      sections.reduce(
        (n, section) =>
          n +
          section.verbs.filter((verb) => verbIsGranted(verb, selectedKeys))
            .length,
        0,
      ),
    [sections, selectedKeys],
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

            <RootsFormCheckboxChoiceRow
              id="hr-role-can-approve"
              label="Puede generar código de aprobación"
              checked={canApprove}
              onCheckedChange={(checked) => onCanApproveChange(checked === true)}
            />

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
                  En crear, editar y eliminar, Pedir aprobación hace que el rol
                  pida confirmación en vez de ejecutar.
                </p>
                {sections.map((section) => {
                  const grantedCount = section.verbs.filter((verb) =>
                    verbIsGranted(verb, selectedKeys),
                  ).length
                  const allOn =
                    section.verbs.length > 0 &&
                    section.verbs.every((verb) =>
                      selectedKeys.includes(verb.executeKey),
                    )
                  const someOn = !allOn && grantedCount > 0
                  const sectionId = `hr-sec-${section.pageKey}`
                  const expanded = expandedPages.has(section.pageKey)

                  return (
                    <Collapsible
                      key={section.pageKey}
                      open={expanded}
                      onOpenChange={(nextOpen) => {
                        setExpandedPages((prev) => {
                          const next = new Set(prev)
                          if (nextOpen) next.add(section.pageKey)
                          else next.delete(section.pageKey)
                          return next
                        })
                      }}
                    >
                      <section className="overflow-hidden rounded-xl border border-rootsy-bruma-200 bg-white">
                        <div className="flex items-center gap-2 bg-rootsy-bruma-50 px-3 py-2">
                          <RootsFormCheckbox
                            id={sectionId}
                            checked={
                              allOn ? true : someOn ? "indeterminate" : false
                            }
                            onCheckedChange={(checked) =>
                              applyChanges(
                                onApplyGrantKeys,
                                checked === true
                                  ? sectionSelectAllChanges(section)
                                  : sectionClearChanges(section),
                              )
                            }
                            aria-label={`Todos los permisos de ${section.label}`}
                          />
                          <CollapsibleTrigger
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-rootsy-bruma-100/80"
                            aria-label={
                              expanded
                                ? `Ocultar permisos de ${section.label}`
                                : `Mostrar permisos de ${section.label}`
                            }
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 shrink-0 text-rootsy-bruma-500 transition-transform duration-200",
                                expanded && "rotate-180",
                              )}
                              aria-hidden
                            />
                            <span className="font-canopy text-sm font-semibold text-rootsy-bruma-900">
                              {section.label}
                            </span>
                          </CollapsibleTrigger>
                          <span className="shrink-0 pr-1 font-canopy text-[11px] tabular-nums text-rootsy-bruma-500">
                            {grantedCount}/{section.verbs.length}
                          </span>
                        </div>
                        <CollapsibleContent>
                          <div
                            className={cn(
                              rootsFormCheckboxChoiceListClass,
                              "gap-0 border-t border-rootsy-bruma-200 px-2 py-1",
                            )}
                          >
                            {section.verbs.map((verb) => (
                              <HrPermissionVerbRow
                                key={verb.executeKey}
                                verb={verb}
                                selectedKeys={selectedKeys}
                                onApplyGrantKeys={onApplyGrantKeys}
                              />
                            ))}
                          </div>
                        </CollapsibleContent>
                      </section>
                    </Collapsible>
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
