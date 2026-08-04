"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  dataWorkspaceHeaderChromeButtonClass,
  dataWorkspaceHeaderDropdownItemClassForVariant,
  dataWorkspaceHeaderDropdownLogoutItemClass,
  dataWorkspaceHeaderDropdownSeparatorClassForVariant,
  dataWorkspaceHeaderUserDropdownContentClassForVariant,
  isDataWorkspaceTintedHeader,
  isNightForestHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
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
  const isNightForest = isNightForestHeader(headerVariant)
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

  const dropdownItemClass = dataWorkspaceHeaderDropdownItemClassForVariant(headerVariant)
  const dropdownSeparatorClass =
    dataWorkspaceHeaderDropdownSeparatorClassForVariant(headerVariant)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
                isNightForest
                  ? "bg-[#1c2824] text-emerald-200"
                  : isTinted
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
              isNightForest
                ? "ring-[#0c1210]"
                : isTinted
                  ? "ring-zinc-900"
                  : "ring-secondary",
              isOnline ? "bg-emerald-500" : "bg-red-500",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        collisionPadding={{ right: 16 }}
        className={
          dataWorkspaceHeaderUserDropdownContentClassForVariant(headerVariant) ??
          "w-56 origin-top-right"
        }
      >
        <DropdownMenuItem
          asChild
          className={cn("gap-2", dropdownItemClass)}
        >
          <Link href="/home">
            <UserCog className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Editar perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className={dropdownSeparatorClass} />
        <DropdownMenuItem
          variant={isTinted ? "default" : "destructive"}
          className={cn(
            isTinted
              ? dataWorkspaceHeaderDropdownLogoutItemClass
              : "gap-2",
          )}
          onSelect={() => void handleLogOut()}
        >
          <LogOut
            className={cn("size-4 shrink-0", !isTinted && "opacity-70")}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
