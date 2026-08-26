"use client"

import {
  HANDBOOK_COMPONENT_PAGES,
  HANDBOOK_COMPONENT_SECTIONS,
  type HandbookComponentPageId,
} from "@/app/handbook/components/handbookComponentsSpec"
import {
  catalogEntriesForSection,
  HANDBOOK_CATALOG_KIND_LABEL,
} from "@/app/handbook/components/handbookComponentsCatalog"
import {
  HandbookCatalogCard,
  HandbookComponentPage,
  HandbookComponentSection,
} from "@/app/handbook/components/HandbookComponentsPrimitives"
import {
  AbsentSpecimen,
  CATALOG_SPECIMEN_BY_ID,
} from "@/app/handbook/components/HandbookComponentsSpecimens"
import { libraryDocMutedTextClass } from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

export function HandbookComponentsView({ pageId }: { pageId: HandbookComponentPageId }) {
  const page = HANDBOOK_COMPONENT_PAGES[pageId]
  const sections = HANDBOOK_COMPONENT_SECTIONS[pageId]
  const entryCount = sections.reduce(
    (sum, section) => sum + catalogEntriesForSection(section.id).length,
    0,
  )

  return (
    <HandbookComponentPage title={page.title} lead={page.lead} principles={page.principles}>
      <p className={cn("mt-6 font-stream text-sm leading-relaxed", libraryDocMutedTextClass)}>
        Inventario de lo que el producto usa hoy: {entryCount}{" "}
        {entryCount === 1 ? "componente" : "componentes"} en esta categoría. Un ejemplar por
        export — el contenido es neutro. Lo que cambia es la pieza, no el copy de cada pantalla.
      </p>
      {sections.map((section) => {
        const entries = catalogEntriesForSection(section.id)
        return (
          <HandbookComponentSection
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
            token={section.token}
            doText={section.doText}
            dontText={section.dontText}
          >
            {section.status === "absent" && section.absentNote ? (
              <AbsentSpecimen note={section.absentNote} />
            ) : (
              <div className="grid gap-6">
                {entries.map((entry) => {
                  const Specimen = CATALOG_SPECIMEN_BY_ID[entry.id]
                  return (
                    <HandbookCatalogCard
                      key={entry.id}
                      name={entry.name}
                      source={entry.source}
                      kind={entry.kind}
                      kindLabel={HANDBOOK_CATALOG_KIND_LABEL[entry.kind]}
                      variants={entry.variants}
                      usedIn={entry.usedIn}
                      note={entry.note}
                    >
                      {Specimen ? (
                        <Specimen />
                      ) : (
                        <AbsentSpecimen note="Todavía no hay ejemplar vivo de este export." />
                      )}
                    </HandbookCatalogCard>
                  )
                })}
              </div>
            )}
          </HandbookComponentSection>
        )
      })}
    </HandbookComponentPage>
  )
}
