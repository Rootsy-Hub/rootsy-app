"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeHeaderAccountSheet } from "@/app/home/HomeHeaderAccountSheet"
import { HomeUserPhotoDialog } from "@/app/home/HomeUserPhotoDialog"
import { HomeLogoutButton, HomeSubtleButton } from "@/app/home/HomeSubtleButton"
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
  const { profile, profileFullName, profilePending, pops } = useHomePageData(userId ?? "")
  const ownedPop = pops.find((pop) => pop.isOwner)
  const subscriptionsHref = ownedPop
    ? `/${ownedPop.siteId}/${ownedPop.id}/subscribe`
    : null
  const [isOnline, setIsOnline] = useState(true)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const imageUrl = profile?.imageUrl?.trim() || null
  const initials = profileFullName.trim().slice(0, 2).toUpperCase() || "·"
  const displayName = profileFullName.trim()

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
    setAccountOpen(false)
    await logOut()
    router.push("/login")
  }

  const openPhoto = () => {
    setAccountOpen(false)
    setPhotoOpen(true)
  }

  const avatar = (
    <HomeHeaderAvatar
      pending={profilePending || !userId}
      imageUrl={imageUrl}
      initials={initials}
      isOnline={isOnline}
      ariaLabel={HOME_COPY.photoModalTitle}
      onClick={() => setPhotoOpen(true)}
    />
  )

  return (
    <>
      <div className="hidden min-w-0 items-center gap-2 md:flex">
        {subscriptionsHref ? (
          <>
            <HomeSubtleButton onClick={() => router.push(subscriptionsHref)}>
              {HOME_COPY.subscriptions}
            </HomeSubtleButton>
            <span
              aria-hidden
              className="mx-1 h-4 w-px shrink-0 bg-[color-mix(in_srgb,var(--rootsy-eter-100)_18%,transparent)]"
            />
          </>
        ) : null}

        <HomeSubtleButton onClick={() => router.push("/home")}>
          {HOME_COPY.editProfile}
        </HomeSubtleButton>

        {avatar}

        <HomeLogoutButton label={HOME_COPY.logOut} onClick={() => void handleLogOut()}>
          <LogOut />
        </HomeLogoutButton>
      </div>

      <div className="md:hidden">
        <HomeHeaderAvatar
          pending={profilePending || !userId}
          imageUrl={imageUrl}
          initials={initials}
          isOnline={isOnline}
          ariaLabel={HOME_COPY.accountMenu}
          onClick={() => setAccountOpen(true)}
        />
        <HomeHeaderAccountSheet
          open={accountOpen}
          onOpenChange={setAccountOpen}
          name={displayName}
          imageUrl={imageUrl}
          initials={initials}
          isOnline={isOnline}
          subscriptionsHref={subscriptionsHref}
          onOpenPhoto={openPhoto}
          onEditProfile={() => {
            setAccountOpen(false)
            router.push("/home")
          }}
          onSubscriptions={(href) => {
            setAccountOpen(false)
            router.push(href)
          }}
          onLogOut={() => void handleLogOut()}
        />
      </div>

      <HomeUserPhotoDialog
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        name={displayName}
        imageUrl={imageUrl}
        initials={initials}
      />
    </>
  )
}

export function HomeHeaderAvatar({
  pending,
  imageUrl,
  initials,
  isOnline,
  ariaLabel,
  onClick,
}: {
  pending: boolean
  imageUrl: string | null
  initials: string
  isOnline: boolean
  ariaLabel: string
  onClick: () => void
}) {
  return (
    <span className="relative inline-flex size-10 shrink-0">
      {pending ? (
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
          aria-label={ariaLabel}
          onClick={onClick}
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
      {pending ? null : (
        <span
          role="status"
          aria-label={isOnline ? HOME_COPY.online : HOME_COPY.offline}
          title={isOnline ? HOME_COPY.online : HOME_COPY.offline}
          className={cn(
            "pointer-events-none absolute bottom-1 right-1 size-2.5 rounded-full ring-2 ring-[var(--rootsy-sombra-950)]",
            isOnline ? "bg-emerald-500" : "bg-red-500",
          )}
        />
      )}
    </span>
  )
}
