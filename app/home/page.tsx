import { HomeWorkspace } from "@/app/home/HomeWorkspace"
import { resolveHomeDisplayName } from "@/app/home/homeUserDataResolve"
import { getInitialAuthUser } from "@/lib/getInitialAuthUser"

export default async function HomePage() {
  const user = await getInitialAuthUser()
  const displayName = resolveHomeDisplayName(null, user ?? {})

  return (
    <HomeWorkspace
      serverUserId={user?.id}
      serverDisplayName={displayName}
    />
  )
}
