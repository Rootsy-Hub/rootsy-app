import { AuthGate } from "@/components/auth/AuthGate"
import { prefetchHomeSidecar } from "@/lib/prefetchHomeSidecar"
import { HydrationBoundary } from "@tanstack/react-query"
import type { ReactNode } from "react"

export default async function HomeLayout({ children }: { children: ReactNode }) {
  const dehydratedState = await prefetchHomeSidecar()

  return (
    <HydrationBoundary state={dehydratedState ?? undefined}>
      <AuthGate>{children}</AuthGate>
    </HydrationBoundary>
  )
}
