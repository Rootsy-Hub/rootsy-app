"use server"

import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { isBackofficeAllowedEmail } from "@/lib/backofficeAccess"

export async function requireLibraryAccess() {
  const user = await requireAuthenticatedUser()
  if (!isBackofficeAllowedEmail(user.email)) {
    throw new Error("Forbidden: library access denied")
  }
  return user
}

export async function getLibraryAccessForSession(): Promise<{
  allowed: boolean
  email: string | null
}> {
  try {
    const user = await requireAuthenticatedUser()
    return {
      allowed: isBackofficeAllowedEmail(user.email),
      email: user.email ?? null,
    }
  } catch {
    return { allowed: false, email: null }
  }
}
