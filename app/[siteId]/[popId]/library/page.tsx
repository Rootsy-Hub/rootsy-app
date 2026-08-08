"use client"

import { libraryHomeHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import withAuth from "@/hoc/withAuth"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

function LibraryIndexPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  useEffect(() => {
    if (!popId || !siteId) return
    router.replace(libraryHomeHref(siteId, popId))
  }, [popId, router, siteId])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  return null
}

export default withAuth(LibraryIndexPage)
