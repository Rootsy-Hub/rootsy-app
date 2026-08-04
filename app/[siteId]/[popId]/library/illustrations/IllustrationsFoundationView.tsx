"use client"

import { getIllustrationsPageMeta } from "@/app/[siteId]/[popId]/library/illustrations/illustrationsLibraryNav"
import { LibrarySection } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"

type Props = {
  sectionId: string
}

export function IllustrationsFoundationView({ sectionId }: Props) {
  if (sectionId !== "illustrations") return null

  const meta = getIllustrationsPageMeta("illustrations")!

  return (
    <LibrarySection id="illustrations" title={meta.title} description={meta.description}>
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Fundamentos
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Próximamente</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Estamos definiendo spots, mascota y patrones ambient alineados a la marca Rootsy.
        </p>
      </div>
    </LibrarySection>
  )
}

export function getIllustrationsFoundationHeading(sectionId: string) {
  return getIllustrationsPageMeta(sectionId)?.title ?? "Ilustraciones"
}
