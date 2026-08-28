"use client"

import {
  HANDBOOK_EDITORIAL_RULES,
  HANDBOOK_HIERARCHY_LAYERS,
  HANDBOOK_HIERARCHY_RULES,
  HANDBOOK_TEXT_STYLES,
  HANDBOOK_TYPE_A11Y,
  HANDBOOK_TYPE_PRINCIPLES,
  HANDBOOK_TYPE_ROLES,
  HANDBOOK_TYPE_SCALE,
  HANDBOOK_TYPE_SCALE_STEPS,
  HANDBOOK_TYPE_VOICES,
  HANDBOOK_TYPE_WEIGHTS,
} from "@/app/handbook/typography/handbookTypographySpec"
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
import { ROOTSY_TEXT_STYLES } from "@/lib/design-system/tokens/typography"
import { cn } from "@/lib/utils"

const FACE_CLASS = {
  ui: "font-canopy",
  reading: "font-stream",
  numeric: "font-numeric",
} as const

function Token({ children }: { children: string }) {
  return (
    <code className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
      {children}
    </code>
  )
}

function FamilyCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {HANDBOOK_TYPE_VOICES.map((voice) => (
        <article
          key={voice.id}
          className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}
        >
          <div className={cn("px-4 py-5", libraryDocSurfaceMutedClass)}>
            <p
              className={cn(
                FACE_CLASS[voice.id],
                voice.id === "reading"
                  ? "text-base font-normal leading-relaxed"
                  : "text-2xl font-bold tracking-tight",
                voice.id === "numeric" && "tabular-nums",
                libraryDocPrimaryTextClass,
              )}
            >
              {voice.sample}
            </p>
          </div>
          <div className="space-y-2 px-4 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>
                {voice.label}
                <span className={cn("ml-2 font-normal", libraryDocMutedTextClass)}>
                  {voice.family}
                </span>
              </p>
              <Token>{voice.cssVar}</Token>
            </div>
            <p className={cn("font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {voice.role}
            </p>
            <p className={cn("font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
              {voice.description}
            </p>
            <p className={cn("text-[0.75rem] font-medium", libraryDocMutedTextClass)}>
              {voice.weights.join(" · ")}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

function EverydayScale() {
  return (
    <div className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
      {HANDBOOK_TYPE_ROLES.map((role, index) => {
        const style = ROOTSY_TEXT_STYLES[role.style]
        const face = FACE_CLASS[style.family]
        return (
          <div
            key={role.id}
            className={cn(
              "flex flex-wrap items-baseline justify-between gap-3 px-4 py-4",
              index < HANDBOOK_TYPE_ROLES.length - 1 && "border-b",
              libraryDocBorderClass,
            )}
          >
            <p
              className={cn(face, libraryDocPrimaryTextClass)}
              style={{
                fontSize: style.fontSize,
                lineHeight: style.lineHeight,
                fontWeight: style.weight,
                letterSpacing:
                  role.id === "page-title" || role.id === "section-title" || role.id === "metric"
                    ? "var(--rootsy-text-heading-tracking)"
                    : undefined,
              }}
            >
              {role.sample}
            </p>
            <div className="text-right">
              <p className={libraryDocMetaLabelClass}>{role.label}</p>
              <p className={cn("mt-1 text-[0.75rem] font-medium", libraryDocMutedTextClass)}>
                {role.style} · {style.sizePx}px · {role.html}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScaleTable() {
  return (
    <div className={libraryDocTableShellOverflowClass}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Estilo</th>
            <th className="px-3 py-2.5">Tamaño</th>
            <th className="px-3 py-2.5">Interlineado</th>
            <th className="px-3 py-2.5">Uso</th>
          </tr>
        </thead>
        <tbody>
          {HANDBOOK_TEXT_STYLES.map((style) => (
            <tr key={style.id} className={libraryDocTableRowClass}>
              <td className="px-3 py-2.5">
                <p
                  className={cn(FACE_CLASS[style.family], "font-semibold", libraryDocPrimaryTextClass)}
                  style={{ fontWeight: style.weight }}
                >
                  {style.id}
                </p>
                <p className={cn("mt-0.5 text-[0.75rem] font-medium", libraryDocMutedTextClass)}>
                  {style.token}
                </p>
              </td>
              <td className={cn("px-3 py-2.5 font-numeric text-sm tabular-nums", libraryDocPrimaryTextClass)}>
                {style.sizePx}px
                <span className={cn("ml-2 text-[0.75rem] font-medium", libraryDocMutedTextClass)}>
                  · {style.fontSize}
                </span>
              </td>
              <td className={cn("px-3 py-2.5 font-numeric text-sm tabular-nums", libraryDocMutedTextClass)}>
                {style.lineHeightPx}px
              </td>
              <td className={cn("px-3 py-2.5 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {style.usage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HierarchyPreview() {
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
        <p className="rootsy-text-meta mt-1 text-[var(--color-texto-muted)]">Mostrador · hoy</p>
      </div>
      <div className="space-y-4 px-5 py-5">
        <label className="block">
          <span className="rootsy-text-meta font-medium text-[var(--color-texto)]">Producto</span>
          <span
            className="mt-1.5 block rounded-lg border px-3 py-2 rootsy-text-body text-[var(--color-texto)]"
            style={{ borderColor: "var(--color-borde)", background: "var(--color-superficie)" }}
          >
            Medialuna clásica
          </span>
        </label>
        <div className="flex items-end justify-between gap-4">
          <p className="rootsy-text-meta text-[var(--color-texto-muted)]">Total</p>
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

function HierarchyLayers() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {HANDBOOK_HIERARCHY_LAYERS.map((layer) => {
        const style = ROOTSY_TEXT_STYLES[layer.token]
        return (
          <div
            key={layer.id}
            className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}
          >
            <p className={libraryDocMetaLabelClass}>{layer.label}</p>
            <p
              className={cn(FACE_CLASS[style.family], "mt-2", libraryDocPrimaryTextClass)}
              style={{
                fontSize: style.fontSize,
                lineHeight: style.lineHeight,
                fontWeight: style.weight,
              }}
            >
              {layer.sample}
            </p>
            <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
              {layer.note}
            </p>
            <p className={cn("mt-2 text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
              {layer.token}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function WeightsRow() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {HANDBOOK_TYPE_WEIGHTS.map((weight) => (
        <div
          key={weight.id}
          className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}
        >
          <p
            className="font-canopy text-2xl tracking-tight text-[var(--color-texto)]"
            style={{ fontWeight: weight.value }}
          >
            Rootsy
          </p>
          <p className={cn("mt-3 font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
            {weight.label} · {weight.value}
          </p>
          <p className={cn("mt-1 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
            {weight.usage}
          </p>
          <p className={cn("mt-2 text-[0.75rem] font-medium", libraryDocMutedTextClass)}>
            {weight.cssVar}
          </p>
        </div>
      ))}
    </div>
  )
}

function EditorialSpecimen() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className={cn("rounded-2xl border px-5 py-5", libraryDocBorderClass)}>
        <p className={libraryDocMetaLabelClass}>Hacer</p>
        <h3 className="rootsy-text-section-title mt-3 text-[var(--color-texto)]">
          Cómo se mueve la caja
        </h3>
        <p className="rootsy-text-reading mt-3 text-[var(--color-texto)]">
          La caja cuenta lo que ya pasó. El turno, el medio de pago y el cierre se leen de
          corrido, con aire entre párrafos. El título sigue en Inter; el cuerpo, en Nunito Sans.
        </p>
        <p className="rootsy-text-reading mt-3 text-[var(--color-texto-muted)]">
          Si el dato importa —el total del día— entra Inter, abajo, sin mezclarse con la prosa.
        </p>
        <p className="rootsy-text-metric mt-4 text-[var(--color-texto)]">$ 128.450</p>
        <p className="rootsy-text-meta mt-1 text-[var(--color-texto-muted)]">Total del turno</p>
      </article>
      <article
        className={cn("rounded-2xl border px-5 py-5", libraryDocBorderClass)}
        aria-hidden
      >
        <p className={libraryDocMetaLabelClass}>Evitar</p>
        <p className="mt-3 font-canopy text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-texto)]">
          CÓMO SE MUEVE LA CAJA
        </p>
        <p className="mt-3 font-canopy text-xs leading-tight text-[var(--color-texto-muted)]">
          La caja cuenta lo que ya pasó. El turno, el medio de pago y el cierre se apilan en 12px,
          en mayúsculas, con el total adentro del párrafo: $ 128.450, sin tabular-nums ni
          jerarquía. Cuesta leerlo y el número no se puede comparar.
        </p>
      </article>
    </div>
  )
}

export function HandbookTypographyView() {
  return (
    <article className="max-w-5xl">
      <h1 className={libraryDocPageTitleClass}>Tipografía</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        La tipografía de Rootsy se lee sin esfuerzo. Hay dos familias: Inter en chrome y
        números, Nunito Sans en la prosa. Los tamaños salen de una escala: no se inventan. El
        texto guía; no compite con la interfaz.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_TYPE_PRINCIPLES.map((item) => (
          <div
            key={item.title}
            className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}
          >
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section
        id="familias-tipograficas"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Familias tipográficas</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Inter cubre la interfaz y los montos. Nunito Sans entra cuando hay que leer de corrido.
        </p>
        <div className="mt-6">
          <FamilyCards />
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Inter en chrome, Nunito Sans en artículos, Inter tabular en montos."
            dontText="No uses Nunito en un botón ni Inter adentro de un artículo."
          />
        </div>
      </section>

      <section
        id="escalas"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Escalas</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Base {HANDBOOK_TYPE_SCALE.basePx}px, ratio {HANDBOOK_TYPE_SCALE.ratio}. {HANDBOOK_TYPE_SCALE.rule}{" "}
          {HANDBOOK_TYPE_SCALE.units}
        </p>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Los roles del día cubren casi todas las pantallas. Título de producto
          es heading-xsmall; el precio, metric-small. El resto de la escala existe
          para marketing y tiles — no para inventar un tamaño de body.
        </p>
        <div className="mt-6">
          <EverydayScale />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Pasos de la escala</h3>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          Cada px de la escala tiene dueño. Si el tamaño no está acá, no entra.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {HANDBOOK_TYPE_SCALE_STEPS.map((step) => (
            <span
              key={step.sizePx}
              className={cn(
                "rounded-full border px-3 py-1 font-canopy text-xs",
                libraryDocBorderClass,
                libraryDocPrimaryTextClass,
              )}
            >
              <span className="font-numeric font-semibold tabular-nums">{step.sizePx}px</span>
              <span className={cn("ml-2", libraryDocMutedTextClass)}>{step.tokens}</span>
            </span>
          ))}
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Tokens</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Headings en bold 700. Body en regular 400. Métricas en Inter 700. El interlineado de
          heading es corto; el de lectura es 1.5.
        </p>
        <div className="mt-4">
          <ScaleTable />
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Elegí un token de la escala. Título de card: heading-xsmall. Precio: metric-small. Meta: meta. 12px solo en metadata."
            dontText="No pongas un text-[13px], un text-[10px] ni un text-[11px] suelto. 12px no es cuerpo."
          />
        </div>
      </section>

      <section
        id="jerarquias"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Jerarquías</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          La jerarquía visual y la semántica van juntas. El h1 es el título de página. El monto
          puede ser el elemento más grande y seguir siendo un dato, no un heading.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <HierarchyPreview />
          <HierarchyLayers />
        </div>
        <ul className={cn(libraryDocBodyClass, "mt-6 list-disc space-y-1.5 pl-5")}>
          {HANDBOOK_HIERARCHY_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Un título principal por pantalla. Título → contexto → cuerpo → dato."
            dontText="No pongas dos h1, ni varios títulos del mismo peso compitiendo, ni un bold suelto en lugar de un heading."
          />
        </div>
      </section>

      <section
        id="pesos"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Pesos</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Cuatro pesos, y 700 es el techo. ExtraBold y Black no forman parte de Rootsy: si
          aparecen, se resuelven a Bold. Cargar 800 y 900 no aporta jerarquía; solo peso de archivo.
        </p>
        <div className="mt-6">
          <WeightsRow />
        </div>
        <p className={cn(libraryDocBodyClass, "mt-6")}>
          Medium (500) existe para convivir con íconos de trazo. Regular al lado de un ícono line
          se ve más fino que el glifo. Semibold es énfasis puntual, no un heading disfrazado.
        </p>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Regular en body, medium junto a íconos, semibold en labels y botones, bold en títulos y métricas."
            dontText="No uses font-extrabold, font-black ni un peso sintético. 700 ya es el máximo."
          />
        </div>
      </section>

      <section
        id="uso-editorial"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Uso editorial</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Cuando hay que leer de corrido, cambia la familia y el ritmo. La interfaz sigue en
          Inter a 14px. La prosa entra en Nunito Sans a 16px, con interlineado 1.5 y un renglón
          de unas 65 caracteres.
        </p>
        <div className="mt-6">
          <EditorialSpecimen />
        </div>
        <ul className={cn(libraryDocBodyClass, "mt-6 list-disc space-y-1.5 pl-5")}>
          {HANDBOOK_EDITORIAL_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Accesibilidad</h3>
        <ul className={cn(libraryDocBodyClass, "mt-4 list-disc space-y-1.5 pl-5")}>
          {HANDBOOK_TYPE_A11Y.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Nunito Sans a 16px para el artículo, Inter a 14px para el chrome, Inter tabular para el total. 65ch de medida."
            dontText="No escribas un artículo en 12px, ni en mayúsculas sostenidas, ni metas Inter adentro del párrafo."
          />
        </div>
      </section>
    </article>
  )
}
