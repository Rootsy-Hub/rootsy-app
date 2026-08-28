import {
  HANDBOOK_BORDER_COLORS,
  HANDBOOK_BORDER_GUIDELINES,
  HANDBOOK_BORDER_PAIRINGS,
  HANDBOOK_BORDER_PRINCIPLES,
  HANDBOOK_BORDER_SEMANTIC,
  HANDBOOK_BORDER_WIDTHS,
} from "@/app/handbook/border/handbookBorderSpec"
import {
  libraryDocBodyClass,
  libraryDocBorderClass,
  libraryDocMetaLabelClass,
  libraryDocMutedTextClass,
  libraryDocPageTitleClass,
  libraryDocPrimaryTextClass,
  libraryDocSectionTitleClass,
  libraryDocSubheadingClass,
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

export function HandbookBorderView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Borde</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        Un borde en Rootsy casi no se nota — como la orilla de un sendero. Separa, pero el
        ojo sigue caminando. Solo savia interrumpe cuando hay foco o elección.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_BORDER_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="anchos" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Anchos</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Tres medidas. Vena 1px para dividir. Selección y foco a 2px, siempre con savia.
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
              <p className={cn("mt-2 font-stream text-xs", libraryDocMutedTextClass)}>
                Par: {width.pairWith}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="colores" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Colores</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Bruma 200 en claro. Sombra-border en POS. Savia 600 al elegir. Savia 400 al
          enfocar. Lava solo en error.
        </p>
        <div className="mt-6">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Token</th>
                  <th className="px-3 py-2.5">Muestra</th>
                  <th className="px-3 py-2.5">Uso</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_BORDER_COLORS.map((color) => (
                  <tr key={color.token} className={libraryDocTableRowClass}>
                    <td className="px-3 py-2.5">
                      <Token>{color.token}</Token>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-block size-6 rounded-md"
                        style={{
                          boxShadow: `inset 0 0 0 2px ${color.value}`,
                          background: "var(--color-superficie)",
                        }}
                        aria-hidden
                      />
                    </td>
                    <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                      {color.usage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="estados" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Estados</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Reposo, selección, foco, error. Cada estado es un par ancho + color, no un gris
          inventado.
        </p>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Pares</h3>
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
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>En producto</h3>
        <div className="mt-4">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Token</th>
                  <th className="px-3 py-2.5">Componente</th>
                  <th className="px-3 py-2.5">Origen</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_BORDER_SEMANTIC.map((row) => (
                  <tr key={row.token} className={libraryDocTableRowClass}>
                    <td className="px-3 py-2.5">
                      <Token>{row.token}</Token>
                    </td>
                    <td className={cn("px-3 py-2.5 text-sm", libraryDocPrimaryTextClass)}>
                      {row.component}
                    </td>
                    <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                      {row.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText={HANDBOOK_BORDER_GUIDELINES.do}
            dontText={HANDBOOK_BORDER_GUIDELINES.dont}
          />
        </div>
      </section>
    </article>
  )
}
