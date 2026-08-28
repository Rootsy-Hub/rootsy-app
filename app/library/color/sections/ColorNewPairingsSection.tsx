"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import { PairingCard } from "@/app/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/library/color/ColorDocPrimitives"
import { ROOTSY_COMPLEMENTARY_PAIRINGS } from "@/app/library/color/rootsyColorSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

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
          Cada par resuelve un layout concreto: split POS, workspace claro, bruma oscura,
          climas de mundo (cielo / sol) y hero de marketing.
        </ColorDocLead>

        <ColorDocSection
          id="pairings-operational"
          title="Operación"
          description="POS y workspace — sombra, bruma, savia."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COMPLEMENTARY_PAIRINGS.filter((p) =>
              ["pos-core", "pos-split", "pos-focus", "workspace-bruma", "workspace-bruma-oscura", "workspace-header"].includes(
                p.id,
              ),
            ).map((pairing) => (
              <PairingCard key={pairing.id} pairing={pairing} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="pairings-marketing"
          title="Marketing"
          description="Promesa y CTA — sombra 900, savia 400/500, teal."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COMPLEMENTARY_PAIRINGS.filter((p) => p.id.startsWith("marketing")).map(
              (pairing) => (
                <PairingCard key={pairing.id} pairing={pairing} />
              ),
            )}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="pairings-climas"
          title="Climas"
          description="Cielo y sol — azul de naturaleza y amarillo sol. Mundos de comanda, no estados UX."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COMPLEMENTARY_PAIRINGS.filter((p) => p.id.startsWith("clima-")).map(
              (pairing) => (
                <PairingCard key={pairing.id} pairing={pairing} />
              ),
            )}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="pairings-status"
          title="Estados funcionales"
          description="Fuera de las tres familias — solo semántica UX."
        >
          <PairingCard
            pairing={
              ROOTSY_COMPLEMENTARY_PAIRINGS.find((p) => p.id === "status-functional")!
            }
          />
        </ColorDocSection>

        <GuidelinePair
          doText="Documentá pares con contexto de pantalla — no solo armonía teórica."
          dontText="No combines aurora de atmósfera con sombra operativa en la misma columna."
        />
      </div>
    </LibrarySection>
  )
}
