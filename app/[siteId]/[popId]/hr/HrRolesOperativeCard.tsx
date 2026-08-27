"use client"

import type { PopRoleRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { RootsIconButton } from "@/components/rootsy-button"
import { dataWorkspaceEntityCardLosetaSurfaceClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { Pencil, Trash2, UserRound } from "lucide-react"

export type HrOperativeRoleRow = {
  role: PopRoleRow
  peopleCount: number
  permissionGranted: number | null
  permissionTotal: number
}

type Props = {
  roles: HrOperativeRoleRow[]
  canManage: boolean
  editBusy?: boolean
  deleteBusy?: boolean
  onEdit?: (role: PopRoleRow) => void
  onDelete?: (role: PopRoleRow) => void
}

function RoleMeta({ item }: { item: HrOperativeRoleRow }) {
  const peopleLabel =
    item.peopleCount === 1
      ? "1 persona"
      : `${item.peopleCount} personas`
  const permissionsLabel =
    item.permissionGranted == null
      ? null
      : `${item.permissionGranted}/${item.permissionTotal} permisos`
  const templateLabel = item.role.popId ? null : "Plantilla de Rootsy"

  return (
    <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 font-canopy text-xs leading-snug text-rootsy-bruma-500">
      <span className="inline-flex items-center gap-1" title={peopleLabel}>
        <UserRound className="size-3.5" strokeWidth={1.75} aria-hidden />
        <span className="tabular-nums">{item.peopleCount}</span>
        <span className="sr-only">{peopleLabel}</span>
      </span>
      {permissionsLabel ? (
        <>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{permissionsLabel}</span>
        </>
      ) : null}
      {templateLabel ? (
        <>
          <span aria-hidden>·</span>
          <span>{templateLabel}</span>
        </>
      ) : null}
    </p>
  )
}

export function HrRolesOperativeCard({
  roles,
  canManage,
  editBusy = false,
  deleteBusy = false,
  onEdit,
  onDelete,
}: Props) {
  return (
    <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}>
      {roles.length === 0 ? (
        <p className="px-4 py-6 font-canopy text-sm text-rootsy-bruma-500">
          No hay roles cargados.
        </p>
      ) : (
        <ul className="divide-y divide-rootsy-bruma-200">
          {roles.map((item) => {
            const canEditRole = canManage && Boolean(item.role.popId)
            return (
              <li
                key={item.role.id}
                className="flex items-start justify-between gap-2 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
                    {item.role.displayName}
                  </p>
                  <RoleMeta item={item} />
                </div>
                {canEditRole ? (
                  <div className="flex shrink-0 items-center gap-0.5">
                    <RootsIconButton
                      type="button"
                      label={`Editar ${item.role.displayName}`}
                      tone="action"
                      intent="edit"
                      size="compact"
                      disabled={editBusy}
                      onClick={() => onEdit?.(item.role)}
                    >
                      <Pencil />
                    </RootsIconButton>
                    <RootsIconButton
                      type="button"
                      label={`Eliminar ${item.role.displayName}`}
                      tone="action"
                      intent="destructive"
                      size="compact"
                      disabled={deleteBusy || editBusy}
                      onClick={() => onDelete?.(item.role)}
                    >
                      <Trash2 />
                    </RootsIconButton>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
