"use client"

import { LibraryWorkspace } from "@/app/library/LibraryWorkspace"
import {
  DEFAULT_LIBRARY_SECTION,
  isValidLibrarySection,
  librarySectionHref,
} from "@/app/library/layoutLibraryShared"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LibrarySectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId =
    typeof params?.sectionId === "string" ? params.sectionId : DEFAULT_LIBRARY_SECTION

  useEffect(() => {
    if (sectionId === "layouts") {
      router.replace(librarySectionHref("layouts-module"))
      return
    }
    if (!isValidLibrarySection(sectionId)) {
      router.replace(librarySectionHref(DEFAULT_LIBRARY_SECTION))
    }
  }, [router, sectionId])

  if (!isValidLibrarySection(sectionId)) {
    return null
  }

  return <LibraryWorkspace />
}
