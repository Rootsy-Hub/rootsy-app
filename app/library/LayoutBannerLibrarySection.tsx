"use client"

import { BannersLiveGallery } from "@/app/library/components/BannersLiveGallery"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LayoutBannerLibrarySection() {
  return (
    <LibrarySection
      id="feedback"
      title="Banners"
      description="Componentes RootsBanner vivos — mismas specs que Banners UI, interactivos en dismissible."
    >
      <BannersLiveGallery />
    </LibrarySection>
  )
}
