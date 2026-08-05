"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderDropdownLogoutItemClass,
  dataWorkspaceHeaderDropdownSeparatorClassForVariant,
  dataWorkspaceHeaderUserDropdownContentClassForVariant,
  isDarkChromeHeader,
  isDataWorkspaceTintedHeader,
  isLayoutsTablesHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
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

export type DataWorkspaceHeaderUserMenuProps = {
  userName: string
  userAvatarSrc?: string | null
  isOnline: boolean
  headerVariant?: DataWorkspaceHeaderVariant
}

export function DataWorkspaceHeaderUserMenu({
  userName,
  userAvatarSrc,
  isOnline,
  headerVariant = "default",
}: DataWorkspaceHeaderUserMenuProps) {
  const isTinted = isDataWorkspaceTintedHeader(headerVariant)
  const isTables = isLayoutsTablesHeader(headerVariant)
  const theme = isDarkChromeHeader(headerVariant) ? "dark" : "light"
  const { logOut } = useAuth()
  const router = useRouter()

  const avatarSrc =
    userAvatarSrc?.trim() ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || "u")}`

  const initials = userName.trim().slice(0, 2).toUpperCase() || "·"

  const handleLogOut = async () => {
    await logOut()
    router.push("/login")
  }

  const dropdownSeparatorClass = dataWorkspaceHeaderDropdownSeparatorClassForVariant(headerVariant)
  const dropdownContentClass = dataWorkspaceHeaderUserDropdownContentClassForVariant(headerVariant)

  return (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
        <button
          type="button"
          className={cn(
            dataWorkspaceHeaderChromeButtonClass(headerVariant),
            "relative overflow-hidden p-0",
          )}
          aria-label={`Menú de ${userName}`}
          aria-haspopup="menu"
        >
          <Avatar className="size-full rounded-[inherit]">
            <AvatarImage src={avatarSrc} alt="" className="object-cover" />
            <AvatarFallback
              className={cn(
                "rounded-[inherit] text-[11px] font-semibold",
                isTables
                  ? "bg-[var(--rootsy-sombra-800)] text-[var(--rootsy-savia-300)]"
                  : isTinted && !isTables
                    ? "bg-zinc-800 text-emerald-300"
                    : "bg-primary/10 text-primary",
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            role="status"
            aria-label={isOnline ? "En línea" : "Sin conexión"}
            title={isOnline ? "En línea" : "Sin conexión"}
            className={cn(
              "absolute bottom-1 right-1 size-2.5 rounded-full ring-2",
              isTables
                ? "ring-[var(--rootsy-sombra-950)]"
                : isTinted
                  ? "ring-zinc-900"
                  : "ring-secondary",
              isOnline ? "bg-emerald-500" : "bg-red-500",
            )}
          />
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
