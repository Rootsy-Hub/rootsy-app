import {
  HANDBOOK_LAYOUT_PRIMITIVES,
  HANDBOOK_SPACING_BASE_PX,
  HANDBOOK_SPACING_DENSITIES,
  HANDBOOK_SPACING_GUIDELINES,
  HANDBOOK_SPACING_NEGATIVES,
  HANDBOOK_SPACING_PRINCIPLES,
  HANDBOOK_SPACING_RANGES,
  HANDBOOK_SPACING_ROLES,
  HANDBOOK_SPACING_TIERS,
  HANDBOOK_SPACING_TOKENS,
} from "@/app/handbook/spacing/handbookSpacingSpec"
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

function Token({ children }: { children: string }) {
  return (
    <code className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
      {children}
    </code>
  )
}

function ScaleBars() {
  return (
    <div className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
      {HANDBOOK_SPACING_TOKENS.map((token, index) => {
        const isBase = token.token === "space.100"
        return (
          <div
            key={token.id}
            className={cn(
              "flex flex-wrap items-center gap-3 px-4 py-2.5",
              index < HANDBOOK_SPACING_TOKENS.length - 1 && "border-b",
              libraryDocBorderClass,
              isBase && libraryDocSurfaceMutedClass,
            )}
          >
            <p className={cn("w-28 shrink-0 font-mono text-sm", libraryDocPrimaryTextClass)}>
              {token.token}
            </p>
            <p className={cn("w-24 shrink-0 text-[0.75rem]", libraryDocMutedTextClass)}>
              {token.natureName === "—" ? "" : token.natureName}
            </p>
            <div className="min-w-0 flex-1">
              <div
                className="h-4 rounded-sm"
                style={{
                  width: Math.max(token.px, 2),
                  background: isBase
                    ? "var(--color-accion)"
                    : "color-mix(in srgb, var(--color-accion) 22%, transparent)",
                  outline: isBase ? "2px solid var(--color-accion)" : undefined,
                }}
              />
            </div>
            <p
              className={cn(
                "w-16 shrink-0 text-right font-numeric text-sm tabular-nums",
                libraryDocPrimaryTextClass,
              )}
            >
              {token.px}px
            </p>
            <p className={cn("w-14 shrink-0 text-right font-mono text-[0.75rem]", libraryDocMutedTextClass)}>
              {token.multiplier}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function NatureTiers() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {HANDBOOK_SPACING_TIERS.map((tier, index) => (
        <article
          key={tier.id}
          className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: `color-mix(in srgb, var(--color-accion) ${35 + index * 10}%, var(--color-borde))`,
          }}
        >
          <p className={libraryDocMetaLabelClass}>{tier.subtitle}</p>
          <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{tier.title}</p>
          <p className={cn("mt-1 font-numeric text-sm tabular-nums", libraryDocTokenAccentClass)}>
            {tier.pxRange}
          </p>
          <p className={cn("mt-1 font-mono text-[0.75rem]", libraryDocMutedTextClass)}>
            {tier.tokenRange}
          </p>
          <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
            {tier.description}
          </p>
        </article>
      ))}
    </div>
  )
}

function RolesTable() {
  return (
    <div className={libraryDocTableShellOverflowClass}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Rol</th>
            <th className="px-3 py-2.5">Token</th>
            <th className="px-3 py-2.5">Tamaño</th>
            <th className="px-3 py-2.5">Uso</th>
          </tr>
        </thead>
        <tbody>
          {HANDBOOK_SPACING_ROLES.map((row) => (
            <tr key={row.id} className={libraryDocTableRowClass}>
              <td className={cn("px-3 py-2.5 font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                {row.role}
              </td>
              <td className="px-3 py-2.5">
                <Token>{row.token}</Token>
              </td>
              <td className={cn("px-3 py-2.5 font-numeric text-sm tabular-nums", libraryDocPrimaryTextClass)}>
                {row.px}px
              </td>
              <td className={cn("px-3 py-2.5 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {row.usage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FieldStackSpecimen() {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        libraryDocBorderClass,
        libraryDocSurfaceMutedClass,
      )}
    >
      <div className="border-b px-5 py-4" style={{ borderColor: "var(--color-borde)" }}>
        <p className="rootsy-text-page-title text-[var(--color-texto)]">Nueva venta</p>
        <p className="rootsy-text-meta mt-1 text-[var(--color-texto-muted)]">
          Título ↔ meta · <Token>space.100</Token>
        </p>
      </div>
      <div className="space-y-6 px-5 py-5">
        <label className="block">
          <span className="rootsy-text-meta font-medium text-[var(--color-texto)]">Producto</span>
          <span
            className="mt-2 block rounded-lg border px-3 py-2 rootsy-text-body text-[var(--color-texto)]"
            style={{
              borderColor: "var(--color-borde)",
              background: "var(--color-superficie)",
              paddingInline: "var(--rootsy-space-150)",
              paddingBlock: "var(--rootsy-space-100)",
            }}
          >
            Medialuna clásica
          </span>
          <span className="rootsy-text-meta mt-2 block text-[var(--color-texto-muted)]">
            Label → campo → hint · <Token>space.100</Token> · inset <Token>space.150</Token>
          </span>
        </label>
        <div className="flex items-end justify-between gap-4">
          <p className="rootsy-text-meta text-[var(--color-texto-muted)]">
            Entre grupos · <Token>space.300</Token>
          </p>
          <p className="rootsy-text-metric text-[var(--color-texto)]">$ 4.800</p>
        </div>
        <div
          className="rounded-lg px-4 py-2.5 text-center font-canopy text-sm font-medium text-white"
          style={{ background: "var(--color-accion)" }}
        >
          Confirmar venta
        </div>
      </div>
    </div>
  )
}

function DensityCards() {
  const items = ["Medialuna", "Café con leche", "Jugo de naranja"]
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {HANDBOOK_SPACING_DENSITIES.map((density) => {
        const range = HANDBOOK_SPACING_RANGES[density.range]
        return (
          <article
            key={density.id}
            className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}
          >
            <div className={cn("px-4 py-3", libraryDocSurfaceMutedClass)}>
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{density.label}</p>
              <p className={libraryDocMetaLabelClass}>{range.label}</p>
            </div>
            <div className="px-4 py-4">
              <div className="flex flex-col" style={{ gap: density.gapPx }}>
                {items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center rounded-lg border px-3 py-2"
                    style={{
                      borderColor: "var(--color-borde)",
                      gap: density.gapPx,
                    }}
                  >
                    <span
                      className="size-6 shrink-0 rounded-md"
                      style={{
                        background: "color-mix(in srgb, var(--color-accion) 22%, transparent)",
                      }}
                    />
                    <span className={cn("rootsy-text-body", libraryDocPrimaryTextClass)}>{item}</span>
                  </div>
                ))}
              </div>
              <p className={cn("mt-4 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {density.usage}
              </p>
              <p className="mt-2">
                <Token>{density.token}</Token>
                <span className={cn("ml-2 font-numeric text-[0.75rem] tabular-nums", libraryDocMutedTextClass)}>
                  {density.gapPx}px
                </span>
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function RangeOverview() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {(["small", "medium", "large"] as const).map((range) => {
        const meta = HANDBOOK_SPACING_RANGES[range]
        return (
          <div key={range} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{meta.label}</p>
            <p className={cn("mt-1 font-mono text-[0.75rem]", libraryDocTokenAccentClass)}>
              {meta.tokenRange}
            </p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {meta.description}
            </p>
            <ul className={cn("mt-3 space-y-1 font-stream text-xs", libraryDocMutedTextClass)}>
              {meta.examples.map((example) => (
                <li key={example}>· {example}</li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function SimilarityDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
        <p className={libraryDocMetaLabelClass}>Hacer</p>
        <div className="mt-3 flex flex-col" style={{ gap: "var(--rootsy-space-100)" }}>
          {["Ítem 1", "Ítem 2", "Ítem 3"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "var(--color-elevada)" }}
            >
              <span
                className="size-8 shrink-0 rounded-md"
                style={{
                  background: "color-mix(in srgb, var(--color-accion) 22%, transparent)",
                }}
              />
              <span className={cn("rootsy-text-body", libraryDocPrimaryTextClass)}>{label}</span>
            </div>
          ))}
        </div>
        <p className={cn("mt-3 font-stream text-xs", libraryDocMutedTextClass)}>
          Mismo tipo, mismo gap · <Token>space.100</Token>
        </p>
      </div>
      <div className={cn("rounded-2xl border px-4 py-4 opacity-80", libraryDocBorderClass)}>
        <p className={libraryDocMetaLabelClass}>Evitar</p>
        <div className="mt-3">
          {[8, 20, 4].map((gap, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                background: "var(--color-elevada)",
                marginBottom: gap,
              }}
            >
              <span
                className="size-8 shrink-0 rounded-md"
                style={{
                  background: "color-mix(in srgb, var(--color-accion) 22%, transparent)",
                }}
              />
              <span className={cn("rootsy-text-body", libraryDocPrimaryTextClass)}>
                Ítem {index + 1} · {gap}px
              </span>
            </div>
          ))}
        </div>
        <p className={cn("mt-1 font-stream text-xs", libraryDocMutedTextClass)}>
          Gaps distintos en una lista homogénea.
        </p>
      </div>
    </div>
  )
}

function PrimitiveCards() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {HANDBOOK_LAYOUT_PRIMITIVES.map((primitive) => (
        <article
          key={primitive.id}
          className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}
        >
          <div className={cn("px-4 py-4", libraryDocSurfaceMutedClass)}>
            {primitive.id === "box" ? (
              <div
                className="rounded-xl border border-dashed p-3"
                style={{
                  borderColor: "var(--color-borde)",
                  padding: "var(--rootsy-space-200)",
                }}
              >
                <div
                  className="h-10 rounded-lg"
                  style={{
                    background: "color-mix(in srgb, var(--color-accion) 18%, transparent)",
                  }}
                />
              </div>
            ) : primitive.id === "inline" ? (
              <div className="flex" style={{ gap: "var(--rootsy-space-100)" }}>
                {["A", "B", "C"].map((label) => (
                  <div
                    key={label}
                    className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg font-canopy text-xs font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--color-accion) 18%, transparent)",
                      color: "var(--color-texto)",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col" style={{ gap: "var(--rootsy-space-100)" }}>
                {["A", "B", "C"].map((label) => (
                  <div
                    key={label}
                    className="flex h-8 items-center justify-center rounded-lg font-canopy text-xs font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--color-accion) 18%, transparent)",
                      color: "var(--color-texto)",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2 px-4 py-4">
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{primitive.title}</p>
            <p className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
              {primitive.subtitle}
            </p>
            <p className={cn("font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
              {primitive.description}
            </p>
            <p className={cn("font-mono text-[0.75rem]", libraryDocMutedTextClass)}>
              Figma: {primitive.figmaHint}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

export function HandbookSpacingView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Espaciado y proporciones</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        El espaciado de Rootsy respira. Todo parte de {HANDBOOK_SPACING_BASE_PX}px —{" "}
        <Token>space.100</Token>, la hoja. Lo relacionado queda cerca; los capítulos se
        separan. Si el tamaño no está en la escala, no entra.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {HANDBOOK_SPACING_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section
        id="escala-de-espaciado"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Escala de espaciado</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Base {HANDBOOK_SPACING_BASE_PX}px. El sufijo es el porcentaje de esa unidad:{" "}
          <Token>space.200</Token> es 200% = 16px. Seis capas nature le dan nombre al ritmo —
          rocío, hoja, rama, tronco, claro, horizonte.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Capas nature</h3>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          Cada distancia tiene territorio. Denso donde los elementos comparten savia; amplio
          donde la vista descansa.
        </p>
        <div className="mt-4">
          <NatureTiers />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Tokens</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Catorce pasos, de 0 a 80px. <Token>space.100</Token> es la unidad viva. En código,
          <Token>--rootsy-space-100</Token>. En Figma, el mismo nombre.
        </p>
        <div className="mt-4">
          <ScaleBars />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Valores negativos</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Rompen el padding del contenedor con intención: bleed, overlap, imagen de borde a
          borde. No son un atajo para corregir un layout mal medido.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {HANDBOOK_SPACING_NEGATIVES.map((row) => (
            <span
              key={row.token}
              className={cn(
                "rounded-full border px-3 py-1 font-canopy text-xs",
                libraryDocBorderClass,
                libraryDocPrimaryTextClass,
              )}
            >
              <span className="font-mono">{row.token}</span>
              <span className={cn("ml-2 font-numeric tabular-nums", libraryDocMutedTextClass)}>
                {row.px}px
              </span>
            </span>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Elegí el token más cercano. Si el ojo pide un paso, subí o bajá en la escala."
            dontText="No inventes 7px, 14px ni 15px. Tampoco uses un negativo para tapar un padding mal puesto."
          />
        </div>
      </section>

      <section
        id="tamanos"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Tamaños</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Cada tamaño tiene un trabajo. El stack de campo es 8px. El inset de un input es 12px.
          El padding de un panel es 32px. No se re-decide en cada pantalla.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <FieldStackSpecimen />
          <div className="space-y-3">
            {HANDBOOK_SPACING_ROLES.slice(0, 4).map((role) => (
              <div key={role.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
                <p className={libraryDocMetaLabelClass}>{role.role}</p>
                <p className={cn("mt-2 font-numeric text-lg tabular-nums", libraryDocPrimaryTextClass)}>
                  {role.px}px
                </p>
                <p className="mt-1">
                  <Token>{role.token}</Token>
                </p>
                <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                  {role.usage}
                </p>
              </div>
            ))}
          </div>
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Roles semánticos</h3>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          De la savia del campo al horizonte del hero. El token nombra el trabajo, no el pixel.
        </p>
        <div className="mt-4">
          <RolesTable />
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Label, campo e hint con space.100. Grupos de formulario con space.300. Panel con space.400."
            dontText="No dejes más aire entre el label y el campo que entre el campo y el hint."
          />
        </div>
      </section>

      <section
        id="densidad"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Densidad</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Tres bandas para decidir rápido. Compacta para operar. Cómoda para componer.
          Amplia para separar capítulos. La densidad cambia el ritmo; no la escala.
        </p>
        <div className="mt-6">
          <DensityCards />
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Rangos de uso</h3>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          Pequeño, mediano y grande. Si dudás, preguntate si estás dentro de un control, de
          un componente o de una página.
        </p>
        <div className="mt-4">
          <RangeOverview />
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Compacto en tablas y chips. Aire entre secciones de página. Una densidad por agrupación."
            dontText="No uses el mismo gap entre ícono y texto que entre el header y el contenido."
          />
        </div>
      </section>

      <section
        id="proporciones"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Proporciones</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          El ritmo agrupa antes que el contorno. Ítems del mismo tipo comparten gap. Lo
          relacionado se acerca. Los capítulos se separan. Box envuelve; Inline o Stack
          organizan adentro — capas distintas, no un frame genérico.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Similitud y proximidad</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Una lista homogénea usa un solo token. El título se pega a su descripción; el bloque
          de acciones se aleja.
        </p>
        <div className="mt-4">
          <SimilarityDemo />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Guías</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_SPACING_GUIDELINES.map((guide) => (
            <div key={guide.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{guide.title}</p>
              <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {guide.doText}
              </p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                Evitar: {guide.dontText}
              </p>
            </div>
          ))}
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Primitivos de layout</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Tres building blocks. El padding, el gap y la dirección salen de tokens. En Figma,
          el mismo mapa: frame con padding, auto layout horizontal, auto layout vertical.
        </p>
        <div className="mt-4">
          <PrimitiveCards />
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Box para la superficie. Inline o Stack adentro, con un gap de la escala. El handover coincide con space.200, no con 15px."
            dontText="No mezcles space.100 y space.200 en una lista homogénea, ni resuelvas padding y gap en un solo frame genérico."
          />
        </div>
      </section>
    </article>
  )
}
