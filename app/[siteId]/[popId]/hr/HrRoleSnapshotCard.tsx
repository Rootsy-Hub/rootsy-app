"use client"

import type { PopRoleRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import { UserRound } from "lucide-react"

export type HrRoleSnapshotPerson = {
  userId: string
  firstName: string
  lastName: string
  imageUrl: string | null
  jobTitle: string | null
}

type Props = {
  role: PopRoleRow
  people: HrRoleSnapshotPerson[]
  currentUserId?: string | null
}

function personDisplayName(person: HrRoleSnapshotPerson): string {
  return `${person.firstName} ${person.lastName}`.trim() || "Sin nombre"
}

function personInitials(person: HrRoleSnapshotPerson): string {
  const first = (person.firstName || person.lastName || "?").slice(0, 1).toUpperCase()
  const last = person.lastName ? person.lastName.slice(0, 1).toUpperCase() : ""
  return `${first}${last}`.slice(0, 2)
}

export function HrRoleSnapshotCard({
  role,
  people,
  currentUserId,
}: Props) {
  return (
    <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}>
      <div className="px-4 pt-4">
        <h3 className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
          {role.displayName}
        </h3>
      </div>

      <ul className="space-y-3 px-4 py-3">
        {people.length === 0 ? (
          <li className="font-canopy text-xs text-rootsy-bruma-500">
            Nadie con este rol todavía.
          </li>
        ) : (
          people.map((person) => {
            const isSelf = Boolean(
              currentUserId && person.userId === currentUserId,
            )
            return (
              <li key={person.userId} className="flex min-w-0 items-center gap-2.5">
                {person.imageUrl ? (
                  <img
                    src={person.imageUrl}
                    alt=""
                    className="size-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-rootsy-bruma-100 font-canopy text-[10px] font-semibold text-rootsy-bruma-700"
                    aria-hidden
                  >
                    {personInitials(person) || (
                      <UserRound className="size-3.5" strokeWidth={1.75} />
                    )}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-canopy text-sm font-semibold text-rootsy-bruma-900">
                    {personDisplayName(person)}
                    {isSelf ? (
                      <span className="font-medium text-rootsy-savia-800">
                        {" "}
                        · vos
                      </span>
                    ) : null}
                  </p>
                  <p className={cn(dataWorkspaceEntityCardEyebrowClass, "mt-0.5 truncate")}>
                    {person.jobTitle || "En el local"}
                  </p>
                </div>
              </li>
            )
          })
        )}
      </ul>
    </article>
  )
}
