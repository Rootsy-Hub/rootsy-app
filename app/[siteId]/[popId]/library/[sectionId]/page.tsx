"use client"

import { LibraryShell } from "@/app/[siteId]/[popId]/library/LibraryShell"
import { LibraryWorkspace } from "@/app/[siteId]/[popId]/library/LibraryWorkspace"
import {
  DEFAULT_LIBRARY_SECTION,
  isValidLibrarySection,
  librarySectionHref,
} from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import withAuth from "@/hoc/withAuth"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

function LibrarySectionPage() {
  const params = useParams()
  const router = useRouter()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const sectionId =
    typeof params?.sectionId === "string" ? params.sectionId : DEFAULT_LIBRARY_SECTION

  useEffect(() => {
    if (!popId || !siteId) return
    if (!isValidLibrarySection(sectionId)) {
      router.replace(librarySectionHref(siteId, popId, DEFAULT_LIBRARY_SECTION))
    }
  }, [popId, router, sectionId, siteId])

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado.</p>
      </div>
    )
  }

  if (!isValidLibrarySection(sectionId)) {
    return null
  }

  return (
    <LibraryShell siteId={siteId} popId={popId}>
      <LibraryWorkspace siteId={siteId} popId={popId} sectionId={sectionId} />
    </LibraryShell>
  )
}

export default withAuth(LibrarySectionPage)
