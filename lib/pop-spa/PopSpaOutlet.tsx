"use client"

import { PopModuleLoading } from "@/app/[siteId]/[popId]/PopModuleLoading"
import { usePathname, useRouter } from "@/lib/pop-spa/navigation"
import { matchPopRoute } from "@/lib/pop-spa/matchPopRoute"
import { getPopSpaView } from "@/lib/pop-spa/popModuleLoaders"
import { Suspense, useEffect } from "react"

export function PopSpaOutlet() {
  const pathname = usePathname()
  const router = useRouter()
  const match = matchPopRoute(pathname)
  const View = getPopSpaView(match.view)

  useEffect(() => {
    if (match.redirectTo) router.replace(match.redirectTo, { scroll: false })
  }, [match.redirectTo, router])

  if (match.redirectTo) {
    return <PopModuleLoading moduleKey={match.moduleKey} />
  }

  return (
    <Suspense fallback={<PopModuleLoading moduleKey={match.moduleKey} />}>
      <View key={pathname} />
    </Suspense>
  )
}
