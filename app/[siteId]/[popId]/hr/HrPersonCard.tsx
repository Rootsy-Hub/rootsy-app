"use client"

import type { EmployeeRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  dataWorkspaceLightDropdownContentClass,
  dataWorkspaceLightDropdownSeparatorClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import {
  dataWorkspaceEntityCardActionFooterClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardMenuTriggerClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusClosedClass,
  dataWorkspaceEntityCardStatusInactiveClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsDefaultButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { DoorClosed, DoorOpen, KeyRound, MoreVertical, NotebookPen, UserRound } from "lucide-react"

const salaryFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function personDisplayName(person: EmployeeRow): string {
  return `${person.firstName} ${person.lastName}`.trim() || "Sin nombre"
}

function personInitials(person: EmployeeRow): string {
  const first = (person.firstName || person.lastName || "?").slice(0, 1).toUpperCase()
  const last = person.lastName ? person.lastName.slice(0, 1).toUpperCase() : ""
  return `${first}${last}`.slice(0, 2)
}

function formatHired(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatClockedIn(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function PersonStatus({
  person,
  isOwner,
}: {
  person: EmployeeRow
  isOwner: boolean
}) {
  if (person.leftAt) {
    return (
      <span className={dataWorkspaceEntityCardStatusInactiveClass}>Ya no trabaja</span>
    )
  }
  if (person.isClockedIn) {
    return (
      <span className={dataWorkspaceEntityCardStatusOpenClass}>
        <span
          className="size-1.5 rounded-full bg-[var(--rootsy-savia-600)]"
          aria-hidden
        />
        En el local
      </span>
    )
  }
  if (isOwner) {
    return <span className={dataWorkspaceEntityCardStatusOpenClass}>Dueño</span>
  }
  if (person.userId) {
    return <span className={dataWorkspaceEntityCardStatusClosedClass}>Usa Rootsy</span>
  }
  return <span className={dataWorkspaceEntityCardStatusClosedClass}>Sin Rootsy</span>
}

function MenuTrigger({
  label,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      className={dataWorkspaceEntityCardMenuTriggerClass}
      aria-label={label}
      {...props}
    >
      <MoreVertical className="size-4" aria-hidden />
    </button>
  )
}

type Props = {
  person: EmployeeRow
  imageUrl?: string | null
  isOwner: boolean
  canManagePeople: boolean
  canManageInvites: boolean
  clockBusy: boolean
  onOpen: () => void
  onClock: () => void
  onInvite: () => void
  onLeave: () => void
}

export function HrPersonCard({
  person,
  imageUrl,
  isOwner,
  canManagePeople,
  canManageInvites,
  clockBusy,
  onOpen,
  onClock,
  onInvite,
  onLeave,
}: Props) {
  const name = personDisplayName(person)
  const salary =
    person.monthlySalary == null ? "—" : salaryFmt.format(person.monthlySalary)
  const showClock = canManagePeople && !person.leftAt
  const showInvite = canManageInvites && !person.userId && !person.leftAt
  const showLeave = canManagePeople && !person.leftAt && !isOwner
  const showMenu = canManagePeople || showInvite

  return (
    <article className={dataWorkspaceEntityCardLosetaClass}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className={cn(dataWorkspaceEntityCardIsotypeClass, "object-cover")}
              />
            ) : (
              <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
                {personInitials(person) ? (
                  <span className="font-canopy text-xs font-semibold">
                    {personInitials(person)}
                  </span>
                ) : (
                  <UserRound className="size-5" strokeWidth={1.75} />
                )}
              </span>
            )}
            <div className="relative min-w-0 flex-1">
              <div className="absolute right-0 top-0">
                <PersonStatus person={person} isOwner={isOwner} />
              </div>
              <p
                className={cn(
                  dataWorkspaceEntityCardEyebrowClass,
                  "truncate pr-28",
                )}
              >
                {person.jobTitle || "En el negocio"}
              </p>
              <h3
                className={cn(
                  "mt-0.5 truncate pr-28",
                  dataWorkspaceEntityCardTitleClass,
                )}
              >
                {name}
              </h3>
              <p className="mt-0.5 truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                {person.hiredAt
                  ? `Desde ${formatHired(person.hiredAt)}`
                  : person.documentNumber || "Falta CUIL"}
              </p>
            </div>
            {showMenu ? (
              <div
                className="-mr-1 shrink-0"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <RootsDropdownMenu modal={false}>
                  <RootsDropdownTrigger asChild>
                    <MenuTrigger label={`Opciones de ${name}`} />
                  </RootsDropdownTrigger>
                  <RootsDropdownContent
                    theme="light"
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    collisionPadding={{ right: 16 }}
                    className={cn(dataWorkspaceLightDropdownContentClass, "z-[120]")}
                  >
                    {canManagePeople ? (
                      <RootsDropdownItem theme="light" onSelect={onOpen}>
                        <NotebookPen className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Ver datos</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showInvite ? (
                      <RootsDropdownItem theme="light" onSelect={onInvite}>
                        <KeyRound className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Dar acceso a Rootsy</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showLeave ? (
                      <>
                        <RootsDropdownSeparator
                          theme="light"
                          className={dataWorkspaceLightDropdownSeparatorClass}
                        />
                        <RootsDropdownItem
                          theme="light"
                          variant="destructive"
                          onSelect={onLeave}
                        >
                          <DoorClosed className="size-4 shrink-0 opacity-70" aria-hidden />
                          <span>Deja el negocio</span>
                        </RootsDropdownItem>
                      </>
                    ) : null}
                  </RootsDropdownContent>
                </RootsDropdownMenu>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)] focus-visible:ring-offset-2"
        >
          <div className={dataWorkspaceEntityCardSaldoSectionClass}>
            <p className={dataWorkspaceEntityCardStatLabelClass}>Sueldo</p>
            <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
              {salary}
            </p>
          </div>
        </button>

        <div className="mt-auto">
          <div className={dataWorkspaceEntityCardActionFooterClass}>
            <div className="min-w-0">
              <p className={dataWorkspaceEntityCardStatLabelClass}>
                {person.isClockedIn ? "Llegó" : "CUIL"}
              </p>
              <p
                className={cn(
                  "mt-1 text-base sm:text-lg",
                  dataWorkspaceEntityCardStatValueClass,
                )}
              >
                {person.isClockedIn && person.clockedInAt
                  ? formatClockedIn(person.clockedInAt)
                  : person.documentNumber || "—"}
              </p>
            </div>
            {showClock ? (
              <RootsDefaultButton
                type="button"
                size="sm"
                disabled={clockBusy}
                className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
                onClick={onClock}
              >
                {person.isClockedIn ? (
                  <DoorClosed className="size-3.5" aria-hidden />
                ) : (
                  <DoorOpen className="size-3.5" aria-hidden />
                )}
                {person.isClockedIn ? "Salió" : "Llegó"}
              </RootsDefaultButton>
            ) : person.leftAt ? (
              <p className="font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                Quedó en el historial
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
