"use client"

import type { PermissionCatalogRow } from "@/app/[siteId]/[popId]/hr/actions"
import {
  clientDialogBodyClass,
  clientDialogFooterClass,
  clientDialogHeaderClass,
  clientDialogSurface,
} from "@/app/[siteId]/[popId]/clients/ClientUpsertFormFields"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  buildHrPermissionCatalogRows,
  buildHrPermissionSections,
  sectionGrantKeys,
  type HrPermissionSection,
} from "@/lib/hrPermissionCatalog"
import { cn } from "@/lib/utils"
import { Loader2, ShieldCheck } from "lucide-react"
import { useMemo } from "react"

type Props = {
  open: boolean
  mode: "create" | "edit"
  displayName: string
  permissions: PermissionCatalogRow[]
  selectedKeys: string[]
  loading: boolean
  saving: boolean
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-rootsy-light-shell="true"
        showCloseButton={!saving}
        className={cn(clientDialogSurface, "sm:max-w-2xl")}
      >
        <DialogHeader className={clientDialogHeaderClass}>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-base font-semibold tracking-tight">
                {mode === "create" ? "Nuevo rol" : "Permisos del rol"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {loading ? (
                  "Cargando permisos disponibles…"
                ) : mode === "create" ? (
                  <>
                    Definí el nombre y qué secciones puede usar este rol.{" "}
                    {selectedCount} de {totalCount} permisos seleccionados.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {displayName || "—"}
                    </span>
                    {" · "}
                    {selectedCount} de {totalCount} permisos activos
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className={clientDialogBodyClass}>
          {mode === "create" ? (
            <div className="mb-4 space-y-2">
              <Label htmlFor="hr-role-display-name">Nombre del rol</Label>
              <Input
                id="hr-role-display-name"
                value={displayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
                placeholder="Ej. Mozos, Encargado, Cocina…"
                className="bg-background"
                autoFocus
              />
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Obteniendo catálogo de permisos…
            </div>
          ) : sections.length === 0 ? (
            <p className="py-6 text-sm leading-relaxed text-muted-foreground">
              No hay permisos configurados en la app.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Marcá qué pantallas y acciones puede usar una persona con este
                rol. Podés activar una sección completa con el checkbox del
                encabezado.
              </p>
              {sections.map((section) => {
                const keys = sectionGrantKeys(section)
                const allOn = keys.every((k) => selectedKeys.includes(k))
                const someOn =
                  !allOn && keys.some((k) => selectedKeys.includes(k))

                return (
                  <section
                    key={section.pageKey}
                    className="overflow-hidden rounded-xl border border-border/70 bg-muted/15"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-muted/25 px-4 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Checkbox
                          id={`hr-sec-${section.pageKey}`}
                          checked={
                            allOn ? true : someOn ? "indeterminate" : false
                          }
                          onCheckedChange={(checked) =>
                            onToggleSection(keys, checked === true)
                          }
                          aria-label={`Todos los permisos de ${section.label}`}
                        />
                        <label
                          htmlFor={`hr-sec-${section.pageKey}`}
                          className="cursor-pointer text-sm font-semibold text-foreground"
                        >
                          {section.label}
                        </label>
                      </div>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {keys.filter((k) => selectedKeys.includes(k)).length}/
                        {keys.length}
                      </span>
                    </div>
                    <ul className="divide-y divide-border/40">
                      {section.permissions.map((p) => {
                        const id = `perm-${p.key.replace(/:/g, "-")}`
                        const row =
                          permissions.find((c) => c.key === p.key) ?? p
                        return (
                          <li key={p.key}>
                            <label
                              htmlFor={id}
                              className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                            >
                              <Checkbox
                                id={id}
                                checked={selectedKeys.includes(p.key)}
                                onCheckedChange={() => onToggleKey(p.key)}
                                className="mt-0.5"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-foreground">
                                  {row.actionLabel ?? p.actionLabel}
                                </span>
                                {(row.description ?? p.description) ? (
                                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                    {row.description ?? p.description}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className={clientDialogFooterClass}>
          <Button
            type="button"
            variant="outline"
            disabled={saving || loading}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            className="gap-2"
            onClick={onSave}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Guardando…
              </>
            ) : mode === "create" ? (
              "Crear rol"
            ) : (
              "Guardar permisos"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Catálogo completo para abrir el modal de creación sin round-trip al servidor. */
export function hrCreateRolePermissionCatalog(): PermissionCatalogRow[] {
  return buildHrPermissionCatalogRows()
}
