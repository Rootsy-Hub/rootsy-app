"use client"

import { EmptyStateLiveGallery } from "@/app/library/components/EmptyStateLiveGallery"
import { LibraryRelatedLinksSection } from "@/app/library/libraryDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

const EMPTY_STATE_RELATED_LINKS = [
  { sectionId: "mundos", label: "Mundos", hint: "Éter · bruma · suelo · sombra · herramientas." },
  { sectionId: "toast", label: "Toast", hint: "Mismo retrato, globo de chat." },
  { sectionId: "layouts-blocks", label: "Bloques", hint: "Empty de ícono en grids y detalle." },
  { sectionId: "layouts-operar", label: "Operar", hint: "Catálogo en sombra — acá nació este empty." },
] as const

export function LayoutEmptyStateLibrarySection() {
  return (
    <div className="space-y-10">
      <LibrarySection
        id="empty-state"
        title="Empty state"
        description="Ícono suave sobre el glow del mundo cuando no hay nada que mostrar. Cada mundo pinta el ícono a su aire. El texto habla como Rootsy: primera persona, corto y cálido."
      >
        <EmptyStateLiveGallery />
      </LibrarySection>
      <LibraryRelatedLinksSection excludeId="empty-state" links={EMPTY_STATE_RELATED_LINKS} />
    </div>
  )
}
