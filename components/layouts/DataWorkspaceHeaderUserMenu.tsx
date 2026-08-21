"use client"

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
import { initialsFromPopName } from "@/lib/popIdentityDisplay"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { useAuth } from "@/context/AuthContextSupabase"
import { cn } from "@/lib/utils"
import { LogOut, UserCog } from "lucide-react"
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
}: DataWorkspaceHeaderUserMenuProps) {
  const isTinted = isDataWorkspaceTintedHeader(headerVariant)
  const theme = isDarkChromeHeader(headerVariant) ? "dark" : "light"
  const { logOut } = useAuth()
  const router = useRouter()

  const profileAvatarSrc = userAvatarSrc?.trim() || null
  const [profileImageFailed, setProfileImageFailed] = useState(false)

  useEffect(() => {
    setProfileImageFailed(false)
  }, [profileAvatarSrc])

  const showPhoto = Boolean(profileAvatarSrc) && !profileImageFailed
  const initials = initialsFromPopName(userName)
  const resolvedRoleLabel = roleLabel?.trim() || ""
  const avatarSizeClass = size === "compact" ? "size-8" : "size-10"

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
            "outline-none",
            "focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)]/40",
          )}
        >
          <div className="hidden min-w-0 flex-col items-end text-right leading-tight sm:flex">
            <span className="truncate text-sm font-normal text-white">
              {userName}
            </span>
            {resolvedRoleLabel ? (
              <span
                className={cn(
                  "truncate text-xs font-normal text-[var(--rootsy-bruma-400)]",
                  "transition-colors duration-[50ms]",
                  "group-hover:text-[var(--rootsy-bruma-300)]",
                  "group-data-[state=open]:text-[var(--rootsy-bruma-300)]",
                )}
              >
                {resolvedRoleLabel}
              </span>
            ) : null}
          </div>
          <span className={cn("relative shrink-0", avatarSizeClass)}>
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
                "group-hover:ring-[color-mix(in_srgb,#ffffff_18%,transparent)]",
                "group-data-[state=open]:ring-[color-mix(in_srgb,#ffffff_18%,transparent)]",
              )}
            />
            <span
              role="status"
              aria-label={isOnline ? "En línea" : "Sin conexión"}
              title={isOnline ? "En línea" : "Sin conexión"}
              className={cn(
                "pointer-events-none absolute right-0 bottom-0 size-2 rounded-full ring-1 ring-[var(--rootsy-sombra-900)]",
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
        <RootsDropdownItem theme={theme} asChild className="gap-2">
          <Link href="/home">
            <UserCog className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Editar perfil</span>
          </Link>
        </RootsDropdownItem>
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
    </RootsDropdownMenu>
  )
}
