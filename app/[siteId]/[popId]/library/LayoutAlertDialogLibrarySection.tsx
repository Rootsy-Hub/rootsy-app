"use client"

import { ArticleDeleteAlertLibraryDemo } from "@/app/[siteId]/[popId]/library/ArticleDeleteAlertLibraryDemo"
import { AlertDialogLiveGallery } from "@/app/[siteId]/[popId]/library/components/AlertDialogLiveGallery"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutAlertDialogLibrarySection(_props: Props) {
  return (
    <LibrarySection
      id="modals-alert"
      title="Alert dialog"
      description="RootsAlertDialog* — mismo scrim/borde/sombra que modal · radius.xlarge · sin body sunken."
    >
      <AlertDialogLiveGallery />
      <ArticleDeleteAlertLibraryDemo />
    </LibrarySection>
  )
}
