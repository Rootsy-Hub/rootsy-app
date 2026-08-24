"use client"

import type { PopRoleRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDangerSubtleButton,
  RootsDefaultButton,
} from "@/components/rootsy-button"
import { cn } from "@/lib/utils"

type Props = {
  roles: PopRoleRow[]
  canManage: boolean
  editBusy?: boolean
  deleteBusy?: boolean
  onCreate?: () => void
  onEdit?: (role: PopRoleRow) => void
  onDelete?: (role: PopRoleRow) => void
}

export function HrRolesOperativeCard({
  roles,
  canManage,
  editBusy = false,
  deleteBusy = false,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  return (
    <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}>
      {canManage && onCreate ? (
        <div className="flex items-center border-b border-rootsy-bruma-200 px-4 py-3">
          <RootsDefaultButton
            type="button"
            size="compact"
            disabled={editBusy}
            onClick={onCreate}
          >
            Nuevo rol
          </RootsDefaultButton>
        </div>
      ) : null}

      {roles.length === 0 ? (
        <p className="px-4 py-6 font-canopy text-sm text-rootsy-bruma-500">
          No hay roles cargados.
        </p>
      ) : (
        <ul className="divide-y divide-rootsy-bruma-200">
          {roles.map((role) => {
            const canEditRole = canManage && Boolean(role.popId)
            return (
              <li key={role.id} className="space-y-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
                    {role.displayName}
                  </p>
                  {!role.popId ? (
                    <p className={cn(dataWorkspaceEntityCardEyebrowClass, "mt-0.5")}>
                      Plantilla de Rootsy
                    </p>
                  ) : null}
                </div>
                {canEditRole ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <RootsDefaultButton
                      type="button"
                      size="compact"
                      disabled={editBusy}
                      onClick={() => onEdit?.(role)}
                    >
                      Editar
                    </RootsDefaultButton>
                    <RootsDangerSubtleButton
                      type="button"
                      size="compact"
                      disabled={deleteBusy || editBusy}
                      onClick={() => onDelete?.(role)}
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
