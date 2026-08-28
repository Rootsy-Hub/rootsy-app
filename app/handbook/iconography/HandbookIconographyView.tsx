"use client"

import {
  HANDBOOK_ICON_CATEGORIES,
  HANDBOOK_ICON_COLORS,
  HANDBOOK_ICON_GUIDELINES,
  HANDBOOK_ICON_LIBRARY,
  HANDBOOK_ICON_PRINCIPLES,
  HANDBOOK_ICON_SIZES,
  HANDBOOK_ICON_STYLE,
  HANDBOOK_ICON_VARIANTS,
} from "@/app/handbook/iconography/handbookIconographySpec"
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
  Add,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  Box,
  CloseCircle,
  DollarCircle,
  Edit,
  Element4,
  InfoCircle,
  Menu,
  Receipt,
  Refresh,
  Setting2,
  Shop,
  ShoppingCart,
  TickCircle,
  Trash,
  Warning2,
  type Icon,
} from "iconsax-reactjs"

const SAMPLE_ICONS: Icon[] = [ShoppingCart, Receipt, Setting2, Shop, Element4, TickCircle]

const CATEGORY_ICONS: Record<string, Icon[]> = {
  product: [Element4, Setting2, Shop],
  commerce: [ShoppingCart, Receipt, DollarCircle, Box],
  navigation: [ArrowRight2, ArrowDown2, ArrowLeft2, Menu],
  actions: [Add, Edit, Trash, TickCircle, CloseCircle],
  status: [TickCircle, Warning2, InfoCircle, Refresh],
}

function Token({ children }: { children: string }) {
  return (
    <code className={cn("text-[0.75rem] font-medium", libraryDocTokenAccentClass)}>
      {children}
    </code>
  )
}

export function HandbookIconographyView() {
  return (
    <article className="max-w-5xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>Iconografía</h1>
      <p className={cn(libraryDocBodyClass, "mt-4")}>
        Los íconos de Rootsy son señales de producto. {HANDBOOK_ICON_LIBRARY.name} en{" "}
        {HANDBOOK_ICON_LIBRARY.grid}, Linear por defecto, Bold cuando está activo. La
        identidad nature vive en color e ilustración — no en el trazo.
      </p>

      <div className={cn("mt-6 grid gap-3 sm:grid-cols-3", handbookDocIntroAfterClass)}>
        {HANDBOOK_ICON_PRINCIPLES.map((item) => (
          <div key={item.title} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
            <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{item.title}</p>
            <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>

      <section id="estilo" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Estilo</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          {HANDBOOK_ICON_LIBRARY.rationale} Frente, sin 3D. Color por token, nunca un hex
          suelto.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <article className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
            <div className={cn("flex flex-wrap items-center gap-4 px-5 py-6", libraryDocSurfaceMutedClass)}>
              {SAMPLE_ICONS.map((Glyph, index) => (
                <Glyph
                  key={index}
                  size={24}
                  variant="Linear"
                  color="var(--color-texto)"
                />
              ))}
            </div>
            <div className="px-5 py-4">
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>Linear · reposo</p>
              <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {HANDBOOK_ICON_STYLE.variantDefault}
              </p>
            </div>
          </article>
          <article className={cn("overflow-hidden rounded-2xl border", libraryDocBorderClass)}>
            <div className={cn("flex flex-wrap items-center gap-4 px-5 py-6", libraryDocSurfaceMutedClass)}>
              {SAMPLE_ICONS.map((Glyph, index) => (
                <Glyph
                  key={index}
                  size={24}
                  variant="Bold"
                  color="var(--color-accion)"
                />
              ))}
            </div>
            <div className="px-5 py-4">
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>Bold · activo</p>
              <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                {HANDBOOK_ICON_STYLE.variantActive}
              </p>
            </div>
          </article>
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Variantes</h3>
        <p className={cn(libraryDocPageDescriptionClass, "mt-3")}>
          Seis en el set. En producto, casi siempre Linear y Bold.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HANDBOOK_ICON_VARIANTS.map((variant) => (
            <div key={variant.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <p className={cn(libraryDocSectionTitleClass, "text-sm")}>{variant.label}</p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {variant.usage}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="Linear en la UI. Bold en nav activo. Misma variante en todo el módulo."
            dontText="No mezcles Linear, Bulk y TwoTone en la misma barra. Broken no entra a producto."
          />
        </div>
      </section>

      <section id="tamanos" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Tamaños</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Cuatro pasos. 16px cubre botones, nav e inputs. 12px es para chevrons y validación.
          20 y 24 no viven en una tabla.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HANDBOOK_ICON_SIZES.map((size) => (
            <article key={size.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
              <div className={cn("mb-4 flex h-16 items-center justify-center", libraryDocSurfaceMutedClass)}>
                <ShoppingCart size={size.px} variant="Linear" color="var(--color-texto)" />
              </div>
              <p className={libraryDocMetaLabelClass}>{size.label}</p>
              <p className={cn("mt-1 font-numeric text-lg tabular-nums", libraryDocPrimaryTextClass)}>
                {size.px}px
              </p>
              <p className="mt-1">
                <Token>{size.token}</Token>
              </p>
              <p className={cn("mt-2 font-stream text-xs leading-relaxed", libraryDocMutedTextClass)}>
                {size.usage}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="size={16} en UI. ArrowDown2 a 12px en selects. 24px solo en tiles."
            dontText="No pongas un ícono de 24px inline en una fila de tabla ni un chevron de 16px en un trigger compacto."
          />
        </div>
      </section>

      <section id="uso" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Uso</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          Metáforas que el usuario ya conoce. Ícono junto al texto, con{" "}
          <Token>space.100</Token> de gap. Si la palabra alcanza, no hace falta el glifo.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {HANDBOOK_ICON_CATEGORIES.map((category) => {
            const glyphs = CATEGORY_ICONS[category.id] ?? []
            return (
              <article key={category.id} className={cn("rounded-2xl border px-4 py-4", libraryDocBorderClass)}>
                <div className="flex items-center gap-3">
                  {glyphs.map((Glyph, index) => (
                    <Glyph
                      key={index}
                      size={category.id === "navigation" ? 12 : 16}
                      variant="Linear"
                      color="var(--color-texto)"
                    />
                  ))}
                </div>
                <p className={cn(libraryDocSectionTitleClass, "mt-3 text-sm")}>{category.label}</p>
                <p className={cn("mt-2 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
                  {category.usage}
                </p>
                <p className={cn("mt-2 font-mono text-[0.75rem]", libraryDocMutedTextClass)}>
                  {category.examples.join(" · ")}
                </p>
              </article>
            )
          })}
        </div>
        <h3 className={cn(libraryDocSubheadingClass, "mt-8")}>Guías</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {HANDBOOK_ICON_GUIDELINES.map((guide) => (
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
            doText="Buscá en Iconsax antes de inventar. Botón con ícono y label. Gap de 8px."
            dontText="No uses un SVG custom ni un ícono solo, sin aria-label, en una acción poco obvia."
          />
        </div>
      </section>

      <section id="estados" className={handbookDocChapterClass}>
        <h2 className={libraryDocSectionTitleClass}>Estados</h2>
        <p className={cn(libraryDocBodyClass, "mt-4")}>
          El color nombra el rol. Neutro junto al texto. Savia en la acción. Subtle cuando no
          pesa. Danger, warning e info no se improvisan.
        </p>
        <div className="mt-6">
          <div className={libraryDocTableShellOverflowClass}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className={libraryDocTableHeaderClass}>
                  <th className="px-3 py-2.5">Muestra</th>
                  <th className="px-3 py-2.5">Rol</th>
                  <th className="px-3 py-2.5">Token</th>
                  <th className="px-3 py-2.5">Uso</th>
                </tr>
              </thead>
              <tbody>
                {HANDBOOK_ICON_COLORS.map((role) => (
                  <tr key={role.id} className={libraryDocTableRowClass}>
                    <td className="px-3 py-2.5">
                      <TickCircle size={16} variant="Linear" color={role.hex} />
                    </td>
                    <td className={cn("px-3 py-2.5 font-canopy text-sm font-semibold", libraryDocPrimaryTextClass)}>
                      {role.label}
                    </td>
                    <td className="px-3 py-2.5">
                      <Token>{role.token}</Token>
                    </td>
                    <td className={cn("px-3 py-2.5 font-stream text-sm", libraryDocMutedTextClass)}>
                      {role.usage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className={cn(libraryDocBodyClass, "mt-6")}>
          Linear en reposo. Bold cuando el ítem está on. Inverse sobre savia o shell oscuro.
          Los loaders respetan reduced-motion.
        </p>
        <div className="mt-8">
          <LibraryDoDontPair
            doText="icon.color.brand en el CTA. icon.color.subtle en metadata. currentColor + token."
            dontText="No pongas un hex a mano ni un ícono de error en lava si el rol es aviso."
          />
        </div>
      </section>
    </article>
  )
}
