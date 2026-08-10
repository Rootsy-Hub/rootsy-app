"use client"

import { ArticleDeleteAlertLibraryDemo } from "@/app/library/ArticleDeleteAlertLibraryDemo"
import { AlertDialogLiveGallery } from "@/app/library/components/AlertDialogLiveGallery"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutAlertDialogLibrarySection() {
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
