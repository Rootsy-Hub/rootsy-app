"use client"

import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { useEffect, useState } from "react"

type HomeHeaderUserClusterProps = {
  userName: string
  userAvatarSrc: string | null
}

export function HomeHeaderUserCluster({
  userName,
  userAvatarSrc,
}: HomeHeaderUserClusterProps) {
  const [isOnline, setIsOnline] = useState(true)

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
      userName={userName}
      userAvatarSrc={userAvatarSrc}
      isOnline={isOnline}
      headerVariant="dark"
    />
  )
}
