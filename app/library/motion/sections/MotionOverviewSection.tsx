"use client"

import { getMotionPageMeta } from "@/app/library/motion/motionLibraryNav"
import {
  DurationRangeOverview,
  DurationTable,
  EasingGallery,
  InteractionVsTransitionDemo,
  MotionDocLead,
  MotionDocSection,
  MotionPrinciplesGrid,
  MotionSystemHero,
  MotionTechnicalDetails,
  PropertiesGallery,
  ReducedMotionNote,
} from "@/app/library/motion/MotionDocPrimitives"
import {
  ROOTSY_MOTION_MANIFESTO,
  ROOTSY_MOTION_PRINCIPLES,
} from "@/app/library/motion/rootsyMotionSystem"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

export function MotionOverviewSection() {
  const meta = getMotionPageMeta("motion")!

  return (
    <LibrarySection id="motion" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <MotionSystemHero />
        <MotionDocLead className="font-canopy">{ROOTSY_MOTION_MANIFESTO}</MotionDocLead>
        <MotionPrinciplesGrid principles={[...ROOTSY_MOTION_PRINCIPLES]} />

        <MotionDocSection
          id="duration"
          title="Duración"
          description="Interacciones 0–150ms · transiciones 150–400ms · expresivo 600ms."
        >
          <DurationTable />
          <DurationRangeOverview />
        </MotionDocSection>

        <MotionDocSection
          id="easing"
          title="Curvas de easing"
          description="Aterrizaje, balance, despegue y brisa suave — cada una con Play."
        >
          <EasingGallery />
        </MotionDocSection>

        <MotionDocSection
          id="properties"
          title="Propiedades de motion"
          description="Scale, fade, slide y color — preferir transform + opacity."
        >
          <PropertiesGallery />
        </MotionDocSection>

        <MotionDocSection
          id="interaction-demo"
          title="Interacción vs transición"
        >
          <InteractionVsTransitionDemo />
        </MotionDocSection>

        <MotionDocSection id="reduced-motion" title="Accesibilidad">
          <ReducedMotionNote />
        </MotionDocSection>

        <MotionDocSection
          id="motion-technical"
          title="Detalles técnicos"
          description="Duración, easing, tokens semánticos, keyframes y guías."
        >
          <MotionTechnicalDetails />
        </MotionDocSection>
      </div>
    </LibrarySection>
  )
}
