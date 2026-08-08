"use server"

import { requireAuthenticatedUser } from "@/lib/authHelpers"
import { isBackofficeAllowedEmail } from "@/lib/backofficeAccess"

export async function requireBackofficeAccess() {
  const user = await requireAuthenticatedUser()
  if (!isBackofficeAllowedEmail(user.email)) {
    throw new Error("Forbidden: backoffice access denied")
  }
  return user
}

export async function getBackofficeAccessForSession(): Promise<{
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
