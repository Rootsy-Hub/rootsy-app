"use client"

import { HOME_COPY } from "@/app/home/homeCopy"
import { HomeHeaderAccountSheet } from "@/app/home/HomeHeaderAccountSheet"
import { Avatar } from "@/components/Avatar"
import { HomeUserPhotoDialog } from "@/app/home/HomeUserPhotoDialog"
import { useAuth } from "@/context/AuthContextSupabase"
import { useRouter } from "@/lib/pop-spa/navigation"
import { useState } from "react"

type WorkspaceMobileAccountClusterProps = {
  userName: string
  userAvatarSrc: string | null
  isOnline: boolean
  subscriptionsHref?: string | null
  pending?: boolean
}

/** Avatar mobile — mismo sheet de cuenta que /home y /menu. */
export function WorkspaceMobileAccountCluster({
  userName,
  userAvatarSrc,
  isOnline,
  subscriptionsHref = null,
  pending = false,
}: WorkspaceMobileAccountClusterProps) {
  const { logOut } = useAuth()
  const router = useRouter()
  const [accountOpen, setAccountOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const initials = userName.trim().slice(0, 2).toUpperCase() || "·"
  const displayName = userName.trim()

  const handleLogOut = async () => {
    setAccountOpen(false)
    await logOut()
    router.push("/login")
  }

  return (
    <>
      <Avatar
        pending={pending}
        imageUrl={userAvatarSrc}
        initials={initials}
        isOnline={isOnline}
        ariaLabel={HOME_COPY.accountMenu}
        onClick={() => setAccountOpen(true)}
      />
      <HomeHeaderAccountSheet
        open={accountOpen}
        onOpenChange={setAccountOpen}
        name={displayName}
        imageUrl={userAvatarSrc}
        initials={initials}
        isOnline={isOnline}
        subscriptionsHref={subscriptionsHref}
        onOpenPhoto={() => {
          setAccountOpen(false)
          setPhotoOpen(true)
        }}
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
      <HomeUserPhotoDialog
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        name={displayName}
        imageUrl={userAvatarSrc}
        initials={initials}
      />
    </>
  )
}
