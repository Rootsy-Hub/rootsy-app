import {
  HANDBOOK_RADIUS_GUIDELINES,
  HANDBOOK_RADIUS_PRINCIPLES,
  HANDBOOK_RADIUS_SEMANTIC,
  HANDBOOK_RADIUS_THEME,
  HANDBOOK_RADIUS_TOKENS,
} from "@/app/handbook/radius/handbookRadiusSpec"
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

function radiusCss(id: string, value: string) {
  if (id === "full") return "9999px"
  if (id === "tile") return "34%"
  return value
}

export function HandbookRadiusView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Radios</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        De semilla a copa. Poco redondeo donde hay datos densos; más donde el contenedor
        abraza. Una escala, un idioma — no se re-decide en cada pantalla.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_RADIUS_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="escala" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Escala</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Ocho pasos, de 2px a círculo. El tile (~34%) es exclusivo del logomark Rootsy.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HANDBOOK_RADIUS_TOKENS.map((radius) => (
            <article key={radius.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div
                className={cn("mb-4 h-16", libraryDocSurfaceMutedClass)}
                style={{
                  borderRadius: radiusCss(radius.id, radius.value),
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
        <p className={cn("mt-6 font-stream text-sm", libraryDocMutedTextClass)}>
          Theme: <Token>--radius {HANDBOOK_RADIUS_THEME.base}</Token> · lg es la base · xl suma
          4px.
        </p>
      </section>

      <section id="uso" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Uso</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Si ya usaste un formulario Rootsy, conocés el radio. La misma curva en todo el
          producto.
        </p>
        <div className="mt-6">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Token</th>
                  <th className="px-3 py-2.5">Componente</th>
                  <th className="px-3 py-2.5">Radio</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_RADIUS_SEMANTIC.map((row) => (
                  <tr key={row.token} className={libraryDocTableRowClass}>
                    <td className="px-3 py-2.5">
                      <Token>{row.token}</Token>
                    </td>
                    <td className={cn("px-3 py-2.5 text-sm", libraryDocPrimaryTextClass)}>
                      {row.component}
                    </td>
                    <td className="px-3 py-2.5">
                      <Token>{row.radiusToken}</Token>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText={HANDBOOK_RADIUS_GUIDELINES.do}
            dontText={HANDBOOK_RADIUS_GUIDELINES.dont}
          />
        </div>
      </section>

      <section id="focus" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Focus</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          El anillo es el radio del control + 2px, en savia 400. Sigue la forma: no hay
          anillo cuadrado sobre un input redondeado.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HANDBOOK_RADIUS_TOKENS.filter((radius) => radius.focusToken).map((radius) => (
            <article key={radius.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div
                className="mb-4 h-14 bg-[var(--color-superficie)]"
                style={{
                  borderRadius: radius.value,
                  boxShadow:
                    "0 0 0 2px color-mix(in srgb, var(--rootsy-savia-400) 45%, transparent)",
                  outlineOffset: 2,
                }}
              />
              <p className={libraryDocMetaLabelClass}>{radius.natureName}</p>
              <p className="mt-1">
                <Token>{radius.focusToken!}</Token>
              </p>
              <p className={cn("mt-2 font-stream text-xs", libraryDocMutedTextClass)}>
                {radius.value} → {radius.focusValue}
              </p>
            </article>
          ))}
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>En producto</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <div
              className="h-10 rounded-lg border bg-[var(--color-superficie)] px-3"
              style={{
                borderColor: "var(--color-borde)",
                boxShadow: "0 0 0 2px color-mix(in srgb, var(--rootsy-savia-400) 45%, transparent)",
              }}
            />
            <p className={cn("mt-3 text-sm", libraryDocPrimaryTextClass)}>Input</p>
            <p className={cn("mt-1 font-stream text-xs", libraryDocMutedTextClass)}>
              radius.large · focus 14px
            </p>
          </div>
          <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <div
              className="h-16 rounded-[1.375rem] border bg-[var(--color-superficie)]"
              style={{ borderColor: "var(--color-borde)" }}
            />
            <p className={cn("mt-3 text-sm", libraryDocPrimaryTextClass)}>Modal</p>
            <p className={cn("mt-1 font-stream text-xs", libraryDocMutedTextClass)}>
              radius.xxlarge
            </p>
          </div>
          <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <div className="size-12 rounded-full bg-[var(--rootsy-bruma-200)]" />
            <p className={cn("mt-3 text-sm", libraryDocPrimaryTextClass)}>Avatar</p>
            <p className={cn("mt-1 font-stream text-xs", libraryDocMutedTextClass)}>
              radius.full
            </p>
          </div>
        </div>
      </section>
    </article>
  )
}
