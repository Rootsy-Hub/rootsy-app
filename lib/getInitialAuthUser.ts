import type { User } from "@supabase/supabase-js"
import { cache } from "react"
import { createClient } from "@/utils/supabase/server"

export const getInitialAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ?? null
})
