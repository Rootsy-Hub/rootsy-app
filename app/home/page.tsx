import { HomePageChrome } from "@/app/home/HomePageChrome"
import { HomePopPicker } from "@/app/home/HomePopPicker"
import { HomePopPickerSkeleton } from "@/app/home/HomePopPickerSkeleton"
import { resolveHomeDisplayName } from "@/app/home/homeUserDataResolve"
import { getInitialAuthUser } from "@/lib/getInitialAuthUser"

export default async function HomePage() {
  const user = await getInitialAuthUser()
  const displayName = resolveHomeDisplayName(null, user ?? {})

  return (
    <HomePageChrome
      displayName={displayName}
      userId={user?.id}
    >
      {user ? (
        <HomePopPicker userId={user.id} fallback={<HomePopPickerSkeleton />} />
      ) : (
        <HomePopPickerSkeleton />
      )}
    </HomePageChrome>
  )
}
