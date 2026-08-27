import {
  HANDBOOK_LOADING_STATES,
  HANDBOOK_MOTION_DURATIONS,
  HANDBOOK_MOTION_EASINGS,
  HANDBOOK_MOTION_GUIDELINES,
  HANDBOOK_MOTION_KEYFRAMES,
  HANDBOOK_MOTION_PRINCIPLES,
  HANDBOOK_MOTION_PROPERTIES,
  HANDBOOK_MOTION_RANGES,
  HANDBOOK_MOTION_SEMANTIC,
} from "@/app/handbook/motion/handbookMotionSpec"
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

function DurationBar({ ms, isBase }: { ms: number; isBase?: boolean }) {
  const width = Math.max(8, Math.round((ms / 600) * 100))
  return (
    <div
      className="h-3 rounded-full motion-safe:transition-[width] motion-reduce:transition-none"
      style={{
        width: `${width}%`,
        background: isBase
          ? "var(--color-accion)"
          : "color-mix(in srgb, var(--color-accion) 28%, transparent)",
        transitionDuration: `${ms}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 1, 0.6, 1)",
      }}
    />
  )
}

export function HandbookMotionView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Movimiento</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        El movimiento dice qué cambió y desde dónde. Brisa en el hover, ráfaga al abrir un
        modal, despegue al irse. Orgánico, ágil, y apagado si el sistema pide menos
        movimiento.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {HANDBOOK_MOTION_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section
        id="principios-de-movimiento"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Principios de movimiento</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Tokens semánticos primero. Transform y opacity, no width ni top. El origen espacial
          se entiende: el dropdown nace en su trigger, no en el vacío.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_MOTION_GUIDELINES.map((guide) => (
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
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Propiedades</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HANDBOOK_MOTION_PROPERTIES.map((property) => (
            <article key={property.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{property.title}</p>
              <p className={cn("mt-1 text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
                {property.natureMetaphor}
              </p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {property.description}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="motion.modal.enter. Transform y opacity. Salida más corta que la entrada."
            dontText="No animes width, height, top o left. No uses 300ms ease-in-out genérico."
          />
        </div>
      </section>

      <section id="duraciones" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Duraciones</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Ocho pasos, de 0 a 600ms. Hover casi instantáneo. Modal a 250ms. 600ms es
          expresivo — una vez por sesión, no cien veces al día.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {(Object.keys(HANDBOOK_MOTION_RANGES) as Array<keyof typeof HANDBOOK_MOTION_RANGES>).map(
            (range) => (
              <div key={range} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
                <p className={cn(libraryDocSectionTitleClass, "text-sm")}>
                  {HANDBOOK_MOTION_RANGES[range].label}
                </p>
                <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                  {HANDBOOK_MOTION_RANGES[range].description}
                </p>
              </div>
            ),
          )}
        </div>
        <div className={cn("mt-6 overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
          {HANDBOOK_MOTION_DURATIONS.map((row, index) => (
            <div
              key={row.id}
              className={cn(
                "grid items-center gap-3 px-4 py-2.5 sm:grid-cols-[8rem_5rem_minmax(0,1fr)_minmax(0,12rem)]",
                index < HANDBOOK_MOTION_DURATIONS.length - 1 && "border-b",
                libraryDocBorderClass,
              )}
            >
              <p className={cn("font-mono text-sm", libraryDocPrimaryTextClass)}>{row.token.replace("motion.duration.", "")}</p>
              <p className={cn("font-numeric text-sm tabular-nums", libraryDocPrimaryTextClass)}>
                {row.ms}ms
              </p>
              <DurationBar ms={row.ms} isBase={row.id === "short"} />
              <p className={cn("font-stream text-xs", libraryDocMutedTextClass)}>{row.usage}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="50ms en hover. 150ms en dropdown. 250ms en modal. 600ms solo en onboarding."
            dontText="No pongas una animación larga en una acción que se repite todo el turno."
          />
        </div>
      </section>

      <section id="curvas" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Curvas</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Cuatro easings con nombre de bosque. Aterrizaje para entrar. Despegue para salir.
          Brisa suave para lo cotidiano. Balance para el scale del modal.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_MOTION_EASINGS.map((easing) => (
            <article key={easing.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div
                className="mb-4 h-2 overflow-hidden rounded-full"
                style={{ background: "var(--color-elevada)" }}
              >
                <div
                  className="h-full w-2/3 rounded-full"
                  style={{
                    background: "var(--color-accion)",
                    transition: `transform 400ms ${easing.cubicBezier}`,
                  }}
                />
              </div>
              <p className={libraryDocMetaLabelClass}>{easing.natureName}</p>
              <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{easing.token}</p>
              <p className={cn("mt-2 font-mono text-[0.75rem]", libraryDocMutedTextClass)}>
                {easing.cubicBezier}
              </p>
              <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {easing.usage}
              </p>
              <p className={cn("mt-1 font-stream text-xs", libraryDocMutedTextClass)}>
                {easing.bestFor}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="out.bold al entrar. in.practical al salir. out.practical en hover y popup."
            dontText="No uses ease-in-out de CSS ni un resorte elástico que rebota."
          />
        </div>
      </section>

      <section id="transiciones" className="scroll-mt-24 border-t border-[var(--color-borde)] py-10">
        <h2 className={libraryDocSectionTitleClass}>Transiciones</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Un token semántico empaqueta duración, curva y propiedades. El dropdown entra desde
          abajo. El modal escala 95→100. La salida siempre es más corta.
        </p>
        <div className="mt-6">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Token</th>
                  <th className="px-3 py-2.5">Componente</th>
                  <th className="px-3 py-2.5">Duración</th>
                  <th className="px-3 py-2.5">Propiedades</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_MOTION_SEMANTIC.map((row) => (
                  <tr key={row.token} className={libraryDocTableRowClass}>
                    <td className="px-3 py-2.5">
                      <Token>{row.token}</Token>
                    </td>
                    <td className={cn("px-3 py-2.5 text-sm", libraryDocPrimaryTextClass)}>
                      {row.component}
                    </td>
                    <td className={cn("px-3 py-2.5 font-mono text-xs", libraryDocMutedTextClass)}>
                      {row.durationToken.replace("motion.duration.", "")}
                    </td>
                    <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                      {row.properties.join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Keyframes</h3>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          Fade y scale. Building blocks; no se inventa un tercer eje.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_MOTION_KEYFRAMES.map((frame) => (
            <div key={frame.token} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <Token>{frame.token}</Token>
              <p className={cn("mt-2 font-mono text-xs", libraryDocMutedTextClass)}>{frame.value}</p>
              <p className={cn("mt-2 font-stream text-sm", libraryDocMutedTextClass)}>{frame.usage}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="motion.popup.enter.bottom desde el trigger. motion.modal.enter con scale y fade."
            dontText="No hagas aparecer un menú desde el centro de la pantalla, sin relación con el botón."
          />
        </div>
      </section>

      <section
        id="estados-de-carga"
        className="scroll-mt-24 border-t border-[var(--color-borde)] py-10"
      >
        <h2 className={libraryDocSectionTitleClass}>Estados de carga</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          La espera también se mueve con tokens. Opacidad, no layout. Si el sistema pide
          menos movimiento, el estado queda quieto.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_LOADING_STATES.map((state) => (
            <article key={state.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div className={cn("mb-4 space-y-2 rounded-xl px-3 py-4", libraryDocSurfaceMutedClass)}>
                {state.id === "skeleton" ? (
                  <>
                    <div className="h-3 w-3/4 rounded-full bg-[color-mix(in_srgb,var(--color-accion)_18%,transparent)] motion-safe:animate-pulse" />
                    <div className="h-3 w-full rounded-full bg-[color-mix(in_srgb,var(--color-accion)_12%,transparent)] motion-safe:animate-pulse" />
                    <div className="h-3 w-1/2 rounded-full bg-[color-mix(in_srgb,var(--color-accion)_12%,transparent)] motion-safe:animate-pulse" />
                  </>
                ) : state.id === "spinner" ? (
                  <div className="flex h-10 items-center justify-center">
                    <span
                      className="size-5 rounded-full border-2 border-[var(--color-borde)] border-t-[var(--color-accion)] motion-safe:animate-spin motion-reduce:animate-none"
                    />
                  </div>
                ) : (
                  <div className="relative h-16 overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_24%,transparent)]">
                    <div className="absolute inset-x-6 inset-y-4 rounded-lg bg-[var(--color-superficie)]" />
                  </div>
                )}
              </div>
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{state.label}</p>
              <p className="mt-1">
                <Token>{state.token}</Token>
              </p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {state.usage}
              </p>
            </article>
          ))}
        </div>
        <p className={cn(libraryDocBodyClass, "mt-6")}>
          <Token>prefers-reduced-motion: reduce</Token> resuelve a{" "}
          <Token>motion.duration.instant</Token> o a none. Sin flash, sin oscilación, sin
          spinner eterno.
        </p>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Esqueleto con opacity. Overlay con motion.blanket.enter. Reduced-motion apaga el pulso."
            dontText="No animes el alto del placeholder ni ignores la preferencia del sistema."
          />
        </div>
      </section>
    </article>
  )
}
