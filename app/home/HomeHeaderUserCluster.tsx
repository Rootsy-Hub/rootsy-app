"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeUserPhotoDialog } from "@/app/home/HomeUserPhotoDialog"
import { HomeSubtleButton } from "@/app/home/HomeSubtleButton"
import { RootsIconButton } from "@/components/rootsy-button"
import { useAuth } from "@/context/AuthContextSupabase"
import { useHomePageData } from "@/hooks/useHomePageData"
import { menuRealmLightStaticClass } from "@/lib/menu/menuHoloStyles"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"
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
  const [photoOpen, setPhotoOpen] = useState(false)

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
    <div className="flex min-w-0 items-center gap-2">
      <HomeSubtleButton onClick={() => router.push("/home")}>
        {HOME_COPY.editProfile}
      </HomeSubtleButton>

      <span className="relative inline-flex size-10 shrink-0">
        {profilePending || !userId ? (
          <span
            className={cn(ISOLOGO_TILE_CLASS, "animate-pulse bg-white/12")}
            aria-hidden
          />
        ) : (
          <button
            type="button"
            className={cn(
              ISOLOGO_TILE_CLASS,
              "cursor-pointer bg-white/10 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            )}
            aria-label={HOME_COPY.photoModalTitle}
            onClick={() => setPhotoOpen(true)}
          >
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
          </button>
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

      <HomeUserPhotoDialog
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        name={profileFullName.trim()}
        imageUrl={imageUrl}
        initials={initials}
      />

      <RootsIconButton
        type="button"
        label={HOME_COPY.logOut}
        theme="workspace"
        rowIntent="destructive"
        size="default"
        onClick={() => void handleLogOut()}
      >
        <LogOut />
      </RootsIconButton>
    </div>
  )
}
