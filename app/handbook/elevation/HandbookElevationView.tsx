import {
  HANDBOOK_ELEVATION_DARK,
  HANDBOOK_ELEVATION_GUIDELINES,
  HANDBOOK_ELEVATION_INTERACTION,
  HANDBOOK_ELEVATION_LEVELS,
  HANDBOOK_ELEVATION_LIGHT,
  HANDBOOK_ELEVATION_PRINCIPLES,
  HANDBOOK_ELEVATION_SEMANTIC,
  HANDBOOK_ELEVATION_SHADOWS,
  HANDBOOK_SUNKEN_VS_NEUTRAL,
} from "@/app/handbook/elevation/handbookElevationSpec"
import {
  libraryDocBodyClass,
  libraryDocBorderClass,
  libraryDocMetaLabelClass,
  libraryDocMutedTextClass,
  libraryDocPageTitleClass,
  libraryDocPrimaryTextClass,
  libraryDocSectionTitleClass,
  libraryDocSubheadingClass,
  libraryDocSurfaceMutedClass,
  libraryDocTableHeaderClass,
  libraryDocTableRowClass,
  libraryDocTableShellOverflowClass,
  libraryDocTokenAccentClass,
  handbookDocChapterClass,
  handbookDocIntroAfterClass,
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

function ElevationCard({
  level,
}: {
  level: (typeof HANDBOOK_ELEVATION_LEVELS)[number]
}) {
  const isRaised = level.id === "raised"
  const isOverlay = level.id === "overlay"
  const isSunken = level.id === "sunken"
  const isBordered = level.id === "default-bordered"
  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{
        background: isSunken
          ? "var(--rootsy-bruma-50)"
          : isOverlay || isRaised
            ? "var(--color-superficie)"
            : "var(--rootsy-bruma-100)",
        border: isBordered ? "1px solid var(--color-borde)" : "1px solid transparent",
        boxShadow: isRaised
          ? "0 1px 2px rgb(5 8 7 / 0.07), 0 4px 14px rgb(5 8 7 / 0.08)"
          : isOverlay
            ? "0 22px 70px -18px rgb(5 8 7 / 0.28)"
            : undefined,
      }}
    >
      <p className={libraryDocMetaLabelClass}>{level.natureName}</p>
      <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{level.label}</p>
      <p className="mt-2">
        <Token>{level.token}</Token>
      </p>
      <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
        {level.usage}
      </p>
      {level.pairRule ? (
        <p className={cn("mt-2 font-stream text-xs", libraryDocMutedTextClass)}>{level.pairRule}</p>
      ) : null}
    </div>
  )
}

export function HandbookElevationView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Elevación</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        Hundido para agrupar, plano para trabajar, flotante para interrumpir. Superficie y
        sombra van de a pares. Preferí borde o aire antes de levantar.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_ELEVATION_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="niveles" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Niveles</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Del suelo al dosel. Sunken agrupa. Default trabaja. Raised pide un foco. Overlay
          interrumpe.
        </p>
        <div
          className={cn("mt-6 rounded-3xl p-6", libraryDocSurfaceMutedClass)}
          style={{ background: "var(--rootsy-bruma-100)" }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HANDBOOK_ELEVATION_LEVELS.filter((level) => level.id !== "overflow").map((level) => (
              <ElevationCard key={level.id} level={level} />
            ))}
          </div>
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Sunken vs transparente</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>Sunken</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {HANDBOOK_SUNKEN_VS_NEUTRAL.sunken}
            </p>
          </div>
          <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>Neutro</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {HANDBOOK_SUNKEN_VS_NEUTRAL.neutral}
            </p>
          </div>
        </div>
      </section>

      <section id="sombras" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Sombras</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Matiz bosque. Raised siempre con su sombra. Overlay siempre con la suya. Overflow
          es un degradé de borde, no un lift.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_ELEVATION_SHADOWS.map((shadow) => (
            <article key={shadow.token} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div
                className="mb-4 h-16 rounded-xl bg-[var(--color-superficie)]"
                style={{
                  boxShadow:
                    shadow.token === "elevation.shadow.overflow"
                      ? "inset -16px 0 16px -12px rgb(5 8 7 / 0.18)"
                      : shadow.token === "elevation.shadow.overlay"
                        ? "0 22px 70px -18px rgb(5 8 7 / 0.28)"
                        : "0 1px 2px rgb(5 8 7 / 0.07), 0 4px 14px rgb(5 8 7 / 0.08)",
                }}
              />
              <p className="mt-1">
                <Token>{shadow.token}</Token>
              </p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                Par: {shadow.pairsWith}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText={HANDBOOK_ELEVATION_GUIDELINES.do}
            dontText={HANDBOOK_ELEVATION_GUIDELINES.dont}
          />
        </div>
      </section>

      <section id="superficies" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Superficies</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Workspace sube hacia blanco. POS separa capas con sombra. El mismo nivel, distinta
          luz.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <article className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
            <div className="px-4 py-3">
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>Claro</p>
            </div>
            {HANDBOOK_ELEVATION_LIGHT.map((row) => (
              <div
                key={row.token}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
                style={{ background: row.value }}
              >
                <Token>{row.token}</Token>
                <span className={cn("font-stream text-xs", libraryDocMutedTextClass)}>
                  {row.mapsTo}
                </span>
              </div>
            ))}
          </article>
          <article className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
            <div className="px-4 py-3" style={{ background: "var(--rootsy-sombra-800)" }}>
              <p className="font-canopy text-sm font-semibold text-[var(--rootsy-eter-50)]">
                Oscuro
              </p>
            </div>
            {HANDBOOK_ELEVATION_DARK.map((row) => (
              <div
                key={row.token}
                className="flex items-center justify-between gap-3 px-4 py-2.5"
                style={{ background: row.value }}
              >
                <code className="text-[0.75rem] font-medium text-[var(--rootsy-eter-100)]">
                  {row.token}
                </code>
                <span className="font-stream text-xs text-[var(--rootsy-eter-300)]">
                  {row.note}
                </span>
              </div>
            ))}
          </article>
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>En producto</h3>
        <div className="mt-4">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Token</th>
                  <th className="px-3 py-2.5">Componente</th>
                  <th className="px-3 py-2.5">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_ELEVATION_SEMANTIC.map((row) => (
                  <tr key={row.token} className={libraryDocTableRowClass}>
                    <td className="px-3 py-2.5">
                      <Token>{row.token}</Token>
                    </td>
                    <td className={cn("px-3 py-2.5 text-sm", libraryDocPrimaryTextClass)}>
                      {row.component}
                    </td>
                    <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                      {row.levelId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="interaccion" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Interacción</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          El hover cambia de superficie antes de subir de nivel. Pressed da feedback táctil
          sin levantar la card.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_ELEVATION_INTERACTION.map((state) => (
            <article key={state.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <p className={libraryDocMetaLabelClass}>{state.state}</p>
              <p className="mt-1">
                <Token>{state.surfaceToken}</Token>
              </p>
              <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {state.notes}
              </p>
            </article>
          ))}
        </div>
      </section>
    </article>
  )
}
