"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeHeaderAccountSheet } from "@/app/home/HomeHeaderAccountSheet"
import { HomeUserPhotoDialog } from "@/app/home/HomeUserPhotoDialog"
import { HomeLogoutButton, HomeSubtleButton } from "@/app/home/HomeSubtleButton"
import { Avatar } from "@/components/Avatar"
import { useAuth } from "@/context/AuthContextSupabase"
import { useHomePageData } from "@/hooks/useHomePageData"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type HomeHeaderUserClusterProps = {
  userId?: string
  loading?: boolean
}

export function HomeHeaderUserCluster({ userId, loading }: HomeHeaderUserClusterProps) {
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

  const pending = loading ?? (profilePending || !userId)

  const avatar = (
    <Avatar
      pending={pending}
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
        <Avatar
          pending={pending}
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
