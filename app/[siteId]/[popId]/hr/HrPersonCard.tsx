"use client"

import type { PendingInviteRow } from "@/app/[siteId]/[popId]/hr/actions"
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
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsDefaultButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  DoorClosed,
  DoorOpen,
  KeyRound,
  Link2,
  Mail,
  MoreVertical,
  NotebookPen,
  RotateCw,
  Shield,
  Store,
  Undo2,
  UserRound,
  UserX,
  X,
} from "lucide-react"

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

function RootsyIsologoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="6.2 4.2 14.8 17.2"
      className={className}
      aria-hidden
    >
      <path
        d="M10.2897 9.08666L14.6783 9.08699C15.3604 9.08618 16.541 9.04939 17.1809 9.12754C17.5977 9.17479 18.0036 9.29222 18.3813 9.4748C20.2766 10.3908 20.9666 12.5773 20.0872 14.4721C19.7013 15.3037 18.8708 16.0592 17.999 16.3548C18.7875 17.6943 19.6435 19.0895 20.4595 20.4144C19.3463 20.3881 18.1157 20.4131 16.9936 20.4133C16.8667 20.1572 16.5354 19.647 16.3779 19.3883L15.1672 17.3987C15.0094 17.1356 14.8398 16.8634 14.7005 16.5914C14.3066 16.5894 13.9127 16.5913 13.5189 16.5971L13.5182 20.4109C12.9187 20.4145 12.3168 20.4188 11.7183 20.4178C11.2985 20.4147 10.9398 20.3499 10.636 20.033C10.2448 19.6247 10.2979 19.1174 10.2931 18.5969C10.2897 18.226 10.2925 17.8536 10.2925 17.4822C10.2881 16.2376 10.2915 14.993 10.3027 13.7485L14.5012 13.7448C15.1341 13.7448 15.8006 13.7638 16.4308 13.7211C16.8598 13.692 17.2028 13.2822 17.2074 12.8515C17.2104 12.635 17.1259 12.4264 16.9731 12.273C16.5573 11.8607 15.9225 11.9816 15.2934 11.9816C13.8436 11.9816 12.2637 12.0739 11.0375 11.16C10.447 10.5274 10.2776 9.91652 10.2897 9.08666Z"
        fill="currentColor"
      />
      <path
        d="M9.05781 9.00484C7.48913 7.83614 7.5951 6.22579 7.84417 5.5667C8.00875 5.47691 8.08034 5.9148 8.09556 6.14497C8.29611 7.06062 8.68973 7.59096 9.05781 7.91336C9.45199 8.25862 9.37135 8.12781 9.37135 8.03219C9.37135 7.8632 9.42292 7.55405 9.62178 7.55405C9.65823 7.55405 9.60117 7.619 9.62178 7.76822C9.65257 7.99117 9.8696 8.48227 10.0407 8.10702C10.2547 7.63795 10.185 7.09788 10.1469 6.61686C10.1163 6.23204 10.2842 6.35327 10.372 6.46199C10.4765 6.64701 10.6891 7.23504 10.7035 8.10702C10.718 8.97899 11.1425 9.62935 11.353 9.84553L10.4232 10.136C10.0357 9.744 10.1058 9.78562 9.05781 9.00484Z"
        fill="currentColor"
      />
    </svg>
  )
}

function StatusIcon({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="inline-flex size-6 items-center justify-center text-[var(--rootsy-bruma-900)] outline-none"
          aria-label={label}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent variant="dark" side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function PersonStatus({
  person,
  isOwner,
  pendingInvite,
}: {
  person: EmployeeRow
  isOwner: boolean
  pendingInvite: boolean
}) {
  if (person.leftAt) {
    return (
      <StatusIcon label="Ya no trabaja">
        <DoorClosed className="size-3.5 text-[var(--rootsy-bruma-500)]" strokeWidth={1.85} />
      </StatusIcon>
    )
  }

  const showClockedIn = person.isClockedIn
  const showUsesRootsy = Boolean(person.userId)
  const showPending = pendingInvite && !showUsesRootsy
  const showOwnerPill = isOwner && !showClockedIn && !showUsesRootsy && !showPending

  if (!showClockedIn && !showUsesRootsy && !showOwnerPill && !showPending) return null

  return (
    <div className="flex items-center justify-end gap-0.5">
      {showClockedIn ? (
        <StatusIcon label="En el local">
          <Store className="size-3.5 text-[var(--rootsy-savia-700)]" strokeWidth={1.85} />
        </StatusIcon>
      ) : null}
      {showUsesRootsy ? (
        <StatusIcon label="Usa Rootsy">
          <RootsyIsologoIcon className="size-3.5 text-[var(--rootsy-bruma-900)]" />
        </StatusIcon>
      ) : null}
      {showPending ? (
        <StatusIcon label="Invitación pendiente">
          <Mail className="size-3.5 text-[var(--rootsy-bruma-900)]" strokeWidth={1.85} />
        </StatusIcon>
      ) : null}
      {showOwnerPill ? (
        <span className={dataWorkspaceEntityCardStatusOpenClass}>Dueño</span>
      ) : null}
    </div>
  )
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
  rootsyRole?: string | null
  pendingInvite?: PendingInviteRow | null
  canManagePeople: boolean
  canManageInvites: boolean
  clockBusy: boolean
  inviteBusy?: boolean
  detailHref: string
  onOpen: () => void
  onClock: () => void
  onInvite: () => void
  onCopyInvite?: () => void
  onRenewInvite?: () => void
  onRevokeInvite?: () => void
  onChangeRole?: () => void
  onRevokeAccess?: () => void
  onLeave: () => void
  onReturn?: () => void
}

export function HrPersonCard({
  person,
  imageUrl,
  isOwner,
  rootsyRole,
  pendingInvite = null,
  canManagePeople,
  canManageInvites,
  clockBusy,
  inviteBusy = false,
  detailHref,
  onOpen,
  onClock,
  onInvite,
  onCopyInvite,
  onRenewInvite,
  onRevokeInvite,
  onChangeRole,
  onRevokeAccess,
  onLeave,
  onReturn,
}: Props) {
  const name = personDisplayName(person)
  const salary =
    person.monthlySalary == null ? "—" : salaryFmt.format(person.monthlySalary)
  const showClock = canManagePeople && !person.leftAt
  const hasEmail = Boolean(person.email?.trim())
  const showInvite =
    canManageInvites && !person.userId && !person.leftAt && !pendingInvite && hasEmail
  const showInviteNeedsEmail =
    canManageInvites && !person.userId && !person.leftAt && !pendingInvite && !hasEmail
  const showPendingInvite = Boolean(pendingInvite) && canManageInvites && !person.userId
  const inviteExpired = pendingInvite
    ? new Date(pendingInvite.expiresAt).getTime() < Date.now()
    : false
  const showChangeRole = Boolean(onChangeRole) && canManageInvites && !isOwner
  const showRevokeAccess = Boolean(onRevokeAccess) && canManageInvites && !isOwner
  const showLeave = canManagePeople && !person.leftAt && !isOwner
  const showReturn = canManagePeople && Boolean(person.leftAt)
  const showMenu =
    canManagePeople ||
    showInvite ||
    showInviteNeedsEmail ||
    showPendingInvite ||
    showChangeRole ||
    showRevokeAccess ||
    showReturn
  const metaLine = person.leftAt
    ? "Quedó en el historial"
    : pendingInvite
      ? inviteExpired
        ? "Invitación vencida"
        : `Invitación pendiente · ${pendingInvite.roleDisplayName}`
      : rootsyRole
        ? `Rootsy · ${rootsyRole}`
        : person.hiredAt
          ? `Desde ${formatHired(person.hiredAt)}`
          : person.documentNumber || "Falta CUIL"

  return (
    <article className={dataWorkspaceEntityCardLosetaClass}>
      <Link
        href={detailHref}
        className="flex min-h-0 flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)] focus-visible:ring-offset-2"
      >
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
                <PersonStatus
                  person={person}
                  isOwner={isOwner}
                  pendingInvite={Boolean(pendingInvite)}
                />
              </div>
              <p
                className={cn(
                  dataWorkspaceEntityCardEyebrowClass,
                  "truncate pr-14",
                )}
              >
                {person.jobTitle || "En el local"}
              </p>
              <h3
                className={cn(
                  "mt-0.5 truncate pr-14",
                  dataWorkspaceEntityCardTitleClass,
                )}
              >
                {name}
              </h3>
              <p className="mt-0.5 truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                {metaLine}
              </p>
            </div>
            {showMenu ? (
              <div
                className="-mr-1 shrink-0"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
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
                        <span>Editar datos</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showInvite ? (
                      <RootsDropdownItem theme="light" onSelect={onInvite}>
                        <KeyRound className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Dar acceso a Rootsy</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showInviteNeedsEmail ? (
                      <RootsDropdownItem theme="light" onSelect={onOpen}>
                        <KeyRound className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Cargá el correo para dar acceso</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showPendingInvite && pendingInvite?.inviteUrl && onCopyInvite ? (
                      <RootsDropdownItem theme="light" onSelect={onCopyInvite}>
                        <Link2 className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Copiar enlace</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showPendingInvite && inviteExpired && onRenewInvite ? (
                      <RootsDropdownItem
                        theme="light"
                        disabled={inviteBusy}
                        onSelect={onRenewInvite}
                      >
                        <RotateCw className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Renovar invitación</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showPendingInvite && onRevokeInvite ? (
                      <RootsDropdownItem
                        theme="light"
                        variant="destructive"
                        disabled={inviteBusy}
                        onSelect={onRevokeInvite}
                      >
                        <X className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Cancelar invitación</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showChangeRole ? (
                      <RootsDropdownItem
                        theme="light"
                        onSelect={() => onChangeRole?.()}
                      >
                        <Shield className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Cambiar rol de Rootsy</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showRevokeAccess ? (
                      <RootsDropdownItem
                        theme="light"
                        onSelect={() => onRevokeAccess?.()}
                      >
                        <UserX className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Quitar acceso a Rootsy</span>
                      </RootsDropdownItem>
                    ) : null}
                    {showReturn ? (
                      <RootsDropdownItem
                        theme="light"
                        onSelect={() => onReturn?.()}
                      >
                        <Undo2 className="size-4 shrink-0 opacity-70" aria-hidden />
                        <span>Volver al equipo</span>
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
                          <span>Ya no trabaja acá</span>
                        </RootsDropdownItem>
                      </>
                    ) : null}
                  </RootsDropdownContent>
                </RootsDropdownMenu>
              </div>
            ) : null}
          </div>
        </div>

        <div className={cn("min-w-0 flex-1", dataWorkspaceEntityCardSaldoSectionClass)}>
          <p className={dataWorkspaceEntityCardStatLabelClass}>Sueldo</p>
          <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
            {salary}
          </p>
        </div>
      </Link>

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
            ) : showReturn ? (
              <RootsDefaultButton
                type="button"
                size="sm"
                className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
                onClick={() => onReturn?.()}
              >
                <Undo2 className="size-3.5" aria-hidden />
                Volver
              </RootsDefaultButton>
            ) : person.leftAt ? (
              <p className="font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                Quedó en el historial
              </p>
            ) : null}
          </div>
        </div>
    </article>
  )
}
