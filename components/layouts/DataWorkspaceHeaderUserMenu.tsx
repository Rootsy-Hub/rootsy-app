"use client"

import {
  menuGhostBarClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { Avatar } from "@/components/Avatar"
import {
  dataWorkspaceHeaderDropdownLogoutItemClass,
  dataWorkspaceHeaderDropdownSeparatorClassForVariant,
  dataWorkspaceHeaderUserDropdownContentClassForVariant,
  isDarkChromeHeader,
  isDataWorkspaceTintedHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import type { RootsIconButtonSize } from "@/components/rootsy-button/rootsButtonStyles"
import {
  eterHeaderBodyClass,
  eterHeaderMutedClass,
} from "@/lib/eter/eterChrome"
import { initialsFromPopName } from "@/lib/popIdentityDisplay"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { RootsImageLightbox } from "@/components/rootsy-lightbox/RootsImageLightbox"
import { useAuth } from "@/context/AuthContextSupabase"
import { ApprovalCodeDialog } from "@/components/pop-workspace/ApprovalCodeDialog"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { cn } from "@/lib/utils"
import { ImageIcon, KeyRound, LogOut, UserCog } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export type DataWorkspaceHeaderUserMenuProps = {
  userName: string
  userAvatarSrc?: string | null
  isOnline: boolean
  headerVariant?: DataWorkspaceHeaderVariant
  /** `default` = menú (space.500) · `compact` = workspace (space.400). */
  size?: RootsIconButtonSize
  roleLabel?: string
  hasResolvedRole?: boolean
  /** Rol del POP todavía no llegó: barra fantasma en la segunda línea. */
  rolePending?: boolean
  /** Si es false, solo el avatar — útil en headers compactos. */
  showIdentity?: boolean
  pending?: boolean
}

export function DataWorkspaceHeaderUserMenu({
  userName,
  userAvatarSrc,
  isOnline,
  headerVariant = "default",
  size = "default",
  roleLabel,
  rolePending = false,
  showIdentity = true,
  pending = false,
}: DataWorkspaceHeaderUserMenuProps) {
  const isTinted = isDataWorkspaceTintedHeader(headerVariant)
  const theme = isDarkChromeHeader(headerVariant) ? "dark" : "light"
  const { logOut } = useAuth()
  const router = useRouter()
  const popWorkspace = usePopWorkspaceOptional()
  const canSetApprovalCode = Boolean(popWorkspace?.bootstrap?.canSetApprovalCode)
  const approvalPopId = popWorkspace?.bootstrap?.popId ?? popWorkspace?.popId ?? ""
  const [approvalOpen, setApprovalOpen] = useState(false)

  const profileAvatarSrc = userAvatarSrc?.trim() || null
  const [photoOpen, setPhotoOpen] = useState(false)
  const showPhoto = Boolean(profileAvatarSrc)
  const initials = initialsFromPopName(userName)
  const resolvedRoleLabel = roleLabel?.trim() || ""
  const avatarSize = size === "compact" ? "md" : "lg"
  /** Compact (módulo): el nombre espera a `lg` para no pisar las acciones. */
  const identityClass =
    size === "compact" ? "hidden lg:flex" : "hidden sm:flex"

  if (pending) {
    return (
      <div className="flex min-w-0 items-center gap-3" aria-hidden>
        {showIdentity ? (
          <div className={cn("flex-col items-end gap-1.5", identityClass)}>
            <span className={cn(menuGhostBarClass, "h-3.5 w-24")} />
            <span className={cn(menuGhostBarClass, "h-2.5 w-16")} />
          </div>
        ) : null}
        <Avatar pending initials={initials} size={avatarSize} />
      </div>
    )
  }

  const handleLogOut = async () => {
    await logOut()
    router.push("/login")
  }

  const dropdownSeparatorClass =
    dataWorkspaceHeaderDropdownSeparatorClassForVariant(headerVariant)
  const dropdownContentClass =
    dataWorkspaceHeaderUserDropdownContentClassForVariant(headerVariant)

  return (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
        <button
          type="button"
          aria-label={`Menú de ${userName}`}
          aria-haspopup="menu"
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-[8px] border border-transparent px-2 py-1 text-left",
            "transition-[background-color,box-shadow] duration-150",
            "outline-none focus:outline-none focus:ring-0 data-[state=open]:ring-0",
            isTinted
              ? cn(
                  "hover:bg-[rgba(255,255,255,0.08)]",
                  "data-[state=open]:bg-[rgba(255,255,255,0.08)]",
                  "active:bg-[rgba(255,255,255,0.12)]",
                  "focus-visible:ring-2 focus-visible:ring-white/22",
                )
              : cn(
                  "hover:bg-black/5",
                  "data-[state=open]:bg-black/5",
                  "active:bg-black/8",
                  "focus-visible:ring-2 focus-visible:ring-primary/15",
                ),
          )}
        >
          <div
            className={cn(
              "min-w-0 flex-col items-end text-right leading-tight",
              size === "compact" && "max-w-28 xl:max-w-40",
              showIdentity ? identityClass : "hidden",
            )}
          >
            <span className={cn("truncate text-sm", eterHeaderBodyClass, "font-semibold")}>
              {userName}
            </span>
            {resolvedRoleLabel ? (
              <span className={cn("truncate text-xs font-normal", eterHeaderMutedClass)}>
                {resolvedRoleLabel}
              </span>
            ) : rolePending ? (
              <span
                className={cn(menuGhostBarClass, "mt-0.5 h-2.5 w-16")}
                aria-hidden
              />
            ) : null}
          </div>
          <span className="relative shrink-0">
            <Avatar
              imageUrl={profileAvatarSrc}
              initials={initials}
              size={avatarSize}
              isOnline={isOnline}
            />
          </span>
        </button>
      </RootsDropdownTrigger>
      <RootsDropdownContent
        theme={theme}
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={{ right: 16 }}
        className={dropdownContentClass}
      >
        {showPhoto ? (
          <RootsDropdownItem
            theme={theme}
            className="gap-2"
            onSelect={() => setPhotoOpen(true)}
          >
            <ImageIcon className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Ver foto</span>
          </RootsDropdownItem>
        ) : null}
        <RootsDropdownItem theme={theme} asChild className="gap-2">
          <Link href="/home">
            <UserCog className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Editar perfil</span>
          </Link>
        </RootsDropdownItem>
        {canSetApprovalCode && approvalPopId ? (
          <RootsDropdownItem
            theme={theme}
            className="gap-2"
            onSelect={() => setApprovalOpen(true)}
          >
            <KeyRound className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Código de aprobación</span>
          </RootsDropdownItem>
        ) : null}
        <RootsDropdownSeparator theme={theme} className={dropdownSeparatorClass} />
        <RootsDropdownItem
          theme={theme}
          variant={isTinted ? "default" : "destructive"}
          className={cn(isTinted ? dataWorkspaceHeaderDropdownLogoutItemClass : "gap-2")}
          onSelect={() => void handleLogOut()}
        >
          <LogOut
            className={cn("size-4 shrink-0", !isTinted && "opacity-70")}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">Cerrar sesión</span>
        </RootsDropdownItem>
      </RootsDropdownContent>
      <RootsImageLightbox
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        src={profileAvatarSrc}
        title={userName}
        frameClassName="rounded-full"
      />
      {canSetApprovalCode && approvalPopId ? (
        <ApprovalCodeDialog
          popId={approvalPopId}
          open={approvalOpen}
          onOpenChange={setApprovalOpen}
        />
      ) : null}
    </RootsDropdownMenu>
  )
}
