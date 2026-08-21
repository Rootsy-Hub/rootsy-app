"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { useAuth } from "@/context/AuthContextSupabase"
import { useHomePageData } from "@/hooks/useHomePageData"
import {
  menuRealmLightMutedClass,
  menuRealmLightStaticClass,
} from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

/** Tile del logomark: 29×29 rx 9.95 → ~34% · mismo bloque que el icon button del header. */
const ISOLOGO_TILE_CLASS = "size-10 overflow-hidden rounded-[34%]"

type HomeHeaderUserClusterProps = {
  userId?: string
}

export function HomeHeaderUserCluster({ userId }: HomeHeaderUserClusterProps) {
  const { logOut } = useAuth()
  const router = useRouter()
  const { profile, profileFullName, profilePending } = useHomePageData(userId ?? "")
  const [isOnline, setIsOnline] = useState(true)

  const imageUrl = profile?.imageUrl?.trim() || null
  const initials = profileFullName.trim().slice(0, 2).toUpperCase() || "·"

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine)
    sync()
    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)
    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
    }
  }, [])

  const handleLogOut = async () => {
    await logOut()
    router.push("/login")
  }

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        <Link
          href="/home"
          className={cn(
            "inline-flex h-8 shrink-0 items-center rounded-md px-2 text-xs transition-colors sm:text-sm",
            menuRealmLightStaticClass,
            "hover:text-white",
          )}
        >
          {HOME_COPY.editProfile}
        </Link>
        <button
          type="button"
          onClick={() => void handleLogOut()}
          className={cn(
            "inline-flex h-8 shrink-0 items-center rounded-md px-2 text-xs transition-colors sm:text-sm",
            menuRealmLightMutedClass,
            "hover:text-white",
          )}
        >
          {HOME_COPY.logOut}
        </button>
      </div>

      <span className="relative inline-flex size-10 shrink-0">
        {profilePending || !userId ? (
          <span
            className={cn(ISOLOGO_TILE_CLASS, "animate-pulse bg-white/12")}
            aria-hidden
          />
        ) : (
          <span className={cn(ISOLOGO_TILE_CLASS, "bg-white/10")}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <span
                className={cn(
                  "flex size-full items-center justify-center text-[11px] font-semibold",
                  menuRealmLightStaticClass,
                )}
              >
                {initials}
              </span>
            )}
          </span>
        )}
        <span
          role="status"
          aria-label={isOnline ? "En línea" : "Sin conexión"}
          title={isOnline ? "En línea" : "Sin conexión"}
          className={cn(
            "pointer-events-none absolute bottom-1 right-1 size-2.5 rounded-full ring-2 ring-[var(--rootsy-sombra-950)]",
            isOnline ? "bg-emerald-500" : "bg-red-500",
          )}
        />
      </span>
    </div>
  )
}
