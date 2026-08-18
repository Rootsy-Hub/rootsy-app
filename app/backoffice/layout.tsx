import BackofficeShell from "@/app/backoffice/BackofficeShell"
import { AuthGate } from "@/components/auth/AuthGate"
import type { ReactNode } from "react"

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <BackofficeShell>{children}</BackofficeShell>
    </AuthGate>
  )
}
