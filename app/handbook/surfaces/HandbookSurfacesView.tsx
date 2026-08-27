import {
  atmosphereTokenHex,
  type HandbookAtmosphereId,
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
} from "@/app/library/libraryColorTheme"
import { LibraryDoDontPair } from "@/app/library/libraryDocPrimitives"
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphere.css"
import "@/components/data-workspace/dataWorkspaceBlocksAtmosphereBrumaOscura.css"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardStatusOpenClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
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

function MiniLoseta({
  eyebrow,
  title,
  amount,
  open,
}: {
  eyebrow: string
  title: string
  amount: string
  open?: boolean
}) {
  return (
    <article className={dataWorkspaceEntityCardLosetaSurfaceClass}>
      <div className={dataWorkspaceEntityCardHeaderClass}>
        <div className="flex items-start gap-3">
          <span className={dataWorkspaceEntityCardIsotypeClass} aria-hidden>
            <Calculator className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className={dataWorkspaceEntityCardEyebrowClass}>{eyebrow}</p>
            <p className={dataWorkspaceEntityCardTitleClass}>{title}</p>
          </div>
        </div>
      </div>
      <div className={dataWorkspaceEntityCardSaldoSectionClass}>
        <p className={dataWorkspaceEntityCardStatLabelClass}>Efectivo en caja</p>
        <p className={cn("mt-1.5", dataWorkspaceEntityCardStatValueLargeClass)}>{amount}</p>
        {open ? (
          <p className={cn("mt-2", dataWorkspaceEntityCardStatusOpenClass)}>Abierta</p>
        ) : null}
      </div>
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
      <div className="h-52 overflow-hidden">{children}</div>
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
          viven superficie y elevada. En Bruma clara la elevada es blanco; en éter y sombra
          sube un paso de la rampa.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {HANDBOOK_SURFACE_ATMOSPHERES.map((atmosphere) => (
            <FondoStack key={atmosphere.id} atmosphereId={atmosphere.id} />
          ))}
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-4")}>
          <Token>--color-fondo</Token> es el lienzo. <Token>--color-superficie</Token> el
          panel. <Token>--color-elevada</Token> la card. En Bruma clara esa card es{" "}
          <Token>--rootsy-blanco</Token>.
        </p>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Una atmósfera por pantalla. Fondo, superficie y elevada del mismo aire. En Bruma, el papel es blanco."
            dontText="No mezcles éter de fondo con sombra de card. No uses savia-50 como papel de Bruma."
          />
        </div>

        <h3 id="lienzo-plano" className={cn(libraryDocSubheadingClass, "mt-10 scroll-mt-24")}>
          Lienzo plano
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Bruma-100, sin planeta. Es el aire de las tablas: filtros, filas y pie.
        </p>

        <h3 id="lienzo-de-bloques" className={cn(libraryDocSubheadingClass, "mt-8 scroll-mt-24")}>
          Lienzo de bloques
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Bruma-50, neblina, un susurro de savia y el planeta atrás. Es el valle de las
          losetas — cajas, cuentas, personas, reportes. El papel de cada loseta es blanco.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <LienzoSwatch id="lienzo-plano">
            <div className="flex h-full flex-col bg-[var(--rootsy-bruma-100)]">
              <div className="h-10 border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]" />
              <div className="flex-1 space-y-px bg-[var(--rootsy-bruma-50)]">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-8 border-b border-[var(--rootsy-bruma-200)]",
                      index % 2 === 0 ? "bg-[var(--rootsy-bruma-50)]" : "bg-[var(--rootsy-bruma-100)]",
                    )}
                  />
                ))}
              </div>
            </div>
          </LienzoSwatch>
          <LienzoSwatch id="lienzo-de-bloques">
            <div className="data-workspace-blocks-atmosphere flex h-full flex-col px-3 py-3">
              <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
                <MiniLoseta eyebrow="Caja" title="Mostrador" amount="$ 48.320" open />
                <MiniLoseta eyebrow="Caja" title="Patio" amount="$ 0" />
              </div>
            </div>
          </LienzoSwatch>
          <LienzoSwatch id="lienzo-de-bloques-noche">
            <div className="data-workspace-blocks-atmosphere-bruma-oscura h-full" />
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
            doText="Lienzo de bloques en módulos de losetas. Lienzo plano en listados tabla."
            dontText="No pongas el planeta detrás de una tabla. No pintes el valle con savia sólida."
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
