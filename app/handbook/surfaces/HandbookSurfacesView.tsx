import {
  atmosphereTokenHex,
  type HandbookAtmosphereId,
} from "@/app/handbook/color/handbookColorSpec"
import {
  HANDBOOK_BORDER_PAIRINGS,
  HANDBOOK_BORDER_WIDTHS,
  HANDBOOK_ELEVATION_LEVELS,
  HANDBOOK_RADIUS_TOKENS,
  HANDBOOK_SURFACE_ATMOSPHERES,
  HANDBOOK_SURFACE_PRINCIPLES,
  HANDBOOK_SURFACE_TOKENS,
  HANDBOOK_Z_INDEX,
} from "@/app/handbook/surfaces/handbookSurfacesSpec"
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

function FondoStack({ atmosphereId }: { atmosphereId: HandbookAtmosphereId }) {
  const atmosphere = HANDBOOK_SURFACE_ATMOSPHERES.find((item) => item.id === atmosphereId)
  return (
    <article className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
      <div className="space-y-2 p-4" style={{ background: atmosphereTokenHex(HANDBOOK_SURFACE_TOKENS[0]!, atmosphereId) }}>
        <div
          className="rounded-xl p-3"
          style={{ background: atmosphereTokenHex(HANDBOOK_SURFACE_TOKENS[1]!, atmosphereId) }}
        >
          <div
            className="rounded-lg px-3 py-4"
            style={{ background: atmosphereTokenHex(HANDBOOK_SURFACE_TOKENS[2]!, atmosphereId) }}
          >
            <p
              className="font-canopy text-sm font-semibold"
              style={{
                color: atmosphereId === "bruma" ? "var(--rootsy-bruma-900)" : "var(--rootsy-eter-50)",
              }}
            >
              {atmosphere?.name}
            </p>
            <p
              className="mt-1 font-stream text-xs"
              style={{
                color: atmosphereId === "bruma" ? "var(--rootsy-bruma-600)" : "var(--rootsy-eter-300)",
              }}
            >
              {atmosphere?.sample}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 px-4 py-3">
        {HANDBOOK_SURFACE_TOKENS.map((token) => (
          <div key={token.id} className="flex items-center justify-between gap-2">
            <span className={cn("text-[0.75rem]", libraryDocMutedTextClass)}>{token.label}</span>
            <Token>{token.token}</Token>
          </div>
        ))}
      </div>
    </article>
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
    </div>
  )
}

export function HandbookSurfacesView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Superficies y profundidad</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        Hundido para agrupar, plano para trabajar, flotante para interrumpir. El fondo es el
        aire de la pantalla. El borde delimita. La curva crece con el elemento. La sombra
        aparece cuando hace falta, no de adorno.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {HANDBOOK_SURFACE_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="fondos" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Fondos</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Éter, bruma y sombra son el lienzo. Se elige una atmósfera por contexto. Encima
          viven superficie y elevada — el mismo token, distinta luz.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_SURFACE_ATMOSPHERES.map((atmosphere) => (
            <FondoStack key={atmosphere.id} atmosphereId={atmosphere.id} />
          ))}
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-4")}>
          <Token>--color-fondo</Token> es el lienzo. <Token>--color-superficie</Token> el
          panel. <Token>--color-elevada</Token> la card. No se pinta un hex suelto.
        </p>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Una atmósfera por pantalla. Fondo, superficie y elevada del mismo aire."
            dontText="No mezcles éter de fondo con sombra de card. No uses savia para pintar un lienzo entero."
          />
        </div>
      </section>

      <section id="bordes" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Bordes</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          El borde divide, no decora. 1px bruma en reposo. 2px savia cuando hay elección o
          foco. Ancho y color siempre juntos.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_BORDER_WIDTHS.map((width) => (
            <article key={width.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div
                className="mb-4 h-16 rounded-xl"
                style={{
                  borderWidth: width.value,
                  borderStyle: "solid",
                  borderColor:
                    width.id === "default" ? "var(--color-borde)" : "var(--color-accion)",
                }}
              />
              <p className={libraryDocMetaLabelClass}>{width.natureName}</p>
              <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{width.value}</p>
              <p className="mt-1">
                <Token>{width.token}</Token>
              </p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {width.usage}
              </p>
            </article>
          ))}
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Pares ancho + color</h3>
        <div className="mt-4">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Ancho</th>
                  <th className="px-3 py-2.5">Color</th>
                  <th className="px-3 py-2.5">Uso</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_BORDER_PAIRINGS.map((pair) => (
                  <tr key={pair.id} className={libraryDocTableRowClass}>
                    <td className="px-3 py-2.5">
                      <Token>{pair.widthToken}</Token>
                    </td>
                    <td className="px-3 py-2.5">
                      <Token>{pair.colorToken}</Token>
                    </td>
                    <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                      {pair.usage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Bruma 200 en claro. Sombra-border en POS. Savia 400 en foco. Savia 600 en selección."
            dontText="No uses 2px gris sin token ni dupliques borde fuerte con sombra fuerte."
          />
        </div>
      </section>

      <section id="radio" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Radio</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          De semilla a copa. Poco redondeo en datos densos; más donde el contenedor abraza.
          El anillo de foco es el radio del control + 2px, en savia.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HANDBOOK_RADIUS_TOKENS.map((radius) => (
            <article key={radius.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div
                className={cn("mb-4 h-16", libraryDocSurfaceMutedClass)}
                style={{
                  borderRadius: radius.id === "full" ? 9999 : radius.id === "tile" ? "34%" : radius.value,
                  outline: "2px solid color-mix(in srgb, var(--color-accion) 35%, transparent)",
                  outlineOffset: 2,
                }}
              />
              <p className={libraryDocMetaLabelClass}>{radius.natureName}</p>
              <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{radius.value}</p>
              <p className="mt-1">
                <Token>{radius.token}</Token>
              </p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {radius.usage}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="rounded-lg en inputs. xlarge en cards. xxlarge en modales. Full en avatares."
            dontText="No uses tile en una card ni inventes rounded-[13px]. No pongas xxlarge en un input denso."
          />
        </div>
      </section>

      <section id="elevacion" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Elevación</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Tres lecturas: hundido, plano, flotante. Superficie y sombra van de a pares. Preferí
          borde o aire antes de levantar.
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
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Pares</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Raised siempre con <Token>elevation.shadow.raised</Token>. Overlay siempre con{" "}
          <Token>elevation.shadow.overlay</Token>. Sunken no lleva sombra.
        </p>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Sunken sobre default claro. Raised con su sombra. Borde bruma antes que lift."
            dontText="No mezcles shadow.raised con surface.overlay ni eleves un formulario denso."
          />
        </div>
      </section>

      <section id="capas" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Capas</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          El z-index nombra quién tapa a quién. El contenido vive abajo. El modal, arriba del
          backdrop. El toast, encima del modal. El tooltip, al final.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="relative h-56">
            {[
              { label: "Workspace", z: 100, inset: 0, bg: "var(--rootsy-bruma-100)" },
              { label: "Header", z: 200, inset: 12, bg: "var(--rootsy-bruma-50)" },
              { label: "Dropdown", z: 400, inset: 28, bg: "var(--color-superficie)" },
              { label: "Modal", z: 510, inset: 44, bg: "var(--color-superficie)" },
              { label: "Toast", z: 600, inset: 60, bg: "var(--color-superficie)" },
            ].map((layer) => (
              <div
                key={layer.label}
                className="absolute rounded-xl border px-3 py-2 font-canopy text-xs font-semibold shadow-sm"
                style={{
                  inset: layer.inset,
                  background: layer.bg,
                  borderColor: "var(--color-borde)",
                  zIndex: 1,
                  color: "var(--color-texto)",
                }}
              >
                {layer.label} · {layer.z}
              </div>
            ))}
          </div>
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">z</th>
                  <th className="px-3 py-2.5">Uso</th>
                  <th className="px-3 py-2.5">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_Z_INDEX.map((row) => (
                  <tr key={row.zIndex} className={libraryDocTableRowClass}>
                    <td className={cn("px-3 py-2.5 font-numeric text-sm tabular-nums", libraryDocPrimaryTextClass)}>
                      {row.zIndex}
                    </td>
                    <td className={cn("px-3 py-2.5 text-sm", libraryDocPrimaryTextClass)}>
                      {row.usage}
                    </td>
                    <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                      {row.rootsyExample}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Un z por rol. Dropdown 400, backdrop 500, modal 510, toast 600, tooltip 800."
            dontText="No pongas z-9999 ni un modal debajo de su propio menú."
          />
        </div>
      </section>
    </article>
  )
}
