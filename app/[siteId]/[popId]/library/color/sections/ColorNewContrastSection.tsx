"use client"

import { getColorNewPageMeta } from "@/app/[siteId]/[popId]/library/color/colorNewLibraryNav"
import { ContrastTable } from "@/app/[siteId]/[popId]/library/color/ColorSystemDocPrimitives"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
} from "@/app/[siteId]/[popId]/library/color/ColorDocPrimitives"
import { ROOTSY_CONTRAST_PAIRS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function ColorNewContrastSection() {
  const meta = getColorNewPageMeta("colors-new-contrast")!

  const passing = ROOTSY_CONTRAST_PAIRS.filter((p) => p.level !== "Fail")
  const failing = ROOTSY_CONTRAST_PAIRS.filter((p) => p.level === "Fail")

  return (
    <LibrarySection
      id="colors-new-contrast"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <ColorDocLead>
          Objetivo mínimo: WCAG 2.1 AA (4.5:1 texto normal, 3:1 grande). En POS bajo luz
          directa, preferí AAA en texto principal. Los pares marcados Fail son anti-patrones
          documentados — no usar en producto.
        </ColorDocLead>

        <ColorDocSection
          id="contrast-pass"
          title="Pares aprobados"
          description="Combinaciones validadas en contextos reales de Rootsy."
        >
          <ContrastTable pairs={passing} />
        </ColorDocSection>

        <ColorDocSection
          id="contrast-fail"
          title="Anti-patrones"
          description="Combinaciones tentadoras pero ilegibles — evitar."
        >
          <ContrastTable pairs={failing} />
        </ColorDocSection>

        <ColorDocSection
          id="contrast-rules"
          title="Reglas rápidas"
          description="Checklist para diseño y revisión de PR."
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Texto secundario POS:</strong> sombra 300
              sobre sombra 600+ — nunca bruma 400 sobre bruma 100.
            </li>
            <li>
              <strong className="text-foreground">CTA savia:</strong> blanco sobre savia 600, o
              savia 950 sobre savia 400 para iconografía compacta.
            </li>
            <li>
              <strong className="text-foreground">Ticket claro:</strong> bruma 900 sobre bruma
              100 — metadatos en bruma 500 mínimo.
            </li>
            <li>
              <strong className="text-foreground">Marketing:</strong> blanco o savia 400 sobre
              sombra 900 — neón de atmósfera nunca como color de texto.
            </li>
          </ul>
        </ColorDocSection>

        <GuidelinePair
          doText="Probá contraste en contexto real — pantalla POS con brillo alto, no solo Figma."
          dontText="No confíes en opacidad baja de texto muted para cumplir AA."
        />
      </div>
    </LibrarySection>
  )
}
