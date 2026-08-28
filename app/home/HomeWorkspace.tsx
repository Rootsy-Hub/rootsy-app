"use client"

import { HomePageChrome } from "@/app/home/HomePageChrome"
import { HomePopPicker } from "@/app/home/HomePopPicker"
import { HomePopPickerSkeleton } from "@/app/home/HomePopPickerSkeleton"
import { resolveHomeDisplayName } from "@/app/home/homeUserDataResolve"
import { useAuth } from "@/context/AuthContextSupabase"
import { useHomePageData } from "@/hooks/useHomePageData"

export function HomeWorkspace({
  serverUserId,
  serverDisplayName,
}: {
  serverUserId?: string
  serverDisplayName: string
}) {
  const { user } = useAuth()
  const userId = user?.id ?? serverUserId
  const { profilePending } = useHomePageData(userId ?? "")
  const displayName = user
    ? resolveHomeDisplayName(null, user)
    : serverDisplayName
  const loading = !userId || profilePending

  return (
    <HomePageChrome displayName={displayName} userId={userId} loading={loading}>
      {userId ? (
        <HomePopPicker userId={userId} fallback={<HomePopPickerSkeleton />} />
      ) : (
        <HomePopPickerSkeleton />
      )}
    </HomePageChrome>
  )
}
