import { handbookColorHex } from "@/app/handbook/color/handbookColorPalettes"
import {
  functionalRecipeHex,
  HANDBOOK_FUNCTIONAL_RECIPES,
  worldAtmosphereHex,
  type HandbookAtmosphereId,
  type HandbookWorldAtmosphereId,
} from "@/app/handbook/color/handbookColorSpec"
import {
  HANDBOOK_BLOCKS_ATMOSPHERE_LAYERS,
  HANDBOOK_SURFACE_ATMOSPHERES,
  HANDBOOK_SURFACE_LIENZOS,
  HANDBOOK_SURFACE_PRINCIPLES,
  HANDBOOK_SURFACE_TOKENS,
  HANDBOOK_Z_INDEX,
} from "@/app/handbook/surfaces/handbookSurfacesSpec"
import {
  libraryDocBodyClass,
  libraryDocBorderClass,
  libraryDocMutedTextClass,
  libraryDocPageDescriptionClass,
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
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import "@/components/data-workspace/dataWorkspaceTablesAtmosphere.css"
import "@/components/layouts-tables/rootsLayoutsTablesScope.css"
import { cn } from "@/lib/utils"
import { Calculator } from "lucide-react"
import type { ReactNode } from "react"

function Token({ children }: { children: string }) {
  return (
    <code className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
      {children}
    </code>
  )
}

function SurfaceChart({ familyId }: { familyId: HandbookAtmosphereId }) {
  const quietSteps = familyId === "bruma" ? (["200", "300", "200"] as const) : (["800", "700", "600"] as const)
  const heights = ["42%", "60%", "76%"] as const

  return (
    <div className="mt-4 flex h-12 items-end gap-1" aria-hidden>
      {quietSteps.map((step, index) => (
        <span
          key={`${familyId}-${step}-${index}`}
          className="min-w-0 flex-1 rounded-sm"
          style={{
            height: heights[index],
            backgroundColor: handbookColorHex(familyId, step),
          }}
        />
      ))}
      <span
        className="min-w-0 flex-1 rounded-sm"
        style={{
          height: "100%",
          backgroundColor: handbookColorHex("savia", "500"),
        }}
      />
    </div>
  )
}

function FondoStack({ atmosphereId }: { atmosphereId: HandbookWorldAtmosphereId }) {
  const atmosphere = HANDBOOK_SURFACE_ATMOSPHERES.find((item) => item.id === atmosphereId)
  const accion = HANDBOOK_FUNCTIONAL_RECIPES.find((recipe) => recipe.id === "accion")!
  return (
    <article className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
      <div className="space-y-2 p-4" style={{ background: worldAtmosphereHex("fondo", atmosphereId) }}>
        <div
          className="rounded-xl p-3"
          style={{ background: worldAtmosphereHex("superficie", atmosphereId) }}
        >
          <div
            className="rounded-lg px-3 py-4"
            style={{ background: worldAtmosphereHex("elevada", atmosphereId) }}
          >
            <p
              className="font-canopy text-sm font-semibold"
              style={{ color: worldAtmosphereHex("texto", atmosphereId) }}
            >
              {atmosphere?.name}
            </p>
            <p
              className="mt-1 font-stream text-xs leading-relaxed"
              style={{ color: worldAtmosphereHex("texto-muted", atmosphereId) }}
            >
              {atmosphere?.body ?? atmosphere?.sample}
            </p>
            <span
              className="mt-3 inline-flex rounded-lg px-2.5 py-1 font-canopy text-[11px] font-semibold"
              style={{
                backgroundColor: functionalRecipeHex(accion, "solidFill"),
                color: functionalRecipeHex(accion, "solidText"),
              }}
            >
              {atmosphere?.cta ?? "Acción"}
            </span>
            <SurfaceChart familyId={atmosphereId} />
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

function MiniLoseta({
  title,
  amount,
  open,
}: {
  title: string
  amount: string
  open?: boolean
}) {
  return (
    <article
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border px-2.5 py-2.5"
      style={{
        backgroundColor: "var(--color-elevada)",
        borderColor: "var(--color-borde)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-lg border"
          style={{
            borderColor: "var(--color-borde)",
            color: "var(--color-texto-muted)",
          }}
          aria-hidden
        >
          <Calculator className="size-3.5" strokeWidth={1.75} />
        </span>
        <p
          className="min-w-0 truncate font-canopy text-xs font-semibold"
          style={{ color: "var(--color-texto)" }}
        >
          {title}
        </p>
      </div>
      <p
        className="mt-3 font-numeric text-sm tabular-nums"
        style={{ color: "var(--color-texto)" }}
      >
        {amount}
      </p>
      <p
        className="mt-1.5 inline-flex w-fit rounded-md px-1.5 py-0.5 font-canopy text-[10px] font-semibold"
        style={
          open
            ? {
                backgroundColor: "var(--rootsy-savia-50)",
                color: "var(--rootsy-savia-800)",
              }
            : {
                backgroundColor: "var(--rootsy-bruma-100)",
                color: "var(--rootsy-bruma-700)",
              }
        }
      >
        {open ? "Abierta" : "Cerrada"}
      </p>
    </article>
  )
}

function LienzoSwatch({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  const lienzo = HANDBOOK_SURFACE_LIENZOS.find((item) => item.id === id)
  if (!lienzo) return null

  return (
    <article className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
      <div className="h-56 overflow-hidden">{children}</div>
      <div className="space-y-1 px-4 py-3">
        <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{lienzo.name}</p>
        <Token>{lienzo.product}</Token>
        <p className={cn("font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
          {lienzo.use}
        </p>
      </div>
    </article>
  )
}

export function HandbookSurfacesView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Superficies y profundidad</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        El fondo es el aire de la pantalla. Encima, superficie y elevada. Las capas dicen
        quién tapa a quién. El borde, el radio y la elevación tienen página propia.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_SURFACE_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="fondos" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Fondos</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Éter, Luz filtrada y Sombra son el lienzo. Se elige una atmósfera por
          contexto. Encima viven superficie y elevada. En Luz filtrada la elevada es
          blanco; en éter y Sombra sube un paso de la rampa.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_SURFACE_ATMOSPHERES.map((atmosphere) => (
            <FondoStack key={atmosphere.id} atmosphereId={atmosphere.id} />
          ))}
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-4")}>
          <Token>--color-fondo</Token> es el lienzo. <Token>--color-superficie</Token> el
          panel. <Token>--color-elevada</Token> la card. En Luz filtrada esa card es{" "}
          <Token>--rootsy-blanco</Token>.
        </p>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Una atmósfera por pantalla. Fondo, superficie y elevada del mismo aire. En Luz filtrada, el papel es blanco."
            dontText="No mezcles éter de fondo con Sombra de card. No uses savia-50 como papel de Luz filtrada."
          />
        </div>

        <h3 id="lienzo-plano" className={cn(libraryDocSubheadingClass, "mt-10 scroll-mt-24")}>
          Lienzo plano
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Bruma-100. Filtros en superficie, filas 50/100, pie sombra. Sin foto ni planeta.
        </p>

        <h3 id="lienzo-de-bloques" className={cn(libraryDocSubheadingClass, "mt-8 scroll-mt-24")}>
          Lienzo de bloques
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Bruma-50. El valle de las losetas — cajas, cuentas, personas, reportes. Cada
          loseta es blanca. Sin planeta ni rampa.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <LienzoSwatch id="lienzo-plano">
            <div className="data-workspace-tables-atmosphere workspace-layouts-tables flex h-full flex-col">
              <div className="data-workspace-tables-filters-dawn h-9 shrink-0" />
              <div className="min-h-0 flex-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className="h-8 border-b"
                    style={{
                      borderColor: "var(--wt-border)",
                      backgroundColor:
                        index % 2 === 0 ? "var(--wt-surface)" : "var(--wt-surface-stripe)",
                    }}
                  />
                ))}
              </div>
              <div
                className="h-7 shrink-0"
                style={{ backgroundColor: "var(--rootsy-sombra-600)" }}
              />
            </div>
          </LienzoSwatch>
          <LienzoSwatch id="lienzo-de-bloques">
            <div className="data-workspace-blocks-atmosphere grid h-full grid-cols-2 content-start items-start gap-2.5 p-3">
              <MiniLoseta title="Mostrador" amount="$ 48.320" open />
              <MiniLoseta title="Patio" amount="$ 0" />
            </div>
          </LienzoSwatch>
        </div>
        <div className={cn("mt-6", libraryDocTableShellOverflowClass)}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className={libraryDocTableHeaderClass}>
                <th className="px-3 py-2.5">Capa</th>
                <th className="px-3 py-2.5">Valor</th>
                <th className="px-3 py-2.5">Para qué</th>
              </tr>
            </thead>
            <tbody>
              {HANDBOOK_BLOCKS_ATMOSPHERE_LAYERS.map((row) => (
                <tr key={row.role} className={libraryDocTableRowClass}>
                  <td className={cn("px-3 py-2.5 text-sm", libraryDocPrimaryTextClass)}>
                    {row.role}
                  </td>
                  <td className="px-3 py-2.5">
                    <Token>{row.value}</Token>
                  </td>
                  <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Lienzo de bloques en losetas. Lienzo plano en tablas. Papel blanco en Luz filtrada."
            dontText="No pongas foto, planeta ni estrellas detrás del trabajo. No uses savia-50 como papel."
          />
        </div>
      </section>

      <section id="capas" className={handbookDocChapterClass}>
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
