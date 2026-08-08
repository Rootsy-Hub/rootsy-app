"use client"

import { getMotionPageMeta } from "@/app/[siteId]/[popId]/library/motion/motionLibraryNav"
import {
  ApplyingGuidelineCards,
  KeyframesTable,
  MotionDocLead,
  MotionDocSection,
  SemanticTokensTable,
} from "@/app/[siteId]/[popId]/library/motion/MotionDocPrimitives"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

export function MotionApplyingSection() {
  const meta = getMotionPageMeta("motion-applying")!

  return (
    <LibrarySection
      id="motion-applying"
      title={meta.title}
      description={meta.description}
    >
      <div className="space-y-10">
        <MotionDocLead className="font-canopy">
          Empezá por tokens semánticos — motion.modal.enter, motion.popup.enter.bottom.
          Solo componé custom cuando ningún token encaja.
        </MotionDocLead>

        <MotionDocSection
          id="semantic-tokens"
          title="Tokens semánticos"
          description="Duración + easing + propiedades empaquetados por intención."
        >
          <SemanticTokensTable />
        </MotionDocSection>

        <MotionDocSection
          id="keyframes"
          title="Keyframes"
          description="Fade y scale — building blocks para composiciones."
        >
          <KeyframesTable />
        </MotionDocSection>

        <MotionDocSection
          id="apply-guidelines"
          title="Guías de aplicación"
        >
          <ApplyingGuidelineCards />
        </MotionDocSection>
      </div>
    </LibrarySection>
  )
}
