"use client"

import { libraryHomeHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import withAuth from "@/hoc/withAuth"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

/** Redirección desde la ruta legacy. */
function LegacyLayoutLibraryRedirect() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  useEffect(() => {
    if (!popId || !siteId) return
    router.replace(libraryHomeHref(siteId, popId))
  }, [popId, router, siteId])

  return null
}

export default withAuth(LegacyLayoutLibraryRedirect)
