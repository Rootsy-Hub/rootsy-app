"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import { PairingCard } from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { ROOTSY_COMPLEMENTARY_PAIRINGS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewPairingsSection() {
  const meta = getColorNewPageMeta("colors-new-pairings")!

  return (
    <LibrarySection
      id="colors-new-pairings"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Complementarios derivados de pantallas reales — no teoría cromática abstracta.
          Cada par resuelve un layout concreto: split POS, workspace claro, hero landing.
        </ColorDocLead>

        <ColorDocSection
          id="pairings-operational"
          title="Operación"
          description="POS y workspace — ceniza, bruma, savia."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COMPLEMENTARY_PAIRINGS.filter((p) =>
              ["pos-core", "pos-split", "pos-focus", "workspace-bruma", "workspace-header"].includes(
                p.id,
              ),
            ).map((pairing) => (
              <PairingCard key={pairing.id} pairing={pairing} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="pairings-landing"
          title="Landing"
          description="Promesa y CTA — landing 950, meadow, teal."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COMPLEMENTARY_PAIRINGS.filter((p) => p.id.startsWith("landing")).map(
              (pairing) => (
                <PairingCard key={pairing.id} pairing={pairing} />
              ),
            )}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="pairings-status"
          title="Estados funcionales"
          description="Fuera de las cuatro familias — solo semántica UX."
        >
          <PairingCard
            pairing={
              ROOTSY_COMPLEMENTARY_PAIRINGS.find((p) => p.id === "status-functional")!
            }
          />
        </ColorDocSection>

        <GuidelinePair
          doText="Documentá pares con contexto de pantalla — no solo armonía teórica."
          dontText="No combines landing aurora con ceniza en la misma columna operativa."
        />
      </div>
    </LibrarySection>
  )
}
