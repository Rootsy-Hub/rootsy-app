"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LegacyLayoutsOperarPreviewRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/library/layouts-operar-preview")
  }, [router])

  return null
}
