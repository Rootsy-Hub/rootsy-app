"use client"

import { ArticleDeleteAlertLibraryDemo } from "@/app/library/ArticleDeleteAlertLibraryDemo"
import { AlertDialogLiveGallery } from "@/app/library/components/AlertDialogLiveGallery"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutAlertDialogLibrarySection() {
  return (
    <LibrarySection
      id="modals-alert"
      title="Alert dialog"
      description="RootsAlertDialog* — mismo mundo que el modal · heading.small semibold · radius.xlarge."
    >
      <AlertDialogLiveGallery />
      <ArticleDeleteAlertLibraryDemo />
    </LibrarySection>
  )
}
