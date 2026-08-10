"use client"

import { libraryHomeHref } from "@/app/library/layoutLibraryShared"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LibraryIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(libraryHomeHref())
  }, [router])

  return null
}
