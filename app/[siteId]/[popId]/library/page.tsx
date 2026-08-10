"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LegacyLibraryIndexRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/library")
  }, [router])

  return null
}
