"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/** Redirección desde la ruta legacy. */
export default function LegacyLayoutLibraryRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/library")
  }, [router])

  return null
}
