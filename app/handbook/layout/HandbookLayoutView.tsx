"use client"

import {
  HANDBOOK_GRID_ANATOMY,
  HANDBOOK_GRID_BREAKPOINTS,
  HANDBOOK_GRID_GUIDELINES,
  HANDBOOK_GRID_SPANS,
  HANDBOOK_GRID_TYPES,
  HANDBOOK_LAYOUT_DEVICES,
  HANDBOOK_LAYOUT_PRINCIPLES,
  HANDBOOK_LAYOUT_SHELL,
} from "@/app/handbook/layout/handbookLayoutSpec"
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

function ColumnsVisual({ count }: { count: number }) {
  return (
    <div
      className="grid h-16"
      style={{
        gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
        gap: count > 6 ? 4 : 6,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-sm"
          style={{
            background: "color-mix(in srgb, var(--color-accion) 28%, transparent)",
          }}
        />
      ))}
    </div>
  )
}

function ShellDiagram() {
  return (
    <div className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
      <div
        className="px-4 py-2.5 text-center font-canopy text-xs font-semibold"
        style={{ background: "var(--rootsy-eter-800)", color: "var(--rootsy-eter-50)" }}
      >
        {HANDBOOK_LAYOUT_SHELL.topNav}
      </div>
      <div className="grid sm:grid-cols-[7.5rem_minmax(0,1fr)_6.5rem]">
        <div
          className="hidden px-3 py-8 font-canopy text-xs font-semibold sm:block"
          style={{ background: "var(--rootsy-sombra-700)", color: "var(--rootsy-sombra-50)" }}
        >
          {HANDBOOK_LAYOUT_SHELL.sideNav}
        </div>
        <div className={cn("space-y-2 px-4 py-4", libraryDocSurfaceMutedClass)}>
          <p className={cn("font-canopy text-xs font-semibold", libraryDocPrimaryTextClass)}>
            {HANDBOOK_LAYOUT_SHELL.main}
          </p>
          <ColumnsVisual count={12} />
        </div>
        <div
          className="hidden border-l px-3 py-8 font-canopy text-xs sm:block"
          style={{ borderColor: "var(--color-borde)", color: "var(--color-texto-muted)" }}
        >
          {HANDBOOK_LAYOUT_SHELL.panel}
        </div>
      </div>
    </div>
  )
}

function SpanGallery() {
  return (
    <div className="space-y-3">
      {HANDBOOK_GRID_SPANS.map((span) => (
        <div key={span.span} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
              {span.label}
            </p>
            <p className={cn("font-mono text-[0.75rem]", libraryDocMutedTextClass)}>
              {span.span}/12
            </p>
          </div>
          <div
            className="grid h-9"
            style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 4 }}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="rounded-sm"
                style={{
                  background:
                    index < span.span
                      ? "color-mix(in srgb, var(--color-accion) 40%, transparent)"
                      : "var(--color-elevada)",
                }}
              />
            ))}
          </div>
          <p className={cn("font-stream text-xs", libraryDocMutedTextClass)}>{span.usage}</p>
        </div>
      ))}
    </div>
  )
}

export function HandbookLayoutView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Layout</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        La grilla es el suelo del claro. Doce surcos en desktop; sendas y orillas con tokens
        de espacio. Cards, tablas y formularios se plantan en la grilla. Botones e íconos
        respiran con <Token>space.*</Token>.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_LAYOUT_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="grillas" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Grillas</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Solo el área de contenido entra a la grilla. El cielo de navegación, el bosque
          lateral y los overlays flotan afuera.
        </p>
        <div className="mt-6">
          <ShellDiagram />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Anatomía</h3>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          Surcos, sendas y orillas. Tres piezas; el resto es contenido.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_GRID_ANATOMY.map((part) => (
            <article key={part.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{part.term}</p>
              <p className={cn("mt-1 text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
                {part.natureMetaphor}
              </p>
              <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {part.description}
              </p>
            </article>
          ))}
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Ocupar surcos</h3>
        <div className="mt-4">
          <SpanGallery />
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Alineá cards, tablas y formularios a los surcos. Padding interno con space tokens."
            dontText="No fuerces un botón o un chip a una columna. No anides 12 surcos dentro de cada card chica."
          />
        </div>
      </section>

      <section id="contenedores" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Contenedores</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Tres tipos. Fixed-wide es el default del workspace. Narrow para leer de corrido.
          Fluid cuando el contenido no tiene techo — kanban, lienzo, mesas.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_GRID_TYPES.map((type) => (
            <article
              key={type.id}
              className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}
            >
              <div className={cn("px-4 py-4", libraryDocSurfaceMutedClass)}>
                <div className="flex h-10 items-center justify-center">
                  <div
                    className="h-8 rounded-md"
                    style={{
                      width: type.maxWidthPx ? `${Math.min(100, type.maxWidthPx / 16)}%` : "100%",
                      background: "color-mix(in srgb, var(--color-accion) 28%, transparent)",
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2 px-4 py-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{type.title}</p>
                  {type.isDefault ? (
                    <span className={cn("text-[0.75rem] font-semibold", libraryDocTokenAccentClass)}>
                      Default
                    </span>
                  ) : null}
                </div>
                <p className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
                  {type.natureName}
                  {type.maxWidthPx ? ` · ${type.maxWidthPx}px` : " · sin techo"}
                </p>
                <p className={cn("font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                  {type.useWhen}
                </p>
                <p className={cn("font-stream text-xs", libraryDocMutedTextClass)}>
                  {type.examples}
                </p>
                <p className={cn("font-stream text-xs", libraryDocMutedTextClass)}>
                  Evitar: {type.dontUseFor}
                </p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Fixed-wide en listados y dashboards. Narrow en documentación. Fluid en tableros."
            dontText="No pongas un artículo a 1296px ni una tabla ancha en senda de lectura."
          />
        </div>
      </section>

      <section id="breakpoints" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Breakpoints</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Se miden contra el viewport completo. Colapsar el sidebar no cambia el breakpoint.
          Gutters y márgenes salen de la escala de espacio.
        </p>
        <div className="mt-6">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Rango</th>
                  <th className="px-3 py-2.5">Dispositivo</th>
                  <th className="px-3 py-2.5">Surcos</th>
                  <th className="px-3 py-2.5">Senda</th>
                  <th className="px-3 py-2.5">Orilla</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_GRID_BREAKPOINTS.map((row) => (
                  <tr key={row.id} className={libraryDocTableRowClass}>
                    <td className={cn("px-3 py-2.5 font-mono text-sm", libraryDocPrimaryTextClass)}>
                      {row.id.toUpperCase()}
                      <span className={cn("ml-2 text-[0.75rem]", libraryDocMutedTextClass)}>
                        {row.viewport}
                      </span>
                    </td>
                    <td className={cn("px-3 py-2.5 text-sm", libraryDocMutedTextClass)}>
                      {row.device}
                    </td>
                    <td className={cn("px-3 py-2.5 font-numeric text-sm tabular-nums", libraryDocPrimaryTextClass)}>
                      {row.columns}
                    </td>
                    <td className="px-3 py-2.5">
                      <Token>{row.gutterToken}</Token>
                      <span className={cn("ml-2 font-numeric text-xs", libraryDocMutedTextClass)}>
                        {row.gutterPx}px
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Token>{row.marginToken}</Token>
                      <span className={cn("ml-2 font-numeric text-xs", libraryDocMutedTextClass)}>
                        {row.marginPx}px
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Elegí xxs, xs, m o xl según el viewport. Sendas y orillas con space tokens."
            dontText="No cambies de breakpoint porque el sidebar se plegó. El viewport no cambió."
          />
        </div>
      </section>

      <section id="responsive" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Responsive</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Tres lecturas. El contenido se reordena; la escala de espacio no se inventa. Debajo
          del max-width, fixed se comporta como fluid.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_LAYOUT_DEVICES.map((device) => (
            <article key={device.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <p className={libraryDocMetaLabelClass}>{device.range}</p>
              <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{device.label}</p>
              <p className={cn("mt-1 font-numeric text-sm tabular-nums", libraryDocTokenAccentClass)}>
                {device.columns} surcos
              </p>
              <div className="mt-4">
                <ColumnsVisual count={device.columns} />
              </div>
              <p className={cn("mt-3 font-stream text-xs", libraryDocMutedTextClass)}>
                Senda <Token>{device.gutter}</Token> · orilla <Token>{device.margin}</Token>
              </p>
            </article>
          ))}
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Qué alinear</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_GRID_GUIDELINES.map((guide) => (
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
        <div className="mt-8">
          <LibraryDoDontPair
            doText="2 surcos en el bolsillo, 12 en el escritorio. Overlays con su propio Box, fuera de la grilla."
            dontText="No dejes que una card invada la senda. No snaps de un modal a los surcos de la página."
          />
        </div>
      </section>
    </article>
  )
}
