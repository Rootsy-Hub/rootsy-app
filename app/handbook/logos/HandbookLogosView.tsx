"use client"

import {
  HANDBOOK_LOGO_ANATOMY,
  HANDBOOK_LOGO_CLEARANCE,
  HANDBOOK_LOGO_GUIDELINES,
  HANDBOOK_LOGO_LOCKUPS,
  HANDBOOK_LOGO_PRINCIPLES,
  HANDBOOK_LOGOMARKS,
  HANDBOOK_POP_SPECIMEN,
  HANDBOOK_POP_VARIANTS,
  HANDBOOK_USER_GUIDELINES,
  HANDBOOK_USER_SPECIMEN,
  HANDBOOK_USER_VARIANTS,
} from "@/app/handbook/logos/handbookLogosSpec"
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
  libraryDocTokenAccentClass,
  handbookDocChapterClass,
  handbookDocIntroAfterClass,
} from "@/app/library/libraryColorTheme"
import { LibraryDoDontPair } from "@/app/library/libraryDocPrimitives"
import { Avatar } from "@/components/Avatar"
import { cn } from "@/lib/utils"

function Token({ children }: { children: string }) {
  return (
    <code className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
      {children}
    </code>
  )
}

const PREVIEW_BG: Record<string, { background: string; border?: string }> = {
  light: { background: "var(--rootsy-white)", border: "1px solid var(--color-borde)" },
  sombra: { background: "var(--rootsy-sombra-900)" },
  savia: { background: "var(--rootsy-savia-600)" },
  dark: { background: "var(--rootsy-sombra-950)" },
  neutral: {
    background: "var(--rootsy-bruma-100)",
    border: "1px solid var(--color-borde)",
  },
}

export function HandbookLogosView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Logotipos</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        Rootsy se reconoce por logomark + wordmark. Cada POP, por su foto y su nombre
        comercial. La persona, por su cara. Tres identidades en el mismo producto, sin
        prestársela.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_LOGO_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="anatomia" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Anatomía</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Logomark, wordmark y lockup para Rootsy. Avatar y nombre para el negocio. Círculo
          para quien opera.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_LOGO_ANATOMY.map((item) => (
            <article key={item.term} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.term}</p>
              <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {item.definition}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="rootsy" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Rootsy</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Inverse sobre savia o sombra. Brand sobre claro. Neutral en pies y watermarks. El
          logomark va solo cuando el nombre ya está escrito.
        </p>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Lockups</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {HANDBOOK_LOGO_LOCKUPS.map((logo) => (
            <article key={logo.id} className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
              <div
                className="flex min-h-24 items-center justify-center px-6 py-5"
                style={PREVIEW_BG[logo.previewBg]}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="px-4 py-3">
                <p className={libraryDocMetaLabelClass}>{logo.variant}</p>
                <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{logo.label}</p>
                <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                  {logo.usage}
                </p>
              </div>
            </article>
          ))}
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Logomarks</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_LOGOMARKS.map((mark) => (
            <article key={mark.id} className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
              <div
                className="flex min-h-24 items-center justify-center px-6 py-5"
                style={PREVIEW_BG[mark.previewBg]}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mark.src}
                  alt={mark.alt}
                  className="size-12 object-contain"
                />
              </div>
              <div className="px-4 py-3">
                <p className={libraryDocMetaLabelClass}>{mark.variant}</p>
                <p className={cn(libraryDocSectionTitleClass, "mt-1 text-sm")}>{mark.label}</p>
                <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                  {mark.usage}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className={cn("mt-6 font-stream text-sm", libraryDocMutedTextClass)}>
          Clearance ideal: {HANDBOOK_LOGO_CLEARANCE.rootsy.ideal} Mínimo:{" "}
          {HANDBOOK_LOGO_CLEARANCE.rootsy.minimum}
        </p>
      </section>

      <section id="pop" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>POP</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          El negocio se lee con foto y nombre. Círculo en home, cuadrado en header. El logo
          B/N de tickets es otro asset — no es el avatar.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <article className={cn("rounded-2xl border px-4 py-5", libraryDocBorderClass)}>
            <p className={libraryDocMetaLabelClass}>Home · picker</p>
            <div className="mt-4 flex flex-col items-center gap-3">
              <Avatar
                shape="circle"
                size="xl"
                tone="light"
                initials={HANDBOOK_POP_SPECIMEN.initials}
                imageUrl={HANDBOOK_POP_SPECIMEN.imageUrl}
                ariaLabel={HANDBOOK_POP_SPECIMEN.name}
              />
              <div className="text-center">
                <p className={cn(libraryDocSectionTitleClass, "text-sm")}>
                  {HANDBOOK_POP_SPECIMEN.name}
                </p>
                <p className={cn("mt-1 font-stream text-xs", libraryDocMutedTextClass)}>
                  {HANDBOOK_POP_SPECIMEN.address}
                </p>
              </div>
            </div>
          </article>
          <article className={cn("rounded-2xl border px-4 py-5", libraryDocBorderClass)}>
            <p className={libraryDocMetaLabelClass}>Header · workspace</p>
            <div
              className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              style={{ background: "var(--rootsy-sombra-900)" }}
            >
              <Avatar
                shape="square"
                size="md"
                tone="dark"
                initials={HANDBOOK_POP_SPECIMEN.initials}
                imageUrl={HANDBOOK_POP_SPECIMEN.imageUrl}
                ariaLabel={HANDBOOK_POP_SPECIMEN.name}
              />
              <p className="truncate font-canopy text-sm font-semibold text-[var(--rootsy-eter-50)]">
                {HANDBOOK_POP_SPECIMEN.name}
              </p>
            </div>
            <p className={cn("mt-4 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
              {HANDBOOK_LOGO_CLEARANCE.pop.ideal} {HANDBOOK_LOGO_CLEARANCE.pop.minimum}
            </p>
          </article>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HANDBOOK_POP_VARIANTS.map((variant) => (
            <article key={variant.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              {variant.id === "home-picker-initials" ? (
                <div className="mb-3">
                  <Avatar
                    shape="circle"
                    size="lg"
                    tone="light"
                    initials={HANDBOOK_POP_SPECIMEN.initials}
                    ariaLabel={HANDBOOK_POP_SPECIMEN.name}
                  />
                </div>
              ) : variant.id === "ticket-logo" ? (
                <div
                  className={cn(
                    "mb-3 flex h-16 items-center justify-center rounded-xl",
                    libraryDocSurfaceMutedClass,
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HANDBOOK_POP_SPECIMEN.ticketLogoUrl}
                    alt=""
                    className="h-8 w-auto object-contain"
                  />
                </div>
              ) : null}
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{variant.label}</p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {variant.usage}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="persona" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Persona</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Nombre, rol y foto son una sola persona. Círculo siempre. El menú se abre desde
          todo el bloque. Nunca el avatar del POP ni el logomark.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {HANDBOOK_USER_VARIANTS.map((variant) => (
            <article key={variant.id} className={cn("rounded-2xl border px-4 py-5", libraryDocBorderClass)}>
              <p className={libraryDocMetaLabelClass}>{variant.label}</p>
              <div
                className="mt-4 flex items-center justify-end gap-3 rounded-xl px-3 py-2.5"
                style={{ background: "var(--rootsy-sombra-900)" }}
              >
                <div className="min-w-0 text-right">
                  <p className="truncate font-canopy text-sm text-[var(--rootsy-eter-50)]">
                    {HANDBOOK_USER_SPECIMEN.name}
                  </p>
                  <p className="font-stream text-xs text-[var(--rootsy-bruma-400)]">
                    {HANDBOOK_USER_SPECIMEN.roleLabel}
                  </p>
                </div>
                <Avatar
                  shape="circle"
                  size={variant.id === "header-menu" ? "lg" : "md"}
                  tone="dark"
                  initials={HANDBOOK_USER_SPECIMEN.initials}
                  isOnline={HANDBOOK_USER_SPECIMEN.isOnline}
                  ariaLabel={HANDBOOK_USER_SPECIMEN.name}
                />
              </div>
              <p className={cn("mt-3 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {variant.usage}
              </p>
              <p className={cn("mt-2 font-stream text-xs", libraryDocMutedTextClass)}>
                {variant.tokens}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText={HANDBOOK_USER_GUIDELINES.do[0] ?? ""}
            dontText={HANDBOOK_USER_GUIDELINES.dont[0] ?? ""}
          />
        </div>
      </section>

      <section id="uso" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Uso</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Assets oficiales, proporciones fijas. El logo Rootsy no representa un POP. El
          avatar no es el logo de ticket.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>Hacer</p>
            <ul className={cn("mt-3 space-y-2 font-stream text-sm", libraryDocPrimaryTextClass)}>
              {HANDBOOK_LOGO_GUIDELINES.do.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>Evitar</p>
            <ul className={cn("mt-3 space-y-2 font-stream text-sm", libraryDocMutedTextClass)}>
              {HANDBOOK_LOGO_GUIDELINES.dont.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Lockup Rootsy sin estirar. Foto del POP en object-cover. Ticket en B/N aparte."
            dontText="No uses el logo Rootsy para un POP ni confundas imageUrl con invoiceLogoUrl."
          />
        </div>
      </section>
    </article>
  )
}
