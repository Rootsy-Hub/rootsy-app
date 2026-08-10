"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LegacyLibrarySectionRedirect() {
  const params = useParams()
  const router = useRouter()
  const sectionId =
    typeof params?.sectionId === "string" ? params.sectionId : "concept"

  useEffect(() => {
    router.replace(`/library/${sectionId}`)
  }, [router, sectionId])

  return null
}
