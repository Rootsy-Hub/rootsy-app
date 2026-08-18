import { AuthGate } from "@/components/auth/AuthGate"
import { PopWorkspaceShell } from "@/components/pop-workspace/PopWorkspaceShell"
import type { ReactNode } from "react"

export default function PopWorkspaceLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AuthGate>
      <PopWorkspaceShell>{children}</PopWorkspaceShell>
    </AuthGate>
  )
}
