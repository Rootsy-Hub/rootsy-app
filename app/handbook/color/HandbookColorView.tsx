import type { HandbookColorFamily } from "@/app/handbook/color/handbookColorPalettes"
import {
  HANDBOOK_ATMOSPHERES,
  HANDBOOK_BLANCO,
  HANDBOOK_FUNCTIONAL_COLORS,
  handbookColorHex,
} from "@/app/handbook/color/handbookColorPalettes"
import {
  applicationAtmosphereHex,
  atmosphereTokenHex,
  functionalTokenHex,
  HANDBOOK_APPLICATION_ATMOSPHERES,
  HANDBOOK_ATMOSPHERE_CONTEXTS,
  HANDBOOK_ATMOSPHERE_TOKENS,
  HANDBOOK_WORLD_ATMOSPHERES,
  worldAtmosphereHex,
  HANDBOOK_CONTRAST_FAIL,
  HANDBOOK_CONTRAST_PASS,
  HANDBOOK_CONTRAST_RULES,
  HANDBOOK_FUNCTIONAL_APPLICATION_RULES,
  HANDBOOK_FUNCTIONAL_RECIPES,
  functionalInkHex,
  functionalRecipeHex,
  HANDBOOK_FUNCTIONAL_TOKENS,
  HANDBOOK_STATUS_TINT_RULE,
  type HandbookAtmosphereId,
  type HandbookContrastLevel,
  type HandbookContrastPair,
} from "@/app/handbook/color/handbookColorSpec"
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
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Info,
  Leaf,
  X,
} from "lucide-react"

function identityHex(family: HandbookColorFamily) {
  return family.steps.find((step) => step.identity)?.hex ?? family.steps[5]?.hex
}

function FamilyOverviewStrip({ families }: { families: HandbookColorFamily[] }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        families.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3",
      )}
    >
      {families.map((family) => (
        <a
          key={family.id}
          href={`#${family.id === "bruma" ? "luz-filtrada" : family.id}`}
          className={cn(
            "overflow-hidden rounded-2xl border no-underline transition-opacity hover:opacity-90",
            libraryDocBorderClass,
          )}
        >
          <div className="flex h-12">
            {family.steps.map((step) => (
              <div
                key={step.step}
                className="min-w-0 flex-1"
                style={{ backgroundColor: step.hex }}
              />
            ))}
          </div>
          <div className={cn("flex items-center gap-3 px-3 py-3", libraryDocSurfaceMutedClass)}>
            <span
              className="size-7 shrink-0 rounded-full border"
              style={{
                backgroundColor: identityHex(family),
                borderColor: "var(--color-borde)",
              }}
            />
            <div className="min-w-0">
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{family.name}</p>
              <p className={libraryDocPageDescriptionClass}>{family.tagline}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

function FamilyRamp({ family }: { family: HandbookColorFamily }) {
  return (
    <section
      id={family.id === "bruma" ? "luz-filtrada" : family.id}
      className="mt-8 scroll-mt-24 space-y-4"
    >
      <div className="max-w-3xl space-y-2">
        <h3 className={cn(libraryDocSectionTitleClass, "text-sm")}>{family.name}</h3>
        <p className={cn(libraryDocMetaLabelClass, "normal-case tracking-normal")}>
          {family.tagline}
        </p>
        <p className={libraryDocBodyClass}>{family.description}</p>
        <p className={libraryDocPageDescriptionClass}>{family.not}</p>
      </div>

      <div className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
        <div className="flex h-16 sm:h-20">
          {family.steps.map((step) => (
            <div
              key={step.step}
              className="min-w-0 flex-1"
              style={{ backgroundColor: step.hex }}
              title={`${family.name} ${step.step}`}
            />
          ))}
        </div>
      </div>

      <div className={libraryDocTableShellOverflowClass}>
        <table className="w-full text-left">
          <thead>
            <tr className={libraryDocTableHeaderClass}>
              <th className="px-3 py-2.5">Paso</th>
              <th className="px-3 py-2.5">Hex</th>
              <th className="px-3 py-2.5">Uso</th>
            </tr>
          </thead>
          <tbody>
            {family.steps.map((step) => (
              <tr key={step.step} className={libraryDocTableRowClass}>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-5 shrink-0 rounded-md border"
                      style={{
                        backgroundColor: step.hex,
                        borderColor: "var(--color-borde)",
                      }}
                    />
                    <span className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                      {step.step}
                    </span>
                    {step.identity ? (
                      <span
                        className={cn(
                          "font-canopy text-[10px] font-semibold uppercase tracking-[0.12em]",
                          libraryDocTokenAccentClass,
                        )}
                      >
                        Identidad
                      </span>
                    ) : null}
                  </span>
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 font-numeric text-xs tabular-nums",
                    libraryDocMutedTextClass,
                  )}
                >
                  {step.hex.toUpperCase()}
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 font-canopy text-xs leading-relaxed",
                    libraryDocMutedTextClass,
                  )}
                >
                  {step.usage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function BlancoCallout() {
  return (
    <section id="blanco" className="mt-8 scroll-mt-24 space-y-3">
      <div className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
        <div className="flex items-center gap-4 px-4 py-4">
          <span
            className="size-10 shrink-0 rounded-lg border"
            style={{
              backgroundColor: HANDBOOK_BLANCO.hex,
              borderColor: "var(--color-borde)",
            }}
          />
          <div className="min-w-0">
            <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
              Blanco
            </p>
            <p className={cn("font-numeric text-[11px] tabular-nums", libraryDocMutedTextClass)}>
              {HANDBOOK_BLANCO.token} · {HANDBOOK_BLANCO.hex}
            </p>
            <p className={cn("mt-1 font-canopy text-xs leading-relaxed", libraryDocMutedTextClass)}>
              {HANDBOOK_BLANCO.usage}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Swatch({ hex, className }: { hex: string; className?: string }) {
  return (
    <span
      className={cn("inline-block size-5 shrink-0 rounded-md border", className)}
      style={{ backgroundColor: hex, borderColor: "var(--color-borde)" }}
    />
  )
}

function FunctionalChip({
  children,
  fill,
  text,
  border,
}: {
  children: string
  fill: string
  text: string
  border?: string
}) {
  return (
    <span
      className="inline-flex rounded-lg px-2.5 py-1 font-canopy text-[11px] font-semibold"
      style={{
        backgroundColor: fill,
        color: text,
        boxShadow: border ? `inset 0 0 0 1px ${border}` : undefined,
      }}
    >
      {children}
    </span>
  )
}

function FunctionalApplicationPreview() {
  const sotobosque = HANDBOOK_APPLICATION_ATMOSPHERES.filter((item) => item.id === "sombra" || item.id === "bruma")
    .sort((a, b) => (a.id === "sombra" ? -1 : b.id === "sombra" ? 1 : 0))
  const accion = HANDBOOK_FUNCTIONAL_RECIPES.find((recipe) => recipe.id === "accion")!
  const accents = [
    { id: "informacion", label: "Información", familyId: "cielo-de-dia", Icon: Info },
    { id: "atencion", label: "Atención", familyId: "sol", Icon: AlertTriangle },
    { id: "critico", label: "Crítico", familyId: "lava", Icon: AlertOctagon },
  ] as const

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {sotobosque.map((atmosphere) => {
        const ink = functionalInkHex("savia", atmosphere.dark)
        const disabledFill = atmosphere.dark
          ? handbookColorHex("sombra", "800")
          : handbookColorHex("bruma", "200")
        const disabledText = atmosphere.dark
          ? handbookColorHex("sombra", "400")
          : handbookColorHex("bruma", "500")
        const chipFill = atmosphere.dark
          ? handbookColorHex("sombra", "800")
          : functionalRecipeHex(accion, "tintFill")
        const chipInk = atmosphere.dark ? ink : functionalRecipeHex(accion, "tintText")
        const chipBorder = atmosphere.dark ? ink : functionalRecipeHex(accion, "tintBorder")

        return (
          <div
            key={atmosphere.id}
            className="space-y-5 overflow-hidden rounded-2xl p-5"
            style={{
              backgroundColor: applicationAtmosphereHex("fondo", atmosphere.id),
              boxShadow: `inset 0 0 0 1px ${applicationAtmosphereHex("borde", atmosphere.id)}`,
            }}
          >
            <p
              className="font-canopy text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
            >
              {atmosphere.name}
            </p>

            <div>
              <p
                className="mb-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
              >
                Primario
              </p>
              <span
                className="inline-flex rounded-full px-5 py-2 font-canopy text-sm font-semibold"
                style={{
                  backgroundColor: functionalRecipeHex(accion, "solidFill"),
                  color: functionalRecipeHex(accion, "solidText"),
                }}
              >
                Acción
              </span>
            </div>

            <div>
              <p
                className="mb-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
              >
                Secundario
              </p>
              <span
                className="inline-flex rounded-full px-5 py-2 font-canopy text-sm font-semibold"
                style={{
                  color: ink,
                  boxShadow: `inset 0 0 0 1.5px ${ink}`,
                }}
              >
                Secundario
              </span>
            </div>

            <div>
              <p
                className="mb-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
              >
                Enlace
              </p>
              <span
                className="inline-flex items-center gap-1 font-canopy text-sm font-semibold"
                style={{ color: ink }}
              >
                Ver detalle
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </span>
            </div>

            <div>
              <p
                className="mb-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
              >
                Chip seleccionado
              </p>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-canopy text-[11px] font-semibold"
                style={{
                  backgroundColor: chipFill,
                  color: chipInk,
                  boxShadow: `inset 0 0 0 1px ${chipBorder}`,
                }}
              >
                <span
                  className="flex size-4 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: ink,
                    color: atmosphere.dark
                      ? functionalRecipeHex(accion, "solidText")
                      : HANDBOOK_BLANCO,
                  }}
                >
                  <Check className="size-2.5" strokeWidth={2.5} />
                </span>
                Seleccionado
                <X className="size-3 opacity-70" strokeWidth={2} />
              </span>
            </div>

            <div>
              <p
                className="mb-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
              >
                Desactivado
              </p>
              <span
                className="inline-flex rounded-full px-5 py-2 font-canopy text-sm font-semibold"
                style={{ backgroundColor: disabledFill, color: disabledText }}
              >
                Desactivado
              </span>
            </div>

            <div>
              <p
                className="mb-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
              >
                Acentos funcionales
              </p>
              <div className="flex flex-wrap gap-2">
                {accents.map((accent) => {
                  const accentInk = functionalInkHex(accent.familyId, atmosphere.dark)
                  return (
                    <span
                      key={accent.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-canopy text-[11px] font-semibold"
                      style={{
                        color: accentInk,
                        boxShadow: `inset 0 0 0 1px ${accentInk}`,
                      }}
                    >
                      <accent.Icon className="size-3" strokeWidth={2} />
                      {accent.label}
                    </span>
                  )
                })}
              </div>
            </div>

            <div>
              <p
                className="mb-2 font-canopy text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
              >
                Superficie / tarjeta
              </p>
              <div
                className="flex items-center gap-3 rounded-2xl px-3 py-3"
                style={{
                  backgroundColor: atmosphere.dark
                    ? handbookColorHex("sombra", "900")
                    : applicationAtmosphereHex("elevada", atmosphere.id),
                  boxShadow: `inset 0 0 0 1px ${
                    atmosphere.dark
                      ? handbookColorHex("sombra", "800")
                      : applicationAtmosphereHex("borde", atmosphere.id)
                  }`,
                }}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: atmosphere.dark
                      ? handbookColorHex("sombra", "950")
                      : functionalRecipeHex(accion, "tintFill"),
                    color: ink,
                    boxShadow: `inset 0 0 0 1.5px ${ink}`,
                  }}
                >
                  <Leaf className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-canopy text-sm font-semibold"
                    style={{ color: applicationAtmosphereHex("texto", atmosphere.id) }}
                  >
                    Título de la tarjeta
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 font-canopy text-[10px] font-semibold"
                      style={{
                        backgroundColor: atmosphere.dark
                          ? handbookColorHex("sombra", "950")
                          : functionalRecipeHex(accion, "tintFill"),
                        color: chipInk,
                      }}
                    >
                      Etiqueta
                    </span>
                    <span
                      className="font-stream text-[11px]"
                      style={{ color: applicationAtmosphereHex("texto-muted", atmosphere.id) }}
                    >
                      · Dato secundario
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="size-4 shrink-0"
                  strokeWidth={1.75}
                  style={{ color: applicationAtmosphereHex("texto", atmosphere.id) }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FunctionalRecipeLegend() {
  const accion = HANDBOOK_FUNCTIONAL_RECIPES.find((recipe) => recipe.id === "accion")!
  const informacion = HANDBOOK_FUNCTIONAL_RECIPES.find((recipe) => recipe.id === "informacion")!

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className={cn("rounded-xl border p-3", libraryDocBorderClass, libraryDocSurfaceMutedClass)}>
        <p className={cn(libraryDocMetaLabelClass, "normal-case tracking-normal")}>Vivo</p>
        <div className="mt-2">
          <FunctionalChip
            fill={functionalRecipeHex(accion, "solidFill")}
            text={functionalRecipeHex(accion, "solidText")}
          >
            Acción
          </FunctionalChip>
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-2")}>
          500 + 950 de la misma familia. El mismo relleno en las dos luces.
        </p>
      </div>
      <div className={cn("rounded-xl border p-3", libraryDocBorderClass, libraryDocSurfaceMutedClass)}>
        <p className={cn(libraryDocMetaLabelClass, "normal-case tracking-normal")}>Profundo</p>
        <div className="mt-2">
          <span
            className="inline-flex rounded-full px-3 py-1 font-canopy text-[11px] font-semibold"
            style={{
              color: functionalRecipeHex(accion, "tintText"),
              boxShadow: `inset 0 0 0 1px ${functionalRecipeHex(accion, "tintText")}`,
            }}
          >
            Secundario
          </span>
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-2")}>
          700. Texto, links y contorno sobre Luz filtrada.
        </p>
      </div>
      <div
        className="rounded-xl p-3"
        style={{ backgroundColor: applicationAtmosphereHex("fondo", "sombra") }}
      >
        <p
          className={cn(libraryDocMetaLabelClass, "normal-case tracking-normal")}
          style={{ color: applicationAtmosphereHex("texto-muted", "sombra") }}
        >
          Sobre Sombra
        </p>
        <p
          className="mt-2 font-canopy text-[11px] font-semibold"
          style={{ color: functionalInkHex(informacion.familyId, true) }}
        >
          Cielo vivo
        </p>
        <p
          className="mt-2 font-canopy text-xs leading-relaxed"
          style={{ color: applicationAtmosphereHex("texto-muted", "sombra") }}
        >
          En el dosel el ink es el vivo, no el profundo.
        </p>
      </div>
    </div>
  )
}

function AtmosphereChart({ familyId }: { familyId: HandbookAtmosphereId }) {
  const quietSteps = familyId === "bruma" ? (["200", "300", "200"] as const) : (["800", "700", "600"] as const)
  const heights = ["42%", "60%", "76%"] as const

  return (
    <div className="mt-6 flex h-18 items-end gap-1.5" aria-hidden>
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

function AtmosphereContextPreview() {
  const accion = HANDBOOK_FUNCTIONAL_RECIPES.find((recipe) => recipe.id === "accion")!

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {HANDBOOK_WORLD_ATMOSPHERES.map((context) => (
        <div
          key={context.id}
          className="flex min-h-72 flex-col rounded-2xl p-5"
          style={{
            backgroundColor: worldAtmosphereHex("fondo", context.id),
            boxShadow: `inset 0 0 0 1px ${worldAtmosphereHex("borde", context.id)}`,
          }}
        >
          <p
            className="font-canopy text-base font-semibold"
            style={{ color: worldAtmosphereHex("texto", context.id) }}
          >
            {context.name}
          </p>
          <p
            className="mt-2 font-stream text-sm leading-relaxed"
            style={{ color: worldAtmosphereHex("texto-muted", context.id) }}
          >
            {context.body}
          </p>
          <span
            className="mt-5 inline-flex w-fit rounded-lg px-3 py-1.5 font-canopy text-xs font-semibold"
            style={{
              backgroundColor: functionalRecipeHex(accion, "solidFill"),
              color: functionalRecipeHex(accion, "solidText"),
            }}
          >
            {context.cta}
          </span>
          <div className="mt-auto">
            <AtmosphereChart familyId={context.id} />
          </div>
        </div>
      ))}
    </div>
  )
}

function AtmosphereTokensTable() {
  return (
    <div className={cn(libraryDocTableShellOverflowClass, "overflow-x-auto")}>
      <table className="w-full min-w-[40rem] text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Token</th>
            {HANDBOOK_ATMOSPHERE_CONTEXTS.map((context) => (
              <th key={context.id} className="px-3 py-2.5">
                {context.name}
              </th>
            ))}
            <th className="px-3 py-2.5">Uso</th>
          </tr>
        </thead>
        <tbody>
          {HANDBOOK_ATMOSPHERE_TOKENS.map((token) => (
            <tr key={token.id} className={libraryDocTableRowClass}>
              <td className="px-3 py-2.5">
                <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                  {token.label}
                </p>
                <p className={cn("font-numeric text-[11px]", libraryDocMutedTextClass)}>
                  {token.token}
                </p>
              </td>
              {HANDBOOK_ATMOSPHERE_CONTEXTS.map((context) => {
                const hex = atmosphereTokenHex(token, context.id)
                return (
                  <td key={context.id} className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <Swatch hex={hex} />
                      <span className={cn("font-canopy text-xs", libraryDocMutedTextClass)}>
                        {token.steps[context.id]}
                      </span>
                    </span>
                  </td>
                )
              })}
              <td className={cn("px-3 py-2.5 font-canopy text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {token.purpose}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FunctionalTokensTable() {
  return (
    <div className={libraryDocTableShellOverflowClass}>
      <table className="w-full text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Token</th>
            <th className="px-3 py-2.5">Paleta</th>
            <th className="px-3 py-2.5">Hex</th>
            <th className="px-3 py-2.5">Uso</th>
          </tr>
        </thead>
        <tbody>
          {HANDBOOK_FUNCTIONAL_TOKENS.map((token) => {
            const hex = functionalTokenHex(token)
            return (
              <tr key={token.id} className={libraryDocTableRowClass}>
                <td className="px-3 py-2.5">
                  <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                    {token.label}
                  </p>
                  <p className={cn("font-numeric text-[11px]", libraryDocMutedTextClass)}>
                    {token.token}
                  </p>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <Swatch hex={hex} />
                    <span className={cn("font-canopy text-xs", libraryDocMutedTextClass)}>
                      {token.familyName} · {token.step}
                    </span>
                  </span>
                </td>
                <td className={cn("px-3 py-2.5 font-numeric text-xs tabular-nums", libraryDocMutedTextClass)}>
                  {hex.toUpperCase()}
                </td>
                <td className={cn("px-3 py-2.5 font-canopy text-xs leading-relaxed", libraryDocMutedTextClass)}>
                  {token.purpose}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const CONTRAST_LEVEL_CLASS: Record<HandbookContrastLevel, string> = {
  AAA: "bg-rootsy-savia-50 text-rootsy-savia-800",
  AA: "bg-rootsy-bruma-50 text-rootsy-bruma-700",
  "AA grande": "bg-rootsy-sol-50 text-rootsy-sol-900",
  No: "bg-rootsy-lava-50 text-rootsy-lava-800",
}

function ContrastPairsTable({ pairs }: { pairs: HandbookContrastPair[] }) {
  return (
    <div className={libraryDocTableShellOverflowClass}>
      <table className="w-full text-left">
        <thead>
          <tr className={libraryDocTableHeaderClass}>
            <th className="px-3 py-2.5">Par</th>
            <th className="px-3 py-2.5">Contexto</th>
            <th className="px-3 py-2.5">Ratio</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => {
            const foreground = handbookColorHex(pair.foreground.familyId, pair.foreground.step)
            const background = handbookColorHex(pair.background.familyId, pair.background.step)
            return (
              <tr key={pair.id} className={libraryDocTableRowClass}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-16 items-center justify-center rounded-md border font-canopy text-[10px] font-bold"
                      style={{
                        backgroundColor: background,
                        color: foreground,
                        borderColor: "var(--color-borde)",
                      }}
                    >
                      Aa
                    </span>
                    <div>
                      <p className={cn("font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                        {pair.label}
                      </p>
                      <p className={cn("font-numeric text-[11px] tabular-nums", libraryDocMutedTextClass)}>
                        {foreground.toUpperCase()} · {background.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={cn("px-3 py-2.5 font-canopy text-xs leading-relaxed", libraryDocMutedTextClass)}>
                  {pair.context}
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex flex-col items-start gap-1">
                    <span className={cn("font-numeric text-sm tabular-nums", libraryDocPrimaryTextClass)}>
                      {pair.ratio}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-canopy text-[10px] font-semibold uppercase tracking-[0.08em]",
                        CONTRAST_LEVEL_CLASS[pair.level],
                      )}
                    >
                      {pair.level}
                    </span>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function HandbookColorView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Color</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        El color de Rootsy se organiza en dos capas. Las atmósferas definen el contexto visual de
        la pantalla. Los colores funcionales dicen qué está ocurriendo: acción, información,
        atención o peligro.
      </p>
      <p className={cn(libraryDocBodyClass, "mt-3", handbookDocIntroAfterClass)}>
        Esta paleta es la que usa la aplicación. Cada familia tiene once pasos,
        de 50 a 950. El paso marcado es la identidad de la familia. Luz filtrada suma un
        blanco fuera de rampa: la luz del papel. Si un color en la aplicación no está
        acá, no entra.
      </p>

      <section
        id="atmosferas-del-mundo"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Atmósferas del mundo</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Éter es el cielo. Sotobosque es un solo lugar con dos luces: Sombra para
          operar y Luz filtrada para leer. Se elige una atmósfera por contexto; no se
          mezclan como si fueran acentos.
        </p>
        <div className="mt-6">
          <AtmosphereContextPreview />
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          El aire pinta el lienzo. El rayo de acción es el mismo en cada luz: Savia 500
          con Raíz 950. Cambia el bosque, no el verbo.
        </p>
        <div className="mt-6">
          <FamilyOverviewStrip families={HANDBOOK_ATMOSPHERES} />
        </div>
        {HANDBOOK_ATMOSPHERES.map((family) => (
          <div key={family.id}>
            <FamilyRamp family={family} />
            {family.id === "bruma" ? <BlancoCallout /> : null}
          </div>
        ))}
      </section>

      <section
        id="colores-funcionales"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Colores funcionales</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Savia, cielo, sol y lava comunican qué está pasando y cuál es el próximo
          movimiento. No pintan el mundo: marcan acción, estado y prioridad.
        </p>
        <div className="mt-6">
          <FamilyOverviewStrip families={HANDBOOK_FUNCTIONAL_COLORS} />
        </div>
        {HANDBOOK_FUNCTIONAL_COLORS.map((family) => (
          <FamilyRamp key={family.id} family={family} />
        ))}
      </section>

      <section
        id="tokens-de-color"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Tokens de color</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Los tokens nombran propósito. El hex sale de la paleta, salvo el papel de Luz
          filtrada: --rootsy-blanco. Un token, un trabajo: no se escribe un color suelto
          ni se reutiliza un paso porque “queda parecido”.
        </p>

        <div className="mt-6">
          <AtmosphereContextPreview />
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          El rayo de acción es el mismo en cada atmósfera. Cambia el aire, no el verbo.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>
          Tokens de atmósfera
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Resuelven según el contexto de la pantalla. Éter, Luz filtrada o Sombra
          eligen el aire; estos tokens eligen el rol dentro de ese aire.
        </p>
        <div className="mt-4">
          <AtmosphereTokensTable />
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-4")}>
          En Luz filtrada la elevada es blanco, no un paso de la rampa.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>
          Tokens funcionales
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          No cambian con la atmósfera. Dicen qué está ocurriendo.
        </p>
        <div className="mt-4">
          <FunctionalTokensTable />
        </div>
        <p className={cn(libraryDocPageDescriptionClass, "mt-4")}>
          {HANDBOOK_STATUS_TINT_RULE}
        </p>

        <h3
          id="funcionales-en-atmosferas"
          className={cn(libraryDocSubheadingClass, "mt-8 scroll-mt-24")}
        >
          Funcionales en atmósferas
        </h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          El vivo no cambia con la atmósfera. Cambia el ink: profundo sobre Luz filtrada,
          vivo sobre Sombra. El primario de Savia es el mismo en las dos luces.
        </p>
        <div className="mt-4">
          <FunctionalApplicationPreview />
        </div>
        <div className="mt-4">
          <FunctionalRecipeLegend />
        </div>
        <ul className="mt-4 max-w-3xl space-y-2">
          {HANDBOOK_FUNCTIONAL_APPLICATION_RULES.map((rule) => (
            <li key={rule} className={cn(libraryDocBodyClass, "text-sm")}>
              {rule}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <LibraryDoDontPair
            doText="CTA vivo 500 + 950. Secundario y link: profundo en Luz filtrada, vivo en Sombra."
            dontText="No uses texto 50 sobre un vivo, ni profundo como relleno de botón, ni Savia para pintar un fondo entero."
          />
        </div>

        <div className="mt-8">
          <LibraryDoDontPair
            doText="Nombrá el propósito y tomá el paso de la paleta. --color-accion es savia 500. --color-elevada en Luz filtrada es blanco."
            dontText="No pongas un hex a mano ni uses savia-50 como papel, lava para atención o savia para pintar un fondo entero."
          />
        </div>
      </section>

      <section
        id="contraste-y-legibilidad"
        className={handbookDocChapterClass}
      >
        <h2 className={libraryDocSectionTitleClass}>Contraste y legibilidad</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Objetivo mínimo: WCAG 2.1 AA. Texto normal pide 4.5:1. Texto grande o botón semibold
          pide 3:1 (AA grande). Los pares marcados No o AA grande en anti-patrones no se usan
          como cuerpo.
        </p>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Pares que pasan</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Combinaciones de la paleta, medidas con luminancia relativa.
        </p>
        <div className="mt-4">
          <ContrastPairsTable pairs={HANDBOOK_CONTRAST_PASS} />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Anti-patrones</h3>
        <p className={cn(libraryDocBodyClass, "mt-3")}>
          Tentadoras, ilegibles o apenas suficientes para un botón grande. No son pares de
          lectura.
        </p>
        <div className="mt-4">
          <ContrastPairsTable pairs={HANDBOOK_CONTRAST_FAIL} />
        </div>

        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Reglas rápidas</h3>
        <ul className={cn(libraryDocBodyClass, "mt-4 list-disc space-y-1.5 pl-5")}>
          {HANDBOOK_CONTRAST_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>

        <div className="mt-8">
          <LibraryDoDontPair
            doText="Medí el par en el contexto real: bruma 700 para muted claro, savia 700 si el CTA es chico, lava 600 para destructivo."
            dontText="No uses bruma 400 como cuerpo, ni blanco sobre sol 500, ni savia-50 como papel de Luz filtrada."
          />
        </div>
      </section>
    </article>
  )
}
