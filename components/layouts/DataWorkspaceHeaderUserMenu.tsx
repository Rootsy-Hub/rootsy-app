"use client"

import {
  menuGhostBarClass,
  menuGhostCircleClass,
} from "@/app/[siteId]/[popId]/menu/menuDormantStyles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useEffect, useState } from "react"

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

const userAvatarFallbackClass =
  "bg-linear-to-br from-[var(--rootsy-savia-500)] to-[var(--rootsy-savia-700)] text-xs font-semibold tracking-tight text-white"

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
  const [profileImageFailed, setProfileImageFailed] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const identityQuery =
    size === "compact" ? "(min-width: 1024px)" : "(min-width: 640px)"
  const [identityVisible, setIdentityVisible] = useState(false)

  useEffect(() => {
    setProfileImageFailed(false)
  }, [profileAvatarSrc])

  useEffect(() => {
    const media = window.matchMedia(identityQuery)
    const sync = () => setIdentityVisible(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [identityQuery])

  const showPhoto = Boolean(profileAvatarSrc) && !profileImageFailed
  const initials = initialsFromPopName(userName)
  const resolvedRoleLabel = roleLabel?.trim() || ""
  const avatarSizeClass = size === "compact" ? "size-8" : "size-10"
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
        <span className={cn(avatarSizeClass, menuGhostCircleClass)} />
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
            "group flex min-w-0 items-center gap-3 text-left",
            "outline-none focus:outline-none focus:ring-0",
            "data-[state=open]:ring-0",
            "focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-white/22",
          )}
        >
          <div
            className={cn(
              "min-w-0 flex-col items-end text-right leading-tight",
              size === "compact" && "max-w-28 xl:max-w-40",
              showIdentity ? identityClass : "hidden",
            )}
          >
            <span className={cn("truncate text-sm", eterHeaderBodyClass)}>
              {userName}
            </span>
            {resolvedRoleLabel ? (
              <span
                className={cn(
                  "truncate text-xs font-normal",
                  eterHeaderMutedClass,
                  "transition-colors duration-[50ms]",
                  "group-hover:text-[color-mix(in_srgb,var(--rootsy-eter-100)_78%,transparent)]",
                  "group-data-[state=open]:text-[color-mix(in_srgb,var(--rootsy-eter-100)_78%,transparent)]",
                )}
              >
                {resolvedRoleLabel}
              </span>
            ) : rolePending ? (
              <span
                className={cn(menuGhostBarClass, "mt-0.5 h-2.5 w-16")}
                aria-hidden
              />
            ) : null}
          </div>
          <span
            className={cn(
              "relative shrink-0",
              avatarSizeClass,
              showPhoto && showIdentity && identityVisible && "cursor-pointer",
            )}
            onClick={
              showPhoto && showIdentity && identityVisible
                ? (event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setPhotoOpen(true)
                  }
                : undefined
            }
            onPointerDown={
              showPhoto && showIdentity && identityVisible
                ? (event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }
                : undefined
            }
          >
            <span className="block size-full overflow-hidden rounded-full">
              <Avatar className="size-full rounded-full">
                {showPhoto ? (
                  <AvatarImage
                    src={profileAvatarSrc!}
                    alt=""
                    className="object-cover"
                    onLoadingStatusChange={(status) => {
                      if (status === "error" && profileAvatarSrc && !profileImageFailed) {
                        setProfileImageFailed(true)
                      }
                    }}
                  />
                ) : null}
                <AvatarFallback className={cn("rounded-full", userAvatarFallbackClass)}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </span>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 rounded-full",
                "ring-1 ring-transparent",
                "transition-[box-shadow] duration-[50ms]",
                "group-hover:ring-[color-mix(in_srgb,var(--rootsy-eter-100)_18%,transparent)]",
                "group-data-[state=open]:ring-[color-mix(in_srgb,var(--rootsy-eter-100)_18%,transparent)]",
              )}
            />
            <span
              role="status"
              aria-label={isOnline ? "En línea" : "Sin conexión"}
              title={isOnline ? "En línea" : "Sin conexión"}
              className={cn(
                "pointer-events-none absolute right-0 bottom-0 size-2 rounded-full ring-1 ring-[var(--rootsy-eter-950)]",
                isOnline
                  ? "bg-[var(--rootsy-savia-500)]"
                  : "bg-[var(--rootsy-danger)]",
              )}
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
