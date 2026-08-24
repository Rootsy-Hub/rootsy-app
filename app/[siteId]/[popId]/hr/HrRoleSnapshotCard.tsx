"use client"

import type { MemberRow, PopRoleRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSelfClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  RootsDangerSubtleButton,
  RootsDefaultButton,
} from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { UserRound } from "lucide-react"

function memberDisplayName(member: MemberRow): string {
  return `${member.firstName} ${member.lastName}`.trim() || "Sin nombre"
}

function memberInitials(member: MemberRow): string {
  const first = (member.firstName || member.lastName || "?").slice(0, 1).toUpperCase()
  const last = member.lastName ? member.lastName.slice(0, 1).toUpperCase() : ""
  return `${first}${last}`.slice(0, 2)
}

type Props = {
  role: PopRoleRow
  members: MemberRow[]
  permissionGranted: number | null
  permissionTotal: number
  selected?: boolean
  currentUserId?: string | null
  canManage: boolean
  editBusy?: boolean
  deleteBusy?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

const VISIBLE_PEOPLE = 6

export function HrRoleSnapshotCard({
  role,
  members,
  permissionGranted,
  permissionTotal,
  selected = false,
  currentUserId,
  canManage,
  editBusy = false,
  deleteBusy = false,
  onEdit,
  onDelete,
}: Props) {
  const visible = members.slice(0, VISIBLE_PEOPLE)
  const extra = Math.max(0, members.length - visible.length)
  const canEdit = canManage && Boolean(role.popId) && onEdit

  const body = (
    <>
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h3 className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
            {role.displayName}
          </h3>
          <p className={cn(dataWorkspaceEntityCardEyebrowClass, "mt-0.5")}>
            {permissionGranted == null
              ? role.popId
                ? "Permisos"
                : "Plantilla de Rootsy"
              : `${permissionGranted}/${permissionTotal} permisos`}
          </p>
        </div>
      </div>

      <ul className="space-y-2 px-4 py-3">
        {visible.length === 0 ? (
          <li className="font-canopy text-xs text-rootsy-bruma-500">
            Nadie con este rol todavía.
          </li>
        ) : (
          visible.map((member) => {
            const isSelf = Boolean(
              currentUserId && member.userId === currentUserId,
            )
            return (
              <li key={member.userId} className="flex min-w-0 items-center gap-2">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt=""
                    className="size-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-rootsy-bruma-100 font-canopy text-[10px] font-semibold text-rootsy-bruma-700"
                    aria-hidden
                  >
                    {memberInitials(member) || (
                      <UserRound className="size-3.5" strokeWidth={1.75} />
                    )}
                  </span>
                )}
                <span className="min-w-0 truncate font-canopy text-sm text-rootsy-bruma-900">
                  {memberDisplayName(member)}
                  {isSelf ? (
                    <span className="text-rootsy-savia-800"> · vos</span>
                  ) : null}
                </span>
              </li>
            )
          })
        )}
        {extra > 0 ? (
          <li className="font-canopy text-xs text-rootsy-bruma-500">
            +{extra} más
          </li>
        ) : null}
      </ul>
    </>
  )

  return (
    <article
      className={cn(
        dataWorkspaceEntityCardLosetaSurfaceClass,
        "h-auto",
        selected && dataWorkspaceEntityCardLosetaSelfClass,
      )}
    >
      <div
        className={canEdit ? "cursor-pointer" : undefined}
        onClick={canEdit && !editBusy ? onEdit : undefined}
      >
        {body}
      </div>

      {canEdit ? (
        <div className="flex items-center justify-end gap-2 border-t border-rootsy-bruma-200 px-4 py-3">
          <RootsDefaultButton
            type="button"
            size="compact"
            disabled={editBusy}
            onClick={onEdit}
          >
            Editar
          </RootsDefaultButton>
          {onDelete ? (
            <RootsDangerSubtleButton
              type="button"
              size="compact"
              disabled={deleteBusy}
              onClick={onDelete}
            >
              Eliminar
            </RootsDangerSubtleButton>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
