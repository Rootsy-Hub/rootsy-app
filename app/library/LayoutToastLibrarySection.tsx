"use client"

import { ToastLiveGallery } from "@/app/library/components/ToastLiveGallery"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutToastLibrarySection() {
  return (
    <LibrarySection
      id="toast"
      title="Toast"
      description="Mensaje de Rootsy vivo — globo de chat con orientación. El canto es opcional."
    >
      <ToastLiveGallery />
    </LibrarySection>
  )
}
