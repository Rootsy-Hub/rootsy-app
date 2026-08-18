"use client"

import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { useHomePageData } from "@/hooks/useHomePageData"
import { useEffect, useState } from "react"

type HomeHeaderUserClusterProps = {
  userName: string
  userAvatarSrc: string | null
  userId?: string
}

export function HomeHeaderUserCluster({
  userName,
  userAvatarSrc,
  userId,
}: HomeHeaderUserClusterProps) {
  const [isOnline, setIsOnline] = useState(true)
  const { profile, profileFullName } = useHomePageData(userId ?? "")

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

  return (
    <DataWorkspaceHeaderUserMenu
      userName={profileFullName || userName}
      userAvatarSrc={profile?.imageUrl ?? userAvatarSrc}
      isOnline={isOnline}
      headerVariant="dark"
    />
  )
}
