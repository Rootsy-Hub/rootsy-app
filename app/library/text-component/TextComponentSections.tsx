"use client"

import {
  TextComponentBodyContextDemo,
  TextComponentBodyTokens,
  TextComponentCodeDemo,
  TextComponentDocLead,
  TextComponentDocSection,
  TextComponentGuidelinesGrid,
  TextComponentHeadingsContextDemo,
  TextComponentHeadingsTokens,
  TextComponentLabelsDemo,
  TextComponentManifestoHero,
  TextComponentMetaDemo,
  TextComponentMetricDemo,
  TextComponentMetricTokens,
  TextComponentOverviewScale,
  TextComponentPrinciplesGrid,
  TextComponentReadingDemo,
  TextComponentRelatedLinks,
  TextComponentSectionLabelNote,
} from "@/app/library/text-component/TextComponentDocPrimitives"
import { getTextComponentPageMeta } from "@/app/library/text-component/textComponentLibraryNav"
import {
  ROOTSY_TEXT_COMPONENT_MANIFESTO,
  TEXT_COMPONENT_BODY_GUIDELINES,
  TEXT_COMPONENT_HEADING_GUIDELINES,
  TEXT_COMPONENT_METRIC_GUIDELINES,
} from "@/app/library/text-component/rootsyTextComponentSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

type SectionProps = {
}

export function TextComponentOverviewSection() {
  const meta = getTextComponentPageMeta("component-text")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TextComponentManifestoHero />
        <TextComponentDocLead>{ROOTSY_TEXT_COMPONENT_MANIFESTO}</TextComponentDocLead>
        <TextComponentPrinciplesGrid />
        <TextComponentDocSection
          id="text-overview-scale"
          title="Roles en UI"
          description="Referencia rápida — cada rol mapea a un token de tipografía."
        >
          <TextComponentOverviewScale />
        </TextComponentDocSection>
        <TextComponentDocSection id="text-related" title="Fundamentos relacionados">
          <TextComponentRelatedLinks excludeId="component-text" />
        </TextComponentDocSection>
      </div>
    </LibrarySection>
  )
}

export function TextComponentHeadingsSection() {
  const meta = getTextComponentPageMeta("component-text-headings")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TextComponentDocSection
          id="text-headings-context"
          title="En contexto"
          description="Un heading.large por pantalla — el resto baja de nivel."
        >
          <TextComponentHeadingsContextDemo />
        </TextComponentDocSection>
        <TextComponentDocSection
          id="text-headings-tokens"
          title="Tokens"
          description="font.heading.* — Nunito Sans bold."
        >
          <TextComponentHeadingsTokens />
        </TextComponentDocSection>
        <TextComponentDocSection id="text-headings-guidelines" title="Guías">
          <TextComponentGuidelinesGrid guidelines={TEXT_COMPONENT_HEADING_GUIDELINES} />
        </TextComponentDocSection>
      </div>
    </LibrarySection>
  )
}

export function TextComponentBodySection() {
  const meta = getTextComponentPageMeta("component-text-body")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TextComponentDocSection
          id="text-body-context"
          title="En contexto"
          description="14px default — medium en filas principales con íconos."
        >
          <TextComponentBodyContextDemo />
        </TextComponentDocSection>
        <TextComponentDocSection id="text-body-tokens" title="Tokens">
          <TextComponentBodyTokens />
        </TextComponentDocSection>
        <TextComponentDocSection id="text-body-guidelines" title="Guías">
          <TextComponentGuidelinesGrid guidelines={TEXT_COMPONENT_BODY_GUIDELINES} />
        </TextComponentDocSection>
      </div>
    </LibrarySection>
  )
}

export function TextComponentLabelsSection() {
  const meta = getTextComponentPageMeta("component-text-labels")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TextComponentDocSection
          id="text-labels-demo"
          title="Patrones"
          description="Sección, campo, eyebrow y encabezado de lista."
        >
          <TextComponentLabelsDemo />
        </TextComponentDocSection>
        <TextComponentDocSection id="text-labels-note" title="Formulario">
          <TextComponentSectionLabelNote />
        </TextComponentDocSection>
      </div>
    </LibrarySection>
  )
}

export function TextComponentMetaSection() {
  const meta = getTextComponentPageMeta("component-text-meta")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <TextComponentDocSection
        id="text-meta-demo"
        title="Roles secundarios"
        description="Hints, timestamps, contexto y contadores — siempre atenuados."
      >
        <TextComponentMetaDemo />
      </TextComponentDocSection>
    </LibrarySection>
  )
}

export function TextComponentMetricSection() {
  const meta = getTextComponentPageMeta("component-text-metric")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <TextComponentDocSection
          id="text-metric-demo"
          title="Tiles de métrica"
          description="Inter bold tabular — tres tamaños según jerarquía."
        >
          <TextComponentMetricDemo />
        </TextComponentDocSection>
        <TextComponentDocSection id="text-metric-tokens" title="Tokens">
          <TextComponentMetricTokens />
        </TextComponentDocSection>
        <TextComponentDocSection id="text-metric-guidelines" title="Guías">
          <TextComponentGuidelinesGrid guidelines={TEXT_COMPONENT_METRIC_GUIDELINES} />
        </TextComponentDocSection>
      </div>
    </LibrarySection>
  )
}

export function TextComponentReadingSection() {
  const meta = getTextComponentPageMeta("component-text-reading")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <TextComponentDocSection
        id="text-reading-demo"
        title="Prosa larga"
        description="Source Sans 3 en bloques de lectura — no en controles."
      >
        <TextComponentReadingDemo />
      </TextComponentDocSection>
    </LibrarySection>
  )
}

export function TextComponentCodeSection() {
  const meta = getTextComponentPageMeta("component-text-code")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <TextComponentDocSection
        id="text-code-demo"
        title="Snippets"
        description="JetBrains Mono en docs y referencias técnicas."
      >
        <TextComponentCodeDemo />
      </TextComponentDocSection>
    </LibrarySection>
  )
}
