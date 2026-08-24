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
import { RootsDefaultButton, RootsSubtleButton } from "@/components/rootsy-button"
import {
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
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
  countHrGrantedVerbs,
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
  surface?: "dialog" | "panel"
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
  const showApproval = Boolean(granted && verb.approvalKey && approvalId)

  return (
    <div className="px-1">
      <div className="flex gap-3">
        <div
          className={cn(
            "flex w-4 shrink-0 flex-col items-center",
            showApproval && "pb-5",
          )}
        >
          <RootsFormCheckbox
            id={executeId}
            checked={granted}
            className="mt-3"
            onCheckedChange={(value) =>
              applyChanges(
                onApplyGrantKeys,
                value === true ? grantVerbExecute(verb) : revokeVerb(verb),
              )
            }
            aria-label={verb.actionLabel}
          />
          {showApproval ? (
            <span
              aria-hidden
              className="w-px min-h-3 flex-1 bg-rootsy-bruma-500"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor={executeId} className="flex cursor-pointer flex-col gap-0.5 py-2.5">
            <span className="font-canopy text-sm font-medium leading-5 text-rootsy-bruma-900">
              {verb.actionLabel}
            </span>
            {verb.description || approvalOnly ? (
              <span className="font-canopy text-xs leading-4 text-rootsy-bruma-500">
                {approvalOnly
                  ? "Este rol pide confirmación; no ejecuta la acción."
                  : verb.description}
              </span>
            ) : null}
          </label>
          {showApproval && approvalId ? (
            <div className="flex h-10 items-center">
              <span
                aria-hidden
                className="-ml-5 h-px w-5 bg-rootsy-bruma-500"
              />
              <label
                htmlFor={approvalId}
                className="flex cursor-pointer items-center gap-3"
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
                <span className="font-canopy text-sm font-medium leading-5 text-rootsy-bruma-900">
                  Pedir aprobación
                </span>
              </label>
            </div>
          ) : null}
        </div>
      </div>
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
  surface = "dialog",
}: Props) {
  const sections = useMemo(
    () => resolveSections(sectionsProp),
    [sectionsProp],
  )
  const [expandedPages, setExpandedPages] = useState<Set<PopPageKey>>(
    () => new Set(),
  )
  const isPanel = surface === "panel"

  useEffect(() => {
    if (open) setExpandedPages(new Set())
  }, [open])

  const { granted: selectedCount, total: totalCount } = useMemo(
    () => countHrGrantedVerbs(sections, selectedKeys),
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

  const title = mode === "create" ? "Nuevo rol" : "Permisos del rol"

  const fields = (
    <>
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
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left outline-none hover:bg-rootsy-bruma-100/80 focus:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]"
                      onPointerUp={(event) => {
                        event.currentTarget.blur()
                      }}
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
    </>
  )

  if (isPanel && !open) return null

  if (isPanel) {
    return (
      <article
        className={cn(
          dataWorkspaceEntityCardLosetaSurfaceClass,
          "h-auto",
        )}
      >
        <form className="flex min-h-0 flex-col" onSubmit={handleSubmit}>
          <div className="space-y-1 border-b border-rootsy-bruma-200 px-5 py-4">
            <h3 className="font-canopy text-base font-semibold text-rootsy-bruma-900">
              {title}
            </h3>
            <p className="font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
              {description}
            </p>
          </div>
          <div className="max-h-[min(70vh,44rem)] space-y-4 overflow-y-auto px-5 py-4">
            {fields}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-rootsy-bruma-200 px-5 py-3">
            <RootsSubtleButton
              type="button"
              size="compact"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </RootsSubtleButton>
            <RootsDefaultButton
              type="submit"
              size="compact"
              disabled={!canSave}
            >
              {saving
                ? "Guardando…"
                : mode === "create"
                  ? "Crear rol"
                  : "Guardar permisos"}
            </RootsDefaultButton>
          </div>
        </form>
      </article>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RootsDialogContent size="wide" showCloseButton={!saving}>
        <RootsDialogHeader
          open={open}
          title={title}
          description={description}
        />
        <RootsDialogForm onSubmit={handleSubmit}>
          <RootsDialogBody className="space-y-4">{fields}</RootsDialogBody>
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
