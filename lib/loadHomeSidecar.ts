import "server-only"

import {
  getUserPopsAccessBatch,
  getUserProfileCache,
} from "@/app/home/homeUserDataActions"
import type {
  UserPopsAccessBatchCache,
  UserProfileCache,
} from "@/app/home/homeUserDataTypes"
import { getInitialAuthUser } from "@/lib/getInitialAuthUser"
import type { User } from "@supabase/supabase-js"
import { cache } from "react"

export type HomeSidecar = {
  user: User
  profile: UserProfileCache
  batch: UserPopsAccessBatchCache
}

/** Una sola lectura por request — la page y el prefetch del layout la comparten. */
export const loadHomeSidecar = cache(async (): Promise<HomeSidecar | null> => {
  const user = await getInitialAuthUser()
  if (!user) return null

  const [profile, batch] = await Promise.all([
    getUserProfileCache(),
    getUserPopsAccessBatch(),
  ])

  return { user, profile, batch }
})
