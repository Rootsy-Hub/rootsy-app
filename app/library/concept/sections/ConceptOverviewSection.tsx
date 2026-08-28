"use client"

import {
  ConceptDesignPrinciplesGrid,
  ConceptDocLead,
  ConceptDocSection,
  ConceptExamplesGrid,
} from "@/app/library/concept/ConceptDocPrimitives"
import { getConceptPageMeta } from "@/app/library/concept/conceptLibraryNav"
import { HANDBOOK_DESIGN_SYSTEM_ROOT } from "@/app/handbook/handbookDesignSystem"
import { handbookHomeHref } from "@/app/handbook/layoutHandbookShared"
import { LibraryHandbookSource } from "@/app/library/libraryDocPrimitives"
import { LibrarySection } from "@/app/library/layoutLibraryShared"

const LIBRARY_PURPOSE = [
  "El Handbook es la fuente de verdad: marca, criterio, voz y sistema de diseño.",
  "Esta librería especifica cómo se dibuja eso: rampas, tokens, componentes y patrones vivos.",
  "Si un detalle no ayuda a entender o a actuar, sobra — acá y en el producto.",
] as const

const LIBRARY_PRINCIPLES = [
  {
    title: "Naturalidad",
    detail: "Cada elemento debe sentirse obvio y reconocible desde el primer contacto.",
  },
  {
    title: "Simplicidad",
    detail: "Jerarquías claras, pocos elementos y decisiones visuales con función.",
  },
  {
    title: "Claridad",
    detail: "Ayudar a entender qué está pasando, qué requiere atención y cuál es el próximo paso.",
  },
  {
    title: "Profundidad progresiva",
    detail: "Superficie simple. Complejidad solo cuando el negocio la necesita.",
  },
  {
    title: "Movimiento funcional",
    detail: "Transiciones para explicar actividad y continuidad; nunca como adorno.",
  },
  {
    title: "Coherencia del mundo",
    detail: "Las atmósferas definen el contexto. Los funcionales definen acciones y estados.",
  },
] as const

const LIBRARY_HOW_TO = [
  "Empezar por las foundations: color, tipografía, espaciado, mundos, layout, elevación, borde, radios, iconografía, movimiento y logotipos.",
  "Usar componentes existentes antes de crear soluciones nuevas.",
  "Aplicar los patrones de módulo, tablas, bloques y operar para flujos repetidos.",
  "Mantener los mensajes funcionales claros y dejar que Rootsy hable cuando oriente.",
  "Elegir la atmósfera de la pantalla y usar funcionales para decir qué ocurre.",
] as const

export function ConceptOverviewSection() {
  const meta = getConceptPageMeta("concept")!

  return (
    <LibrarySection id="concept" title={meta.title} description={meta.description}>
      <div className="space-y-10">
        <LibraryHandbookSource href={handbookHomeHref()} label="Handbook" />

        <ConceptDocSection
          id="concept-purpose"
          title="Propósito"
          description="La librería no compite con el handbook. Lo implementa."
        >
          <ConceptDocLead>
            El sistema de diseño de Rootsy existe para convertir el mundo de Rootsy en una
            experiencia digital coherente, clara y escalable. El handbook fija el criterio.
            Acá viven las rampas, los tokens y los ejemplos que se pueden copiar.
          </ConceptDocLead>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--rootsy-bruma-700)]">
            {LIBRARY_PURPOSE.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </ConceptDocSection>

        <ConceptDocSection
          id="concept-principles"
          title="Principios"
          description="Los mismos del handbook. La librería no inventa otros."
        >
          <ConceptDesignPrinciplesGrid principles={LIBRARY_PRINCIPLES} />
        </ConceptDocSection>

        <ConceptDocSection
          id="concept-how"
          title="Cómo usar la librería"
          description="El mismo orden que el sistema de diseño."
        >
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--rootsy-bruma-700)]">
            {LIBRARY_HOW_TO.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-[var(--rootsy-bruma-600)]">
            El criterio de foundations está en{" "}
            <a
              href={HANDBOOK_DESIGN_SYSTEM_ROOT}
              className="font-semibold text-[var(--rootsy-savia-700)] underline-offset-2 hover:underline"
            >
              Handbook · Sistema de diseño
            </a>
            .
          </p>
        </ConceptDocSection>

        <ConceptDocSection
          id="concept-examples"
          title="Ejemplos"
          description="Formas claras, luz filtrada de fondo y savia solo donde hay que moverse."
        >
          <ConceptExamplesGrid />
        </ConceptDocSection>
      </div>
    </LibrarySection>
  )
}
