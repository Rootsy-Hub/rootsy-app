"use client"

import { useParams, useRouter } from "@/lib/pop-spa/navigation"
import { useEffect } from "react"

export default function ActiveServicesRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params.siteId === "string" ? params.siteId : ""
  const popId = typeof params.popId === "string" ? params.popId : ""

  useEffect(() => {
    if (!siteId || !popId) return
    router.replace(`/${siteId}/${popId}/operations`)
  }, [popId, router, siteId])

  return null
}
