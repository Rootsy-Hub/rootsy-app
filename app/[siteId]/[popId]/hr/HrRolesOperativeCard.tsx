"use client"

import type { PopRoleRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { dataWorkspaceEntityCardLosetaSurfaceClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDangerSubtleButton,
  RootsDefaultButton,
} from "@/components/rootsy-button"
import { cn } from "@/lib/utils"

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

function roleMetaLine(item: HrOperativeRoleRow): string {
  const people =
    item.peopleCount === 1
      ? "1 persona"
      : `${item.peopleCount} personas`
  if (!item.role.popId) return `${people} · Plantilla de Rootsy`
  if (item.permissionGranted == null) return people
  return `${people} · ${item.permissionGranted} de ${item.permissionTotal} permisos`
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
                  <p className="mt-0.5 font-canopy text-xs leading-snug text-rootsy-bruma-500">
                    {roleMetaLine(item)}
                  </p>
                </div>
                {canEditRole ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <RootsDefaultButton
                      type="button"
                      size="compact"
                      disabled={editBusy}
                      onClick={() => onEdit?.(item.role)}
                    >
                      Editar
                    </RootsDefaultButton>
                    <RootsDangerSubtleButton
                      type="button"
                      size="compact"
                      disabled={deleteBusy || editBusy}
                      onClick={() => onDelete?.(item.role)}
                    >
                      Eliminar
                    </RootsDangerSubtleButton>
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
