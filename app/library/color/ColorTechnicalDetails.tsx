"use client"

import {
  ContrastTable,
  InteractionStatesGallery,
  ProductRoleTable,
  SemanticTokenTable,
  ThemeValuesTable,
} from "@/app/library/color/ColorSystemDocPrimitives"
import {
  COLOR_TOKENS,
  ROOTSY_CONTRAST_PAIRS,
  ROOTSY_SEMANTIC_TOKENS,
} from "@/app/library/color/rootsyColorSystem"
import type { ReactNode } from "react"

function TechnicalSubheading({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-canopy text-xs font-semibold uppercase tracking-wide"
      style={{ color: COLOR_TOKENS.bruma500 }}
    >
      {children}
    </p>
  )
}

function TechnicalBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <TechnicalSubheading>{title}</TechnicalSubheading>
      {children}
    </div>
  )
}

export function ColorTechnicalDetails() {
  const surfaces = ROOTSY_SEMANTIC_TOKENS.filter((t) => t.id.startsWith("background"))
  const text = ROOTSY_SEMANTIC_TOKENS.filter((t) => t.id.startsWith("foreground"))
  const actions = ROOTSY_SEMANTIC_TOKENS.filter(
    (t) => t.id.startsWith("action") || t.id.startsWith("accent"),
  )
  const status = ROOTSY_SEMANTIC_TOKENS.filter(
    (t) => t.id.startsWith("status") || t.id.startsWith("decorative"),
  )

  return (
    <div className="space-y-8">
      <TechnicalBlock title="Tokens semánticos · superficies">
        <SemanticTokenTable tokens={surfaces} />
      </TechnicalBlock>

      <TechnicalBlock title="Tokens semánticos · texto">
        <SemanticTokenTable tokens={text} />
      </TechnicalBlock>

      <TechnicalBlock title="Tokens semánticos · acción y foco">
        <SemanticTokenTable tokens={actions} />
      </TechnicalBlock>

      <TechnicalBlock title="Tokens semánticos · estado y decoración">
        <SemanticTokenTable tokens={status} />
      </TechnicalBlock>

      <TechnicalBlock title="Roles en UI">
        <ProductRoleTable />
      </TechnicalBlock>

      <TechnicalBlock title="Valores por tema">
        <ThemeValuesTable />
      </TechnicalBlock>

      <TechnicalBlock title="Estados interactivos">
        <InteractionStatesGallery />
      </TechnicalBlock>

      <TechnicalBlock title="Contraste WCAG">
        <ContrastTable pairs={[...ROOTSY_CONTRAST_PAIRS]} />
      </TechnicalBlock>
    </div>
  )
}
