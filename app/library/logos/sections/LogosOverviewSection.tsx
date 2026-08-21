"use client"

import { getLogosPageMeta } from "@/app/library/logos/logosLibraryNav"
import {
  LogoAttributionDemo,
  LogoClearanceDemo,
  LogoGuidelinesGrid,
  LogosAnatomyGrid,
  LogosDocLead,
  LogosDocSection,
  LogosPrinciplesGrid,
  LogosSystemHero,
  PopHeaderLogoDemo,
  PopHomeScreenDemo,
  PopIdentityVariantsShowcase,
  RootsyLogomarksGrid,
  RootsyLogoVariantsGrid,
  UserProfileIdentityShowcase,
} from "@/app/library/logos/LogosDocPrimitives"
import {
  ROOTSY_LOGO_MANIFESTO,
  ROOTSY_LOGO_PRINCIPLES,
} from "@/app/library/logos/rootsyLogoSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function LogosOverviewSection() {
  const meta = getLogosPageMeta("logos")!

  return (
    <LibrarySection id="logos" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <LogosSystemHero />
        <LogosDocLead className="font-canopy">{ROOTSY_LOGO_MANIFESTO}</LogosDocLead>
        <LogosPrinciplesGrid principles={[...ROOTSY_LOGO_PRINCIPLES]} />

        <LogosDocSection
          id="anatomy"
          title="Anatomía"
          description="Términos alineados a Atlassian Design — logomark, wordmark y lockup."
        >
          <LogosAnatomyGrid />
        </LogosDocSection>

        <LogosDocSection
          id="rootsy-lockups"
          title="Rootsy · lockups"
          description="Variantes brand, inverse y neutral del logo de landing y producto."
        >
          <RootsyLogoVariantsGrid />
        </LogosDocSection>

        <LogosDocSection
          id="rootsy-logomarks"
          title="Rootsy · logomarks"
          description="Solo el tile — emparejar con texto nativo cuando el contexto es claro."
        >
          <RootsyLogomarksGrid />
        </LogosDocSection>

        <LogosDocSection
          id="pop-logos"
          title="POP · identidad del negocio"
          description="Espécimen real: Narciso — avatar (pop.imageUrl) + nombre; logo B/N aparte para tickets (pop.invoiceLogoUrl)."
        >
          <PopHomeScreenDemo />
          <PopIdentityVariantsShowcase />
          <PopHeaderLogoDemo />
        </LogosDocSection>

        <LogosDocSection
          id="attribution"
          title="Attribution"
          description="Combinar Rootsy + POP cuando la plataforma no es evidente."
        >
          <LogoAttributionDemo />
        </LogosDocSection>

        <LogosDocSection
          id="clearance"
          title="Clearance"
          description="Espacio libre alrededor del logo — sin tipo ni gráficos que compitan."
        >
          <LogoClearanceDemo />
        </LogosDocSection>

        <LogosDocSection id="guidelines" title="Guías Do / Don't">
          <LogoGuidelinesGrid />
        </LogosDocSection>

        <LogosDocSection
          id="user-profile"
          title="Persona · bloque de perfil"
          description="Tercera identidad del producto. Spec desde concepto, tipo, color, radio y espacio — no desde el header que hay hoy."
        >
          <UserProfileIdentityShowcase />
        </LogosDocSection>
      </div>
    </LibrarySection>
  )
}
