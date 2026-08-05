"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import {
  InteractionStatesGallery,
  ProductRoleTable,
  SemanticTokenTable,
} from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { ROOTSY_SEMANTIC_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewSemanticSection() {
  const meta = getColorNewPageMeta("colors-new-semantic")!

  const surfaces = ROOTSY_SEMANTIC_TOKENS.filter((t) => t.id.startsWith("background"))
  const text = ROOTSY_SEMANTIC_TOKENS.filter((t) => t.id.startsWith("foreground"))
  const actions = ROOTSY_SEMANTIC_TOKENS.filter(
    (t) => t.id.startsWith("action") || t.id.startsWith("accent"),
  )
  const status = ROOTSY_SEMANTIC_TOKENS.filter(
    (t) => t.id.startsWith("status") || t.id.startsWith("decorative"),
  )

  return (
    <LibrarySection
      id="colors-new-semantic"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Los tokens nombran propósito, no familia decorativa. Savia 600 es siempre
          --color-action-primary en POS y workspace; landing tiene su propio CTA; aviso
          y peligro usan colores funcionales fuera de la paleta principal.
        </ColorDocLead>

        <ColorDocSection
          id="semantic-surfaces"
          title="Superficies"
          description="Shell, canvas, ticket — jerarquía espacial."
        >
          <SemanticTokenTable tokens={surfaces} />
        </ColorDocSection>

        <ColorDocSection
          id="semantic-text"
          title="Texto"
          description="Bruma 900 en claro; inverso en ceniza."
        >
          <SemanticTokenTable tokens={text} />
        </ColorDocSection>

        <ColorDocSection
          id="semantic-actions"
          title="Acción y foco"
          description="Savia en producto; forest en landing."
        >
          <SemanticTokenTable tokens={actions} />
        </ColorDocSection>

        <ColorDocSection
          id="semantic-status"
          title="Estado y decoración"
          description="Éxito = savia. Aviso/peligro/info = funcionales. Aurora = solo landing."
        >
          <SemanticTokenTable tokens={status} />
        </ColorDocSection>

        <ColorDocSection
          id="semantic-roles"
          title="Roles en UI"
          description="Mapeo directo a las cuatro familias."
        >
          <ProductRoleTable />
        </ColorDocSection>

        <ColorDocSection
          id="semantic-states"
          title="Estados interactivos"
          description="Reposo, hover, foco — workspace y POS."
        >
          <InteractionStatesGallery />
        </ColorDocSection>

        <GuidelinePair
          doText="Un token, un hex — referenciá variables CSS en componentes."
          dontText="No uses --color-action-landing en workspace ni savia en auroras blur."
        />
      </div>
    </LibrarySection>
  )
}
