import type { HandbookColorFamily } from "@/app/handbook/color/handbookColorPalettes"
import {
  HANDBOOK_ATMOSPHERES,
  HANDBOOK_FUNCTIONAL_COLORS,
  handbookColorHex,
} from "@/app/handbook/color/handbookColorPalettes"
import {
  atmosphereTokenHex,
  functionalTokenHex,
  HANDBOOK_ATMOSPHERE_CONTEXTS,
  HANDBOOK_ATMOSPHERE_TOKENS,
  HANDBOOK_BRUMA_NOCHE,
  HANDBOOK_CONTRAST_FAIL,
  HANDBOOK_CONTRAST_PASS,
  HANDBOOK_CONTRAST_RULES,
  HANDBOOK_FUNCTIONAL_TOKENS,
  HANDBOOK_STATUS_TINT_RULE,
  type HandbookContrastLevel,
  type HandbookContrastPair,
} from "@/app/handbook/color/handbookColorSpec"
import {
  libraryDocBodyClass,
  libraryDocBorderClass,
  libraryDocMetaLabelClass,
  libraryDocMutedTextClass,
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocPrimaryTextClass,
  libraryDocSectionTitleClass,
  libraryDocSubheadingClass,
  libraryDocSurfaceMutedClass,
  libraryDocTableHeaderClass,
  libraryDocTableRowClass,
  libraryDocTableShellOverflowClass,
  libraryDocTokenAccentClass,
} from "@/app/library/libraryColorTheme"
import { LibraryDoDontPair } from "@/app/library/libraryDocPrimitives"
import { cn } from "@/lib/utils"

function identityHex(family: HandbookColorFamily) {
  return family.steps.find((step) => step.identity)?.hex ?? family.steps[5]?.hex
}

function FamilyOverviewStrip({ families }: { families: HandbookColorFamily[] }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        families.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3",
      )}
    >
      {families.map((family) => (
        <a
          key={family.id}
          href={`#${family.id}`}
          className={cn(
            "overflow-hidden rounded-2xl border no-underline transition-opacity hover:opacity-90",
            libraryDocBorderClass,
          )}
        >
          <div className="flex h-12">
            {family.steps.map((step) => (
              <div
                key={step.step}
                className="min-w-0 flex-1"
                style={{ backgroundColor: step.hex }}
              />
            ))}
          </div>
          <div className={cn("flex items-center gap-3 px-3 py-3", libraryDocSurfaceMutedClass)}>
            <span
              className="size-7 shrink-0 rounded-full border"
              style={{
                backgroundColor: identityHex(family),
                borderColor: "var(--color-borde)",
              }}
            />
            <div className="min-w-0">
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{family.name}</p>
              <p className={libraryDocPageDescriptionClass}>{family.tagline}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

function FamilyRamp({ family }: { family: HandbookColorFamily }) {
  return (
    <section id={family.id} className="mt-8 scroll-mt-24 space-y-4">
      <div className="max-w-3xl space-y-2">
        <h3 className={cn(libraryDocSectionTitleClass, "text-sm")}>{family.name}</h3>
        <p className={cn(libraryDocMetaLabelClass, "normal-case tracking-normal")}>
          {family.tagline}
        </p>
        <p className={libraryDocBodyClass}>{family.description}</p>
        <p className={libraryDocPageDescriptionClass}>{family.not}</p>
      </div>

      <div className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
        <div className="flex h-16 sm:h-20">
          {family.steps.map((step) => (
            <div
              key={step.step}
              className="min-w-0 flex-1"
              style={{ backgroundColor: step.hex }}
              title={`${family.name} ${step.step}`}
            />
          ))}
        </div>
      </div>

      <div className={libraryDocTableShellOverflowClass}>
        <table className="w-full text-left">
          <thead>
            <tr className={libraryDocTableHeaderClass}>
              <th className="px-3 py-2.5">Paso</th>
              <th className="px-3 py-2.5">Hex</th>
              <th className="px-3 py-2.5">Uso</th>
            </tr>
          </thead>
          <tbody>
            {family.steps.map((step) => (
              <tr key={step.step} className={libraryDocTableRowClass}>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-5 shrink-0 rounded-md border"
                      style={{
                        backgroundColor: step.hex,
                        borderColor: "var(--color-borde)",
                      }}
                    />
                    <span className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                      {step.step}
                    </span>
                    {step.identity ? (
                      <span
                        className={cn(
                          "font-canopy text-[10px] font-semibold uppercase tracking-[0.12em]",
                          libraryDocTokenAccentClass,
                        )}
                      >
                        Identidad
                      </span>
                    ) : null}
                  </span>
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 font-numeric text-xs tabular-nums",
                    libraryDocMutedTextClass,
                  )}
                >
                  {step.hex.toUpperCase()}
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 font-canopy text-xs leading-relaxed",
                    libraryDocMutedTextClass,
                  )}
                >
                  {step.usage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Swatch({ hex, className }: { hex: string; className?: string }) {
  return (
    <span
      className={cn("inline-block size-5 shrink-0 rounded-md border", className)}
      style={{ backgroundColor: hex, borderColor: "var(--color-borde)" }}
    />
  )
}

function AtmosphereContextPreview() {
  const fondo = HANDBOOK_ATMOSPHERE_TOKENS.find((token) => token.id === "fondo")!
  const superficie = HANDBOOK_ATMOSPHERE_TOKENS.find((token) => token.id === "superficie")!
  const texto = HANDBOOK_ATMOSPHERE_TOKENS.find((token) => token.id === "texto")!
  const muted = HANDBOOK_ATMOSPHERE_TOKENS.find((token) => token.id === "texto-muted")!
  const accion = HANDBOOK_FUNCTIONAL_TOKENS.find((token) => token.id === "accion")!

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {HANDBOOK_ATMOSPHERE_CONTEXTS.map((context) => (
        <div
          key={context.id}
          className="overflow-hidden rounded-2xl p-4"
          style={{ backgroundColor: atmosphereTokenHex(fondo, context.id) }}
        >
          <p
            className="font-canopy text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: atmosphereTokenHex(muted, context.id) }}
          >
            {context.name}
          </p>
          <div
            className="mt-3 space-y-3 rounded-xl p-3"
            style={{ backgroundColor: atmosphereTokenHex(superficie, context.id) }}
          >
            <p
              className="font-canopy text-sm font-semibold"
              style={{ color: atmosphereTokenHex(texto, context.id) }}
            >
              {context.sample}
            </p>
            <span
              className="inline-flex rounded-lg px-2.5 py-1 font-canopy text-[11px] font-semibold"
              style={{
                backgroundColor: functionalTokenHex(accion),
                color: handbookColorHex("savia", "50"),
              }}
            >
              Acción
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AtmosphereTokensTable() {
  return (
    <div className={cn(libraryDocTableShellOverflowClass, "overflow-x-auto")}>
      <table className="w-full min-w-[40rem] text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Token</th>
            {HANDBOOK_ATMOSPHERE_CONTEXTS.map((context) => (
              <th key={context.id} className="px-3 py-2.5">
                {context.name}
              </th>
            ))}
            <th className="px-3 py-2.5">Uso</th>
          </tr>
        </thead>
        <tbody>
          {HANDBOOK_ATMOSPHERE_TOKENS.map((token) => (
            <tr key={token.id} className={libraryDocTableRowClass}>
              <td className="px-3 py-2.5">
                <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                  {token.label}
                </p>
                <p className={cn("font-numeric text-[11px]", libraryDocMutedTextClass)}>
                  {token.token}
                </p>
              </td>
              {HANDBOOK_ATMOSPHERE_CONTEXTS.map((context) => {
                const hex = atmosphereTokenHex(token, context.id)
                return (
                  <td key={context.id} className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <Swatch hex={hex} />
                      <span className={cn("font-canopy text-xs", libraryDocMutedTextClass)}>
                        {token.steps[context.id]}
                      </span>
                    </span>
                  </td>
                )
              })}
              <td className={cn("px-3 py-2.5 font-canopy text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {token.purpose}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FunctionalTokensTable() {
  return (
    <div className={libraryDocTableShellOverflowClass}>
      <table className="w-full text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Token</th>
            <th className="px-3 py-2.5">Paleta</th>
            <th className="px-3 py-2.5">Hex</th>
            <th className="px-3 py-2.5">Uso</th>
          </tr>
        </thead>
        <tbody>
          {HANDBOOK_FUNCTIONAL_TOKENS.map((token) => {
            const hex = functionalTokenHex(token)
            return (
              <tr key={token.id} className={libraryDocTableRowClass}>
                <td className="px-3 py-2.5">
                  <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                    {token.label}
                  </p>
                  <p className={cn("font-numeric text-[11px]", libraryDocMutedTextClass)}>
                    {token.token}
                  </p>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <Swatch hex={hex} />
                    <span className={cn("font-canopy text-xs", libraryDocMutedTextClass)}>
                      {token.familyName} · {token.step}
                    </span>
                  </span>
                </td>
                <td className={cn("px-3 py-2.5 font-numeric text-xs tabular-nums", libraryDocMutedTextClass)}>
                  {hex.toUpperCase()}
                </td>
                <td className={cn("px-3 py-2.5 font-canopy text-xs leading-relaxed", libraryDocMutedTextClass)}>
                  {token.purpose}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const CONTRAST_LEVEL_CLASS: Record<HandbookContrastLevel, string> = {
  AAA: "bg-rootsy-savia-50 text-rootsy-savia-800",
  AA: "bg-rootsy-bruma-50 text-rootsy-bruma-700",
  "AA grande": "bg-rootsy-sol-50 text-rootsy-sol-900",
  No: "bg-rootsy-lava-50 text-rootsy-lava-800",
}

function ContrastPairsTable({ pairs }: { pairs: HandbookContrastPair[] }) {
  return (
    <div className={libraryDocTableShellOverflowClass}>
      <table className="w-full text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Par</th>
            <th className="px-3 py-2.5">Contexto</th>
            <th className="px-3 py-2.5">Ratio</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => {
            const foreground = handbookColorHex(pair.foreground.familyId, pair.foreground.step)
            const background = handbookColorHex(pair.background.familyId, pair.background.step)
            return (
              <tr key={pair.id} className={libraryDocTableRowClass}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-16 items-center justify-center rounded-md border font-canopy text-[10px] font-bold"
                      style={{
                        backgroundColor: background,
                        color: foreground,
                        borderColor: "var(--color-borde)",
                      }}
                    >
                      Aa
                    </span>
                    <div>
                      <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                        {pair.label}
                      </p>
                      <p className={cn("font-numeric text-[11px] tabular-nums", libraryDocMutedTextClass)}>
                        {foreground.toUpperCase()} · {background.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={cn("px-3 py-2.5 font-canopy text-xs leading-relaxed", libraryDocMutedTextClass)}>
                  {pair.context}
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex flex-col items-start gap-1">
                    <span className={cn("font-numeric text-sm tabular-nums", libraryDocPrimaryTextClass)}>
                      {pair.ratio}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-canopy text-[10px] font-semibold uppercase tracking-[0.08em]",
                        CONTRAST_LEVEL_CLASS[pair.level],
                      )}
                    >
                      {pair.level}
                    </span>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function HandbookColorView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Color</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        El color de Rootsy se organiza en dos capas. Las atmósferas definen el contexto visual de
        la pantalla. Los colores funcionales dicen qué está ocurriendo: acción, información,
        atención o peligro.
      </p>
      <p className={cn(libraryDocBodyClass, "mt-3")}>
        Esta paleta es la que usa la aplicación. Cada familia tiene once pasos,
        de 50 a 950. El paso marcado es la identidad de la familia. Si un color en la aplicación
        no está acá, no entra.
      </p>

      <section
        id="atmosferas-del-mundo"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Atmósferas del mundo</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Éter, bruma y sombra son el aire de cada pantalla. Se elige una atmósfera por contexto;
          no se mezclan como si fueran acentos.
        </p>
        <div className="mt-6">
          <FamilyOverviewStrip families={HANDBOOK_ATMOSPHERES} />
        </div>
        {HANDBOOK_ATMOSPHERES.map((family) => (
          <FamilyRamp key={family.id} family={family} />
        ))}
      </section>

      <section
        id="colores-funcionales"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Colores funcionales</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Savia, cielo de día, sol y lava comunican qué está pasando y cuál es el próximo
          movimiento. No pintan el mundo: marcan acción, estado y prioridad.
        </p>
        <div className="mt-6">
          <FamilyOverviewStrip families={HANDBOOK_FUNCTIONAL_COLORS} />
        </div>
        {HANDBOOK_FUNCTIONAL_COLORS.map((family) => (
          <FamilyRamp key={family.id} family={family} />
        ))}
      </section>

      <section
        id="tokens-de-color"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Tokens de color</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Los tokens nombran propósito. El hex sale de la paleta. Un token, un trabajo: no se
          escribe un color suelto ni se reutiliza un paso porque “queda parecido”.
        </p>

        <div className="mt-6">
          <AtmosphereContextPreview />
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          La savia de acción es la misma en las tres atmósferas. Cambia el aire, no el verbo.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>
          Tokens de atmósfera
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Resuelven según el contexto de la pantalla. Éter, bruma o sombra eligen el aire;
          estos tokens eligen el rol dentro de ese aire.
        </p>
        <div className="mt-4">
          <AtmosphereTokensTable />
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-4")}>
          Bruma de noche usa los mismos tokens, invertidos: fondo {HANDBOOK_BRUMA_NOCHE.fondo},
          superficie {HANDBOOK_BRUMA_NOCHE.superficie}, elevada {HANDBOOK_BRUMA_NOCHE.elevada},
          borde {HANDBOOK_BRUMA_NOCHE.borde}, texto {HANDBOOK_BRUMA_NOCHE.texto}, muted{" "}
          {HANDBOOK_BRUMA_NOCHE.muted}. No es una familia nueva.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>
          Tokens funcionales
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          No cambian con la atmósfera. Dicen qué está ocurriendo.
        </p>
        <div className="mt-4">
          <FunctionalTokensTable />
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-4")}>
          {HANDBOOK_STATUS_TINT_RULE}
        </p>

        <div className="mt-8">
          <LibraryDoDontPair
            doText="Nombrá el propósito y tomá el paso de la paleta. --color-accion es savia 600 en cualquier pantalla."
            dontText="No pongas un hex a mano ni uses lava para atención, sol para error o savia para pintar un fondo entero."
          />
        </div>
      </section>

      <section
        id="contraste-y-legibilidad"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Contraste y legibilidad</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Objetivo mínimo: WCAG 2.1 AA. Texto normal pide 4.5:1. Texto grande o botón semibold
          pide 3:1 (AA grande). Los pares marcados No o AA grande en anti-patrones no se usan
          como cuerpo.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Pares que pasan</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Combinaciones de la paleta, medidas con luminancia relativa.
        </p>
        <div className="mt-4">
          <ContrastPairsTable pairs={HANDBOOK_CONTRAST_PASS} />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Anti-patrones</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Tentadoras, ilegibles o apenas suficientes para un botón grande. No son pares de
          lectura.
        </p>
        <div className="mt-4">
          <ContrastPairsTable pairs={HANDBOOK_CONTRAST_FAIL} />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Reglas rápidas</h3>
        <ul className={cn(libraryDocBodyClass, "mt-4 list-disc space-y-1.5 pl-5")}>
          {HANDBOOK_CONTRAST_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <div className="mt-8">
          <LibraryDoDontPair
            doText="Medí el par en el contexto real: bruma 700 para muted claro, savia 700 si el CTA es chico, lava 600 para destructivo."
            dontText="No uses bruma 400 como cuerpo, ni blanco sobre sol 500, ni savia 600 para un label de 12px."
          />
        </div>
      </section>
    </article>
  )
}
