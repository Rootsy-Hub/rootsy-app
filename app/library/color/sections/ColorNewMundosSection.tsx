"use client"

import { getColorNewPageMeta } from "@/app/library/color/colorNewLibraryNav"
import {
  ColorDocLead,
  ColorDocSection,
  GuidelinePair,
  NatureFamilyRamp,
} from "@/app/library/color/ColorDocPrimitives"
import {
  CIELO_FAMILY,
  ETER_FAMILY,
  SOL_FAMILY,
  SUELO_FAMILY,
} from "@/app/library/color/rootsyNaturePalette"
import {
  ROOTSY_COLOR_WORLDS,
  type RootsyColorWorld,
} from "@/app/library/color/rootsyColorWorlds"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

const KIND_LABEL: Record<RootsyColorWorld["kind"], string> = {
  marca: "Marca",
  clima: "Clima",
  composicion: "Composición",
}

function WorldCard({ world }: { world: RootsyColorWorld }) {
  return (
    <article className="library-spec-card overflow-hidden rounded-2xl border">
      <div className="flex h-14">
        {world.hexes.map((step) => (
          <div
            key={`${world.id}-${step.label}`}
            className="min-w-0 flex-1"
            style={{ backgroundColor: step.hex }}
            title={`${world.name} ${step.label}`}
          />
        ))}
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]">
            {world.name}
          </p>
          <span className="rounded-full bg-[var(--rootsy-bruma-100)] px-2 py-0.5 font-canopy text-[10px] font-medium text-[var(--rootsy-bruma-600)]">
            {KIND_LABEL[world.kind]}
          </span>
        </div>
        <p className="text-sm text-[var(--rootsy-bruma-700)]">{world.concept}</p>
        <p className="font-canopy text-xs text-[var(--rootsy-bruma-500)]">
          <span className="font-semibold text-[var(--rootsy-bruma-700)]">Dónde. </span>
          {world.usedIn}
        </p>
        <p className="font-canopy text-xs text-[var(--rootsy-bruma-500)]">
          <span className="font-semibold text-[var(--rootsy-bruma-700)]">No. </span>
          {world.not}
        </p>
        <p className="font-mono text-[10px] text-[var(--rootsy-bruma-400)]">{world.token}</p>
      </div>
    </article>
  )
}

export function ColorNewMundosSection() {
  const meta = getColorNewPageMeta("colors-new-mundos")!

  return (
    <LibrarySection id="colors-new-mundos" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <ColorDocLead>
          El producto habita mundos, no swatches sueltos. Tres son marca — sombra, bruma,
          savia. Cuatro son clima: suelo, cielo, sol y éter. Alba es composición (bruma),
          no rampa. Atmósfera del hero no es un mundo de producto. Las pantallas habitadas
          — cómo se ve cada mundo con piezas reales — viven en Fundamentos → Mundos.
        </ColorDocLead>

        <ColorDocSection
          id="mundos-mapa"
          title="Mapa de mundos"
          description="Nombre, concepto, dónde vive y qué no es. La regla: no cruzar climas."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {ROOTSY_COLOR_WORLDS.map((world) => (
              <WorldCard key={world.id} world={world} />
            ))}
          </div>
        </ColorDocSection>

        <ColorDocSection
          id="mundos-climas"
          title="Rampas de clima"
          description="Suelo, cielo, sol y éter — chrome y mundos. No se usan en forms ni pills."
        >
          <div className="space-y-10">
            <NatureFamilyRamp family={SUELO_FAMILY} />
            <NatureFamilyRamp family={CIELO_FAMILY} />
            <NatureFamilyRamp family={SOL_FAMILY} />
            <NatureFamilyRamp family={ETER_FAMILY} />
          </div>
        </ColorDocSection>

        <GuidelinePair
          doText="Nombrá el mundo antes que el hex: éter en el header, suelo en el pie, cielo en enviada, sol en preparando."
          dontText="Cielo no es éter. Sol no es warning. Suelo no es earth de forms. Sombra no es el espacio del header."
        />
      </div>
    </LibrarySection>
  )
}
