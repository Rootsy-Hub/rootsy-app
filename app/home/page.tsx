import { HomePageChrome } from "@/app/home/HomePageChrome"
import { HomePopPicker } from "@/app/home/HomePopPicker"
import {
  resolveHomeAvatarUrl,
  resolveHomeDisplayName,
} from "@/app/home/homeUserDataResolve"
import { getInitialAuthUser } from "@/lib/getInitialAuthUser"

export default async function HomePage() {
  const user = await getInitialAuthUser()
  if (!user) return null

  const displayName = resolveHomeDisplayName(null, user)
  const avatarUrl = resolveHomeAvatarUrl(null, user)

  return (
    <HomePageChrome
      displayName={displayName}
      avatarUrl={avatarUrl}
      userId={user.id}
    >
      <HomePopPicker userId={user.id} />
    </HomePageChrome>
  )
}
