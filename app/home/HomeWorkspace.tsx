"use client"

import { HomePageChrome } from "@/app/home/HomePageChrome"
import { HomePopPicker } from "@/app/home/HomePopPicker"
import { HomePopPickerSkeleton } from "@/app/home/HomePopPickerSkeleton"
import { resolveHomeDisplayName } from "@/app/home/homeUserDataResolve"
import { useAuth } from "@/context/AuthContextSupabase"

export function HomeWorkspace({
  serverUserId,
  serverDisplayName,
}: {
  serverUserId?: string
  serverDisplayName: string
}) {
  const { user } = useAuth()
  const userId = user?.id ?? serverUserId
  const displayName = user
    ? resolveHomeDisplayName(null, user)
    : serverDisplayName

  return (
    <HomePageChrome displayName={displayName} userId={userId}>
      {userId ? (
        <HomePopPicker userId={userId} fallback={<HomePopPickerSkeleton />} />
      ) : (
        <HomePopPickerSkeleton />
      )}
    </HomePageChrome>
  )
}
