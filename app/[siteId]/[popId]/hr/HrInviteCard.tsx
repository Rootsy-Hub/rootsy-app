"use client"

import type { PendingInviteRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  dataWorkspaceLightDropdownContentClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
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
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsDefaultButton, rootsButtonCompactSizeClass } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { Link2, Mail, MoreVertical, RotateCw, X } from "lucide-react"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
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
  invite: PendingInviteRow
  revokeBusy: boolean
  renewBusy?: boolean
  onCopy: () => void
  onRevoke: () => void
  onRenew?: () => void
}

export function HrInviteCard({
  invite,
  revokeBusy,
  renewBusy = false,
  onCopy,
  onRevoke,
  onRenew,
}: Props) {
  const expired = new Date(invite.expiresAt).getTime() < Date.now()

  return (
    <article className={dataWorkspaceEntityCardLosetaClass}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-3">
            <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
              <Mail className="size-5" strokeWidth={1.75} />
            </span>
            <div className="relative min-w-0 flex-1">
              <div className="absolute right-0 top-0">
                <span
                  className={
                    expired
                      ? dataWorkspaceEntityCardStatusInactiveClass
                      : dataWorkspaceEntityCardStatusClosedClass
                  }
                >
                  {expired ? "Vencida" : "Esperando"}
                </span>
              </div>
              <p
                className={cn(
                  dataWorkspaceEntityCardEyebrowClass,
                  "truncate pr-24",
                )}
              >
                {invite.roleDisplayName}
              </p>
              <h3
                className={cn(
                  "mt-0.5 truncate pr-24",
                  dataWorkspaceEntityCardTitleClass,
                )}
              >
                {invite.email}
              </h3>
              <p className="mt-0.5 truncate font-canopy text-xs text-[var(--rootsy-bruma-500)]">
                Acceso a Rootsy
              </p>
            </div>
            <div
              className="-mr-1 shrink-0"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <RootsDropdownMenu modal={false}>
                <RootsDropdownTrigger asChild>
                  <MenuTrigger label={`Opciones de ${invite.email}`} />
                </RootsDropdownTrigger>
                <RootsDropdownContent
                  theme="light"
                  align="end"
                  side="bottom"
                  sideOffset={8}
                  collisionPadding={{ right: 16 }}
                  className={cn(dataWorkspaceLightDropdownContentClass, "z-[120]")}
                >
                  {expired && onRenew ? (
                    <RootsDropdownItem
                      theme="light"
                      disabled={renewBusy}
                      onSelect={onRenew}
                    >
                      <RotateCw className="size-4 shrink-0 opacity-70" aria-hidden />
                      <span>Renovar 7 días</span>
                    </RootsDropdownItem>
                  ) : null}
                  <RootsDropdownItem
                    theme="light"
                    variant="destructive"
                    disabled={revokeBusy}
                    onSelect={onRevoke}
                  >
                    <X className="size-4 shrink-0 opacity-70" aria-hidden />
                    <span>Revocar</span>
                  </RootsDropdownItem>
                </RootsDropdownContent>
              </RootsDropdownMenu>
            </div>
          </div>
        </div>

        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <p className={dataWorkspaceEntityCardStatLabelClass}>
            {expired ? "Venció" : "Vence"}
          </p>
          <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>
            {formatDate(invite.expiresAt)}
          </p>
        </div>

        <div className="mt-auto">
          <div className={dataWorkspaceEntityCardActionFooterClass}>
            <p
              className={cn(
                "min-w-0 truncate text-base",
                dataWorkspaceEntityCardStatValueClass,
              )}
            >
              {expired ? "Ya no sirve" : "Listo para compartir"}
            </p>
            {expired && onRenew ? (
              <RootsDefaultButton
                type="button"
                size="sm"
                disabled={renewBusy}
                className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
                onClick={onRenew}
              >
                <RotateCw className="size-3.5" aria-hidden />
                Renovar
              </RootsDefaultButton>
            ) : invite.inviteUrl ? (
              <RootsDefaultButton
                type="button"
                size="sm"
                className={cn(rootsButtonCompactSizeClass, "shrink-0 gap-1.5 px-3 text-xs")}
                onClick={onCopy}
              >
                <Link2 className="size-3.5" aria-hidden />
                Copiar
              </RootsDefaultButton>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
