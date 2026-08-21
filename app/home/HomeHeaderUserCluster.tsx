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

type HomeHeaderUserClusterProps = {
  userId?: string
}

export function HomeHeaderUserCluster({ userId }: HomeHeaderUserClusterProps) {
  const { logOut } = useAuth()
  const router = useRouter()
  const { profile, profileFullName, profilePending } = useHomePageData(userId ?? "")

  const imageUrl = profile?.imageUrl?.trim() || null
  const initials = profileFullName.trim().slice(0, 2).toUpperCase() || "·"

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

      {profilePending || !userId ? (
        <span
          className="size-10 shrink-0 animate-pulse rounded-full bg-white/12"
          aria-hidden
        />
      ) : (
        <span className="relative flex size-10 shrink-0 overflow-hidden rounded-full bg-white/10">
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
    </div>
  )
}
