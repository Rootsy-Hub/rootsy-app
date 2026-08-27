import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { AuthGate } from "@/components/auth/AuthGate"
import { PopWorkspaceShell } from "@/components/pop-workspace/PopWorkspaceShell"
import { PopRouterProvider } from "@/lib/pop-spa/PopRouter"
import "@/app/library/color/rootsyNaturePalette.css"
import { Suspense, type ReactNode } from "react"

export default function PopWorkspaceLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <Suspense fallback={<PopModuleLoading />}>
      <PopRouterProvider>
        <AuthGate>
          <PopWorkspaceShell>{children}</PopWorkspaceShell>
        </AuthGate>
      </PopRouterProvider>
    </Suspense>
  )
}
