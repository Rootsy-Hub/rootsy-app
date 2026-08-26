"use client"

import {
  getHandbookSectionMeta,
  type HandbookBlock,
} from "@/app/handbook/handbookSections"
import {
  libraryDocBodyClass,
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"

function HandbookTopicBlocks({ blocks }: { blocks: HandbookBlock[] }) {
  return (
    <div className="mt-4 space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={index} className={libraryDocBodyClass}>
              {block.text}
            </p>
          )
        }

        if (block.type === "h3") {
          return (
            <h3
              key={index}
              className={cn(libraryDocSectionTitleClass, index > 0 && "pt-2")}
            >
              {block.text}
            </h3>
          )
        }

        return (
          <ul key={index} className={cn(libraryDocBodyClass, "list-disc space-y-1.5 pl-5")}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )
      })}
    </div>
  )
}

export function HandbookSectionView({ sectionId }: { sectionId: string }) {
  const meta = getHandbookSectionMeta(sectionId)
  if (!meta) return null

  return (
    <article className="max-w-3xl">
      <h1 className={cn(libraryDocPageTitleClass, "text-2xl")}>{meta.title}</h1>

      <div className="mt-10">
        {meta.topics.map((topic) => (
          <section
            key={topic.id}
            id={topic.id}
            className="scroll-mt-24 border-t border-rootsy-bruma-200 py-10 first:border-t-0 first:pt-0"
          >
            <h2 className={cn(libraryDocSectionTitleClass, "text-base")}>{topic.title}</h2>
            {topic.blocks && topic.blocks.length > 0 ? (
              <HandbookTopicBlocks blocks={topic.blocks} />
            ) : (
              <p
                className={cn(
                  libraryDocPageDescriptionClass,
                  "mt-3 max-w-md italic",
                )}
              >
                Esta parte todavía se está formando.
              </p>
            )}
          </section>
        ))}
      </div>
    </article>
  )
}
