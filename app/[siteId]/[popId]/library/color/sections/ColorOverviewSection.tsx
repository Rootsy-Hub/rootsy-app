"use client"

import { getColorPageMeta } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  AlphaOverlayDemo,
  AppliedNatureDemo,
  ColorDocLead,
  ColorDocSection,
  EmphasisComparison,
  GuidelinePair,
  InteractionStatesDemo,
  NatureFamilyRamp,
  NatureGradientGallery,
  NatureManifestoHero,
  NaturePillsDemo,
  NaturePrinciplesGrid,
  NatureRoleTable,
  NatureSwatchCard,
  NatureSwatchGrid,
  ThemeComparison,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import {
  ALL_NATURE_FAMILIES,
  CANOPY_FAMILY,
  NATURE_GRADIENTS,
  ROOTSY_NATURE_MANIFESTO,
  ROOTSY_NATURE_PRINCIPLES,
} from "@/app/[siteId]/[popId]/library/color/rootsyNaturePalette"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorOverviewSection() {
  const meta = getColorPageMeta("colors")!

  return (
    <LibrarySection id="colors" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <NatureManifestoHero />
        <ColorDocLead>{ROOTSY_NATURE_MANIFESTO}</ColorDocLead>
        <NaturePrinciplesGrid principles={ROOTSY_NATURE_PRINCIPLES} />

        <ColorDocSection
          id="canopy-hero"
          title="Canopy — el verde que define Rootsy"
          description="Planta en pleno esplendor: savia, hoja iluminada, bosque respirando. Todo lo demás orbita alrededor."
        >
          <NatureFamilyRamp family={CANOPY_FAMILY} />
          <NatureSwatchGrid>
            {CANOPY_FAMILY.steps
              .filter((s) => ["c600", "c500", "c400", "c200", "c100"].includes(s.id))
              .map((step) => (
                <NatureSwatchCard
                  key={step.id}
                  label={`Canopy ${step.label}`}
                  hex={step.hex}
                  usage={step.usage ?? "Verde nature Rootsy."}
                  textHex={parseInt(step.label) >= 400 ? "#052E1F" : "#FFFFFF"}
                />
              ))}
          </NatureSwatchGrid>
        </ColorDocSection>

        <AppliedNatureDemo />

        <ColorDocSection
          id="nature-gradients"
          title="Gradientes naturales"
          description="Transiciones que existen afuera: amanecer, horizonte, atardecer, bosque nocturno."
        >
          <NatureGradientGallery items={NATURE_GRADIENTS} />
        </ColorDocSection>

        <ColorDocSection
          id="color-anatomy"
          title="Familias del paisaje"
          description="Ocho climas de color — cada uno con personalidad, todos vivos."
        >
          <div className="space-y-10">
            {ALL_NATURE_FAMILIES.map((family) => (
              <NatureFamilyRamp key={family.id} family={family} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="nature-pills"
          title="Pills de estado"
          description="Bruma soft para estados y metadatos; canopy sólido para descuentos y números que deben destacar."
        >
          <NaturePillsDemo />
          <GuidelinePair
            doText="Usá soft para activo/inactivo/tipo; solid solo cuando el dato es numérico o promocional."
            dontText="No mezcles solid y botón primary en la misma fila — compiten por atención."
          />
        </ColorDocSection>

        <ColorDocSection
          id="color-roles"
          title="Roles de color"
          description="Canopy primero; fuego solo para peligro; tierra para anclar; cielo y mar para amplitud."
        >
          <NatureRoleTable />
          <GuidelinePair
            doText="Dejá que el verde canopy lidere — es la voz de Rootsy."
            dontText="No uses grises genéricos cuando la tierra y la noche ya resuelven los neutros."
          />
        </ColorDocSection>

        <ColorDocSection
          id="emphasis"
          title="Énfasis"
          description="Vivo como hoja al sol; bruma como neblina matinal."
        >
          <EmphasisComparison />
        </ColorDocSection>

        <ColorDocSection
          id="interaction"
          title="Interacción"
          description="Foco en verde canopy profundo — como mirar una hoja contra la luz."
        >
          <InteractionStatesDemo />
        </ColorDocSection>

        <ColorDocSection
          id="alpha"
          title="Transparencias"
          description="Bruma, rocío, velo de nube — capas que respiran con el fondo."
        >
          <AlphaOverlayDemo />
        </ColorDocSection>

        <ColorDocSection
          id="themes"
          title="Luz y noche"
          description="Prado bajo sol · bosque bajo luna — dos caras del mismo ecosistema."
        >
          <ThemeComparison />
        </ColorDocSection>

        <GuidelinePair
          doText="Combiná otoño con tierra en avisos; cielo con mar en datos frescos."
          dontText="No mezcles fuego con otoño — uno quema, el otro avisa."
        />
      </div>
    </LibrarySection>
  )
}
