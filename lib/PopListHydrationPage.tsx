import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query"
import type { ReactNode } from "react"

export function PopListHydrationPage({
  state,
  children,
}: {
  state: DehydratedState | null
  children: ReactNode
}) {
  return (
    <HydrationBoundary state={state ?? undefined}>
      {children}
    </HydrationBoundary>
  )
}
