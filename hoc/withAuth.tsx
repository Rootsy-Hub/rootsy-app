"use client"

import { AuthGate } from "@/components/auth/AuthGate"
import { type ComponentType } from "react"

/** @deprecated Usar AuthGate en el layout. */
export default function withAuth<P extends object>(Component: ComponentType<P>) {
  function WithAuthGuard(props: P) {
    return (
      <AuthGate>
        <Component {...props} />
      </AuthGate>
    )
  }

  WithAuthGuard.displayName = `withAuth(${Component.displayName ?? Component.name ?? "Page"})`
  return WithAuthGuard
}
