"use client"

import { BannersLiveGallery } from "@/app/[siteId]/[popId]/library/components/BannersLiveGallery"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  siteId?: string
  popId?: string
}

export function LayoutBannerLibrarySection(_props: Props) {
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
